import type { User } from './auth.types';
import type { JE } from './je.types';

export interface Participant {
  id: number;
  role: ParticipantRole;
  privacy: number;
  firstName: string | null;
  lastName: string | null;
  sexe: string | null;
  phone: string | null;
  birthdate: Date | null;
  linkedinLink: string | null;
  cinPassport: string | null;
  about: string | null;
  payDate: Date | null;
  firstPayDate: Date | null;
  placeName: string | null;
  approvedAt: Date | null;
  approvedBy: number | null;
  userId: number;
  jeId: number | null;
  user: User; // User is always present for participants
  je?: Partial<JE>; // Partial because we only get basic JE info with participants
  paymentStatus: string; // Add this line
}

// Form data interfaces for creating and updating participants
export interface CreateParticipantFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: ParticipantRole;
  sexe?: 'M' | 'F';
  phone?: string;
  birthdate?: string; // ISO date string
  linkedinLink?: string;
  cinPassport?: string;
  about?: string;
  jeId: number;
}

export interface UpdateParticipantFormData {
  firstName?: string;
  lastName?: string;
  role?: ParticipantRole;
  sexe?: 'M' | 'F';
  phone?: string;
  birthdate?: string; // ISO date string
  linkedinLink?: string;
  cinPassport?: string;
  about?: string;
  jeId?: number;
}

export enum ParticipantRole {
  MEMBRE_JUNIOR = 'MEMBRE_JUNIOR',
  MEMBRE_SENIOR = 'MEMBRE_SENIOR',
  RESPONSABLE = 'RESPONSABLE',
  QUARTET = 'QUARTET',
  CDM = 'CDM',
  ALUMNUS = 'ALUMNUS',
  ALUMNA = 'ALUMNA',
  BUREAU_NATIONAL = 'BUREAU_NATIONAL',
  INTERNATIONAL_GUEST = 'INTERNATIONAL_GUEST',
  SPEAKER = 'SPEAKER',
  OC = 'OC',
}
