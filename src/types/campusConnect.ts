export type UserRole = 'customer' | 'provider' | 'admin';

export type ProviderVerificationStatus = 'pending' | 'approved' | 'rejected';

export type ServiceCategory =
  | 'Electrician'
  | 'Plumber'
  | 'Laptop Repair'
  | 'Home Cleaning'
  | 'Tutor'
  | 'Laundry'
  | 'Carpenter';

export interface CustomerUser {
  id: string;
  role: 'customer';
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  address?: string;
  createdAt: string;
}

export interface ProviderUser {
  id: string;
  role: 'provider';
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  serviceCategory: ServiceCategory;
  serviceArea: string;
  experienceYears: number;
  avatarUrl: string;
  verificationStatus: ProviderVerificationStatus;
  verificationNotes?: string;
  rating: number;
  completedJobs: number;
  hourlyRate: number; // in Rupees
  createdAt: string;
}

export interface AdminUser {
  id: string;
  role: 'admin';
  fullName: string;
  email: string;
  department: string;
  avatarUrl?: string;
  createdAt: string;
}

export type AuthUser = CustomerUser | ProviderUser | AdminUser;

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}
