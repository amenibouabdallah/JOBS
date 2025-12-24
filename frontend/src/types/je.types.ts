// JE (Junior-Entreprise) related types
export interface JE {
  id: number;
  name: string;
  phone?: string;
  code: string;
  checkIn?: string;
  checkedOut?: string;
  reservedZoneId?: number;
  userId: number;
  user: {
    id: number;
    email: string;
    role: string;
    status: string;
    isOAuth: boolean;
    img?: string;
    createdAt: string;
    updatedAt: string;
  };
  participants: any[];
  paymentSheets: any[];
  reclamations: any[];
  _count: {
    participants: number;
  };
}

export interface CreateJEFormData {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateJEFormData {
  name?: string;
  phone?: string;
}

export interface JECredentials {
  email: string;
  password: string;
}

export interface GenerateJEsResult {
  generated: number;
  skipped: number;
  details?: string[];
}
