// Auth types matching backend exactly
export type UserRole = 'ADMIN' | 'PARTICIPANT' | 'JE';

export type UserStatus = 'CREATED' | 'VERIFIED' | 'APPROVED';

export type ParticipantRole = 
  | 'MEMBRE_JUNIOR'
  | 'MEMBRE_SENIOR' 
  | 'RESPONSABLE'
  | 'QUARTET'
  | 'CDM'
  | 'ALUMNUS'
  | 'ALUMNA'
  | 'BUREAU_NATIONAL'
  | 'INTERNATIONAL_GUEST'
  | 'OC';

export interface JE {
  id: number;
  userId: number;
  name: string;
  code: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  status: UserStatus;
  isOAuth: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional profile data
  password?: string;
  googleId?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  img?: string;
  je?: JE;
}

export interface Participant {
  id: number;
  role: ParticipantRole;
  firstName?: string;
  lastName?: string;
  sexe?: string;
  phone?: string;
  birthdate?: string;
  linkedinLink?: string;
  cinPassport?: string;
  about?: string;
  userId: number;
  jeId?: number;
  user: User;
}

// Auth DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password?: string; // Optional for OAuth users
  role: UserRole;
  isOAuth?: boolean; // Flag for OAuth users
  googleId?: string; // For Google OAuth users
  img?: string; // Profile image
  // Participant specific fields
  firstName?: string;
  lastName?: string;
  phone?: string;
  participantRole?: ParticipantRole;
  sexe?: string;
  birthdate?: string;
  linkedinLink?: string;
  cinPassport?: string;
  jeName?: string;
  jeCode?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  status?: string;
  message?: string;
  // For incomplete profiles
  initialToken?: string;
  userId?: number;
  profileComplete?: boolean;
  // Legacy fields
  needsRegistration?: boolean;
  userData?: {
    userId?: number;
    email: string;
    firstName?: string;
    lastName?: string;
    img?: string;
    googleId?: string;
    isGoogleSignup?: boolean;
    needsCompletion?: boolean;
  };
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
  confirmPassword: string;
}

// Step-by-step signup data
export interface SignupStepData {
  // Step 1: Authentication
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Personal Info
  firstName: string;
  lastName: string;
  phone?: string;
  sexe?: 'M' | 'F';
  birthdate?: string;
  
  // Step 3: Professional Info
  participantRole: ParticipantRole;
  linkedinLink?: string;
  cinPassport?: string;
  about?: string;
  
  // Step 4: JE Association
  jeCode?: string;
}
