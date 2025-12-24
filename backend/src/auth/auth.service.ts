import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ParticipantService } from '../participant/participant.service';
import { JeService } from '../je/je.service';
import { MailService } from '../mail/mail.service';
import { User, UserRole, UserStatus, ParticipantRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import * as crypto from 'crypto';

export interface CreateUserDto {
  email: string;
  password?: string;
  role: UserRole;
  googleId?: string;
  isOAuth?: boolean;
  img?: string;
}

export interface RegisterDto {
  email: string;
  password?: string;
  role: UserRole;
  isOAuth?: boolean;
  googleId?: string;
  img?: string;
  // Participant specific fields
  firstName?: string;
  lastName?: string;
  phone?: string;
  participantRole?: string;
  sexe?: string;
  birthdate?: string;
  linkedinLink?: string;
  cinPassport?: string;
  jeCode?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface GoogleUserDto {
  email: string;
  googleId: string;
  firstName?: string;
  lastName?: string;
  img?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private participantService: ParticipantService,
    private jeService: JeService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status for credential-based login
    if (user.status === UserStatus.CREATED) {
      return {
        message: 'Please complete your registration',
        status: 'created',
        userId: user.id,
      };
    }

    if (user.status === UserStatus.VERIFIED) {
      return {
        message: 'Your account is pending approval',
        status: 'verified',
        userId: user.id,
      };
    }

    const tokens = await this.generateTokens(user);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userService.update(user.id, { refreshToken: hashedRefreshToken });

    return {
      ...tokens,
      user: await this.getProfile(user.id),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    
    // If user exists but profile incomplete, return initialToken to continue
    if (existingUser) {
      const userWithParticipant = await prisma.user.findUnique({
        where: { id: existingUser.id },
        include: { participants: true },
      });
      
      const isComplete = this.isProfileComplete(userWithParticipant);
      
      if (isComplete) {
        throw new ConflictException('User already exists with complete profile');
      }
      
      // Profile incomplete - return initialToken
      const initialToken = await this.generateInitialToken(existingUser);
      return {
        initialToken,
        userId: existingUser.id,
        email: existingUser.email,
        profileComplete: false,
      };
    }

    let hashedPassword;
    if (registerDto.password && !registerDto.isOAuth) {
      hashedPassword = await bcrypt.hash(registerDto.password, 10);
    }

    const user = await this.userService.create({
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role,
      googleId: registerDto.googleId,
      isOAuth: registerDto.isOAuth,
      img: registerDto.img,
    });

    // Create minimal participant record for PARTICIPANT role
    if (registerDto.role === UserRole.PARTICIPANT) {
      await this.participantService.createMinimal(user.id);
    }

    // Return initialToken for new user to complete profile
    const initialToken = await this.generateInitialToken(user);
    return {
      initialToken,
      userId: user.id,
      email: user.email,
      profileComplete: false,
    };
  }

  async validateOAuthLogin(profile: GoogleUserDto): Promise<User> {
    // Check if user exists first
    const existingUser = await prisma.user.findUnique({
      where: { email: profile.email },
      include: { participants: true },
    });

    if (existingUser) {
      // User exists, just update Google info if needed
      return prisma.user.update({
        where: { id: existingUser.id },
        data: {
          googleId: profile.googleId,
          img: profile.img,
        },
        include: { participants: true },
      });
    }

    // Create new user with minimal participant data
    // OAuth users are auto-verified (email confirmed by Google)
    const user = await prisma.user.create({
      data: {
        email: profile.email,
        googleId: profile.googleId,
        isOAuth: true,
        role: UserRole.PARTICIPANT,
        status: UserStatus.VERIFIED, // OAuth users skip email verification
        img: profile.img,
        participants: {
          create: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            role: ParticipantRole.MEMBRE_JUNIOR, // Required field
          },
        },
      },
      include: {
        participants: true,
      },
    });
    return user;
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(user);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userService.update(user.id, { refreshToken: hashedRefreshToken });

    return {
      ...tokens,
      user: await this.getProfile(user.id),
    };
  }

  /**
   * Check if user profile is complete
   * 
   * Architecture Pattern: Profile Completion Check
   * -----------------------------------------------
   * This method is called by the auth controller to determine routing:
   * - If complete → Return tokens → User logs in → Dashboard
   * - If incomplete → Redirect to /signup/complete → User fills profile
   * 
   * This is BACKEND-DRIVEN logic - the controller decides where to redirect
   * Frontend middleware only checks token presence, not profile state
   */
  isProfileComplete(user: User & { participants: any[] }): boolean {
    if (!user.participants || user.participants.length === 0) {
      return false;
    }
    
    const participant = user.participants[0];
    
    // Check required fields for complete profile
    return !!(
      participant.firstName &&
      participant.lastName &&
      participant.sexe &&
      participant.phone &&
      participant.birthdate &&
      participant.cinPassport &&
      participant.jeId &&
      user.agreedTerms
    );
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        participants: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, refreshToken, ...userProfile } = user;

    let je = null;
    if (user.role === UserRole.JE) {
      je = await this.jeService.findByUserId(userId);
    }

    // Don't flatten - keep nested structure
    return {
      ...userProfile,
      participant: user.participants?.[0] || null,
      je: je, // Include JE data if available
      isProfileComplete: this.isProfileComplete(user),
    };
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role, img: user.img };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'default-secret-key',
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '30m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key',
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate initial token for incomplete profiles
   * 
   * Architecture Pattern: Initial Token System
   * -------------------------------------------
   * This token allows users with incomplete profiles to access
   * ONLY the complete-profile endpoint. It has a short expiry
   * and contains a special flag to identify it.
   */
  async generateInitialToken(user: User) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      img: user.img,
      isInitial: true // Flag to identify this as an initial token
    };
    
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'default-secret-key',
      expiresIn: '1h', // Short expiry for security
    });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal if user exists
      return { message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000 * 48); // 48 hours

    await this.userService.update(user.id, {
      resetToken,
      resetTokenExpiry,
    });

    // Send email
    // We need to fetch the user with participants to get the name
    const userWithProfile = await this.userService.findById(user.id);
    const name = userWithProfile?.participants?.[0]?.firstName || 'Utilisateur';
    
    await this.mailService.sendPasswordResetEmail({ email: user.email, name }, resetToken);

    return { message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, confirmPassword } = resetPasswordDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    let user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    // If not found by resetToken, check if it's a valid initialToken (JWT)
    if (!user) {
      try {
        const decoded = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET || 'default-secret-key',
        });

        if (decoded.isInitial) {
          user = await prisma.user.findUnique({ where: { id: decoded.sub } });
        }
      } catch (e) {
        // Token is not a valid JWT or verification failed
      }
    }

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userService.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async updateProfile(userId: number, updateData: any) {
    // Extract participant-specific data
    const {
      firstName,
      lastName,
      phone,
      sexe,
      birthdate,
      linkedinLink,
      cinPassport,
      participantRole,
      jeCode,
      img,
      ...userData
    } = updateData;

    // Update user data (img, agreedTerms, etc.)
    if (img || userData.agreedTerms !== undefined) {
      await this.userService.update(userId, {
        ...(img && { img }),
        ...(userData.agreedTerms !== undefined && { agreedTerms: userData.agreedTerms }),
      });
    }

    // Find or create participant
    let participant = await prisma.participant.findFirst({
      where: { userId },
    });

    // Find JE if jeCode provided
    let jeId: number | undefined;
    if (jeCode) {
      const je = await this.jeService.findByCode(jeCode);
      if (je) jeId = je.id;
    }

    const participantData = {
      firstName,
      lastName,
      phone,
      sexe,
      birthdate: birthdate ? new Date(birthdate) : undefined,
      linkedinLink,
      cinPassport,
      role: participantRole || ParticipantRole.MEMBRE_JUNIOR,
      jeId,
    };

    if (participant) {
      // Update existing participant
      participant = await prisma.participant.update({
        where: { id: participant.id },
        data: participantData,
      });
    } else {
      // Create new participant
      participant = await prisma.participant.create({
        data: {
          userId,
          ...participantData,
        },
      });
    }

    // Return updated profile
    return this.getProfile(userId);
  }

  /**
   * Complete user profile after registration
   * 
   * Architecture Pattern: Profile Completion Flow
   * ----------------------------------------------
   * Status transitions:
   * - OAuth users: Already VERIFIED (set in validateOAuthLogin)
   * - Credential users: CREATED → Stay CREATED (need email verification)
   * 
   * After profile completion:
   * - Credential users: Send verification email
   * - OAuth users: Already verified, wait for JE approval
   */
  async completeProfile(userId: number, updateData: any) {
    // Update profile using existing method
    await this.updateProfile(userId, updateData);

    // Verify profile is now complete
    const userWithParticipant = await prisma.user.findUnique({
      where: { id: userId },
      include: { participants: true },
    });

    const isComplete = this.isProfileComplete(userWithParticipant);
    
    if (!isComplete) {
      throw new BadRequestException('Profile is still incomplete. Please provide all required fields.');
    }

    // Check if OAuth user (already verified) or credential user (needs verification)
    if (userWithParticipant.isOAuth) {
      // OAuth user - already VERIFIED, waiting for JE approval
      return {
        message: 'Profil complété. Attendez la validation de votre JE.',
        success: true,
        status: 'verified',
      };
    } else {
      // Credential user - send verification email
      // TODO: Implement email sending here
      return {
        message: 'Profil complété. Vérifiez votre email pour confirmer votre compte.',
        success: true,
        status: 'created',
      };
    }
  }
}
