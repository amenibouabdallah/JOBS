import { ParticipantRole } from './auth.types';

export interface SignupFormData {
  // Step 1: Authentication
  email: string;
  password?: string; // Make optional for Google signup
  confirmPassword?: string; // Make optional for Google signup
  
  // Step 2: Personal Info
  firstName: string;
  lastName: string;
  phone?: string;
  birthdate?: string;
  sexe?: 'M' | 'F';
  cinPassport?: string;
  linkedinLink?: string;
  profileImage?: string;
  
  // Step 3: JE Association
  selectedJEId?: string;
  participantRole?: ParticipantRole;
  jeCode?: string;
  agreedTerms: boolean;
}

export interface StepDefinition {
  id: number;
  title: string;
  description: string;
}
