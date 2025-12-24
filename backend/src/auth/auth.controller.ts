import { Controller, Post, Body, UseGuards, Get, Req, Res, HttpStatus, Put, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { UserService } from '../user/user.service';
import { UserStatus } from '@prisma/client';

/**
 * Auth Controller
 * 
 * Architecture: Backend-Driven Authentication & Authorization
 * ----------------------------------------------------------
 * - ALL routes are protected by default via Global JwtAuthGuard (see app.module.ts)
 * - Public routes marked with @Public() decorator
 * - Guards handle authentication (valid token)
 * - Business logic (profile completion, redirects) handled here
 * - Frontend has NO middleware - relies entirely on backend decisions
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(req.user);
    res.status(HttpStatus.OK).json(result);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const user = req.user;
    
    // Get full user profile with participant data
    const userProfile = await this.authService.getProfile(user.id);
    const url = new URL(`${process.env.FRONTEND_URL}/auth/google/callback`);
    
    // Check if profile is complete
    if (!userProfile.isProfileComplete) {
      // Profile incomplete, generate initialToken and redirect to complete
      const initialToken = await this.authService.generateInitialToken(user);
      const completeUrl = new URL(`${process.env.FRONTEND_URL}/signup/complete`);
      completeUrl.searchParams.set('initialToken', initialToken);
      completeUrl.searchParams.set('userId', user.id.toString());
      
      res.redirect(completeUrl.toString());
      return;
    }
    
    // Profile is complete - check status
    if (user.status === UserStatus.CREATED) {
      // Email not verified
      url.searchParams.set('status', 'created');
      url.searchParams.set('message', 'Vérifiez votre email via le lien envoyé par mail');
      res.redirect(url.toString());
      return;
    }
    
    if (user.status === UserStatus.VERIFIED) {
      // Email verified but not approved by JE admin
      url.searchParams.set('status', 'verified');
      url.searchParams.set('message', 'Attendez la validation de votre JE');
      res.redirect(url.toString());
      return;
    }
    
    if (user.status === UserStatus.APPROVED) {
      // Approved - generate tokens and allow access
      const tokens = await this.authService.login(user);
      
      if ('accessToken' in tokens) {
        url.searchParams.set('accessToken', tokens.accessToken);
        url.searchParams.set('refreshToken', tokens.refreshToken);
        url.searchParams.set('status', 'approved');
      }
      
      res.redirect(url.toString());
      return;
    }
    
    // Fallback
    url.searchParams.set('error', 'Unknown status');
    res.redirect(url.toString());
  }

  // Protected by global JwtAuthGuard - no @UseGuards needed
  @Get('me')
  async getProfile(@CurrentUser('sub') userId: number) {
    return this.authService.getProfile(userId);
  }

  // Protected by global JwtAuthGuard - no @UseGuards needed
  @Put('me')
  async updateProfile(@CurrentUser('sub') userId: number, @Body() updateData: any) {
    return this.authService.updateProfile(userId, updateData);
  }

  /**
   * Complete profile and exchange initialToken for full tokens
   * This endpoint accepts initialToken (validated by InitialTokenGuard)
   * and returns full access/refresh tokens after profile completion
   */
  @Public() // Public because we'll validate initialToken manually
  @Post('complete-profile')
  async completeProfile(@Body() body: { initialToken: string; profileData: any }) {
    // Decode and validate initialToken
    try {
      const decoded = await this.authService['jwtService'].verifyAsync(body.initialToken, {
        secret: process.env.JWT_SECRET || 'default-secret-key',
      });

      if (!decoded.isInitial) {
        throw new UnauthorizedException('Invalid initial token');
      }

      // Complete profile and get full tokens
      return this.authService.completeProfile(decoded.sub, body.profileData);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired initial token');
    }
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshToken(@Req() req) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshToken(userId, refreshToken);
  }

  // Protected by global JwtAuthGuard - no @UseGuards needed
  @Post('logout')
  async logout(@CurrentUser('sub') userId: number, @Res({ passthrough: true }) res: Response) {
    await this.userService.update(userId, { refreshToken: null });
    res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}