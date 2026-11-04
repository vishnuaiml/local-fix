export type UserRole = 'customer' | 'provider' | 'admin';

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'on_the_way'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'refunded';

export type VerificationStatus = 'verified' | 'pending' | 'rejected';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  city: string;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string; // 'Home' | 'Work' | 'Other'
  street: string;
  area: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  nameTa?: string; // Tamil translation
  slug: string;
  iconName: string;
  description: string;
  startingPricePaise: number;
  popular: boolean;
  image: string;
  serviceCount: number;
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  name: string;
  nameTa?: string;
  description: string;
  durationMinutes: number;
  pricePaise: number;
  popular?: boolean;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  name: string;
  businessName: string;
  bio: string;
  phone: string;
  email: string;
  avatarUrl: string;
  city: string;
  serviceAreas: string[];
  primaryCategory: string;
  categoryIds: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  startingPricePaise: number;
  verificationStatus: VerificationStatus;
  subscriptionTier: SubscriptionTier;
  isFeatured: boolean;
  leadCredits: number;
  portfolioPhotos: string[];
  certifications: string[];
  workingHours: {
    start: string; // "09:00"
    end: string; // "19:00"
    days: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  };
  commissionRatePercent: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  orderNumber: string; // e.g. LF-89241
  customerId: string;
  customerName: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  providerPhone: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 - 11:00 AM"
  status: BookingStatus;
  address: CustomerAddress;
  problemDescription: string;
  servicePricePaise: number;
  addOnsPricePaise: number;
  platformFeePaise: number;
  taxesPaise: number; // 18% GST on platform fee + service
  totalAmountPaise: number;
  commissionAmountPaise: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'cash_on_delivery' | 'upi' | 'card';
  createdAt: string;
  updatedAt: string;
  completionConfirmedByCustomer?: boolean;
  ratingSubmitted?: boolean;
}

export interface BookingStatusHistoryItem {
  id: string;
  bookingId: string;
  status: BookingStatus;
  timestamp: string;
  note: string;
  changedBy: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerCity: string;
  providerId: string;
  serviceName: string;
  rating: number;
  comment: string;
  createdAt: string;
  providerReply?: string;
  flagged?: boolean;
}

export interface ProviderVerificationDocument {
  id: string;
  providerId: string;
  docType: 'aadhaar' | 'pan' | 'trade_license' | 'skill_certificate';
  docNumber: string;
  documentUrl: string;
  status: VerificationStatus;
  submittedAt: string;
  notes?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  priceMonthlyPaise: number;
  commissionRatePercent: number; // e.g., Free: 15%, Pro: 8%, Enterprise: 5%
  leadCreditsIncluded: number;
  badge: string;
  features: string[];
}

export interface PlatformComplaint {
  id: string;
  bookingId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  subject: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  resolutionNotes?: string;
  createdAt: string;
}

export interface AdminMetrics {
  totalBookings: number;
  completedBookings: number;
  activeBookings: number;
  gmvPaise: number;
  platformRevenuePaise: number;
  activeProviders: number;
  pendingVerifications: number;
  totalCustomers: number;
  defaultCommissionPercent: number;
}
