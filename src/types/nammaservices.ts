/**
 * NammaServices: Local Services Booking Marketplace
 * Core Domain Models & Types
 * Tagline: "Ungal Area, Ungal Services."
 */

export type UserRole = 'customer' | 'provider' | 'admin';

export type AccountStatus = 'active' | 'deactivated' | 'suspended';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type BookingStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type ComplaintStatus = 'Open' | 'Under Review' | 'Resolved' | 'Dismissed';

export type ServiceCategory =
  | 'Electrician'
  | 'Plumber'
  | 'Home Cleaning'
  | 'Laptop and Computer Repair'
  | 'Mobile Repair'
  | 'Washing Machine and Appliance Repair'
  | 'Tutor'
  | 'Laundry'
  | 'Carpenter'
  | 'Painting'
  | 'Pest Control'
  | 'Other Local Services';

export const ALL_CATEGORIES: ServiceCategory[] = [
  'Electrician',
  'Plumber',
  'Home Cleaning',
  'Laptop and Computer Repair',
  'Mobile Repair',
  'Washing Machine and Appliance Repair',
  'Tutor',
  'Laundry',
  'Carpenter',
  'Painting',
  'Pest Control',
  'Other Local Services',
];

export const POPULAR_LOCALITIES = [
  'All Areas',
  'T. Nagar',
  'Velachery',
  'Anna Nagar',
  'Adyar',
  'Mylapore',
  'Tambaram',
  'OMR / Perungudi',
  'Porur',
  'Thiruvanmiyur',
  'Chromepet',
  'Guindy',
];

export interface Customer {
  id: string;
  role: 'customer';
  full_name: string;
  email: string;
  phone_number: string;
  account_status: AccountStatus;
  avatar_url?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  role: 'provider';
  full_name: string;
  business_name: string;
  email: string;
  phone_number: string;
  service_category: ServiceCategory;
  service_description: string;
  service_area: string;
  experience_years: number;
  verification_status: VerificationStatus;
  verification_notes?: string;
  account_status: AccountStatus;
  avatar_url?: string;
  hourly_rate: number;
  rating: number;
  completed_jobs: number;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  role: 'admin';
  full_name: string;
  email: string;
  department: string;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export type AuthUser = Customer | Provider | Admin;

export interface ServiceItem {
  id: string;
  provider_id: string;
  service_name: string;
  category: ServiceCategory;
  description: string;
  indicative_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id?: string;
  service_description: string;
  service_location: string;
  preferred_date: string;
  preferred_time: string;
  booking_status: BookingStatus;
  customer_notes?: string;
  provider_response?: string;
  indicative_price: number;
  customer_name?: string;
  customer_phone?: string;
  provider_name?: string;
  provider_business_name?: string;
  provider_phone?: string;
  service_category?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number; // 1 to 5
  review_text: string;
  customer_name?: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  booking_id?: string;
  customer_id: string;
  provider_id: string;
  complaint_description: string;
  complaint_status: ComplaintStatus;
  admin_notes?: string;
  customer_name?: string;
  provider_business_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderAvailability {
  id: string;
  provider_id: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

export interface DatabaseStatus {
  engine: 'PostgreSQL' | 'TiDB Cloud Serverless (MySQL 8.0)' | 'In-Memory Engine (Dev Fallback)';
  databaseName: string;
  connected: boolean;
  host: string;
  port: number;
  tables: {
    customers: number;
    providers: number;
    admins: number;
    services: number;
    bookings: number;
    reviews: number;
    complaints: number;
    [tableName: string]: number;
  };
}
