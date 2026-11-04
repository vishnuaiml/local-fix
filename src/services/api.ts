/**
 * NammaServices: Centralized Frontend API Client
 * Connects frontend forms and dashboards to real backend endpoints.
 */

import {
  AuthResponse,
  AuthUser,
  Customer,
  Provider,
  ServiceItem,
  Booking,
  Review,
  Complaint,
  DatabaseStatus,
  BookingStatus,
  ComplaintStatus,
} from '../types/nammaservices';

const TOKEN_KEY = 'nammaservices_token';
const USER_KEY = 'nammaservices_user';
const ROLE_KEY = 'nammaservices_role';

export const nammaApi = {
  // Session storage helpers
  saveSession(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ROLE_KEY, user.role);
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  },

  getStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredRole(): string | null {
    return localStorage.getItem(ROLE_KEY);
  },

  // 1. Auth APIs
  async registerCustomer(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    address?: string;
  }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/customer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success && result.token && result.user) {
      this.saveSession(result.token, result.user);
    }
    return result;
  },

  async loginCustomer(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (result.success && result.token && result.user) {
      this.saveSession(result.token, result.user);
    }
    return result;
  },

  async loginWithGoogle(
    idToken: string,
    portalRole: 'customer' | 'provider' | 'admin' = 'customer'
  ): Promise<AuthResponse> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, portalRole }),
    });
    const result = await res.json();
    if (result.success && result.token && result.user) {
      this.saveSession(result.token, result.user);
    }
    return result;
  },

  async registerProvider(data: {
    fullName: string;
    businessName: string;
    email: string;
    phone: string;
    serviceCategory: string;
    serviceArea: string;
    experienceYears: number;
    serviceDescription: string;
    password: string;
    confirmPassword: string;
    avatarUrl?: string;
  }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/provider/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success && result.token && result.user) {
      this.saveSession(result.token, result.user);
    }
    return result;
  },

  async loginProvider(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/provider/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (result.success && result.token && result.user) {
      this.saveSession(result.token, result.user);
    }
    return result;
  },

  async loginAdmin(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (result.success && result.token && result.user) {
      this.saveSession(result.token, result.user);
    }
    return result;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors
    }
    this.clearSession();
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  // 2. Providers
  async getProviders(filters?: {
    category?: string;
    area?: string;
    search?: string;
    maxPrice?: number;
  }): Promise<{ success: boolean; providers: Provider[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'All') params.set('category', filters.category);
    if (filters?.area && filters.area !== 'All Areas') params.set('area', filters.area);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice));

    const res = await fetch(`/api/providers?${params.toString()}`);
    return res.json();
  },

  async getProviderById(id: string): Promise<{
    success: boolean;
    provider?: Provider;
    services?: ServiceItem[];
    reviews?: Review[];
    message?: string;
  }> {
    const res = await fetch(`/api/providers/${id}`);
    return res.json();
  },

  async updateProviderProfile(id: string, updates: Partial<Provider>): Promise<{ success: boolean; provider?: Provider; message?: string }> {
    const res = await fetch('/api/providers/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    return res.json();
  },

  // 3. Bookings
  async createBooking(bookingData: {
    customer_id: string;
    provider_id: string;
    service_id?: string;
    service_description: string;
    service_location: string;
    preferred_date: string;
    preferred_time: string;
    customer_notes?: string;
    indicative_price?: number;
  }): Promise<{ success: boolean; booking?: Booking; message: string }> {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    return res.json();
  },

  async getCustomerBookings(customerId: string): Promise<{ success: boolean; bookings: Booking[] }> {
    const res = await fetch(`/api/bookings/my-bookings?customerId=${encodeURIComponent(customerId)}`);
    return res.json();
  },

  async getProviderBookings(providerId: string): Promise<{ success: boolean; bookings: Booking[] }> {
    const res = await fetch(`/api/providers/bookings?providerId=${encodeURIComponent(providerId)}`);
    return res.json();
  },

  async updateBookingStatus(
    id: string,
    status: BookingStatus,
    providerResponse?: string
  ): Promise<{ success: boolean; booking?: Booking; message: string }> {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, providerResponse }),
    });
    return res.json();
  },

  async cancelBooking(id: string, reason?: string): Promise<{ success: boolean; booking?: Booking; message: string }> {
    const res = await fetch(`/api/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  // 4. Reviews
  async createReview(reviewData: {
    booking_id: string;
    customer_id: string;
    provider_id: string;
    rating: number;
    review_text: string;
    customer_name?: string;
  }): Promise<{ success: boolean; review?: Review; message: string }> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    return res.json();
  },

  // 5. Complaints
  async createComplaint(complaintData: {
    booking_id?: string;
    customer_id: string;
    provider_id: string;
    complaint_description: string;
    customer_name?: string;
    provider_business_name?: string;
  }): Promise<{ success: boolean; complaint?: Complaint; message: string }> {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData),
    });
    return res.json();
  },

  // 6. Admin APIs
  async getAdminDashboard(): Promise<{
    success: boolean;
    stats: {
      totalCustomers: number;
      totalProviders: number;
      pendingVerifications: number;
      approvedProviders: number;
      totalBookings: number;
      completedBookings: number;
      cancelledBookings: number;
      openComplaints: number;
    };
  }> {
    const res = await fetch('/api/admin/dashboard');
    return res.json();
  },

  async getAdminProviders(): Promise<{ success: boolean; providers: Provider[] }> {
    const res = await fetch('/api/admin/providers');
    return res.json();
  },

  async verifyProvider(
    id: string,
    status: 'approved' | 'rejected',
    notes?: string
  ): Promise<{ success: boolean; provider?: Provider; message: string }> {
    const res = await fetch(`/api/admin/providers/${id}/verification`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    return res.json();
  },

  async getAdminCustomers(): Promise<{ success: boolean; customers: Customer[] }> {
    const res = await fetch('/api/admin/customers');
    return res.json();
  },

  async getAdminBookings(): Promise<{ success: boolean; bookings: Booking[] }> {
    const res = await fetch('/api/admin/bookings');
    return res.json();
  },

  async getAdminComplaints(): Promise<{ success: boolean; complaints: Complaint[] }> {
    const res = await fetch('/api/admin/complaints');
    return res.json();
  },

  async updateComplaint(
    id: string,
    status: ComplaintStatus,
    adminNotes?: string
  ): Promise<{ success: boolean; complaint?: Complaint; message: string }> {
    const res = await fetch(`/api/admin/complaints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    });
    return res.json();
  },

  async updateAccountStatus(
    id: string,
    status: 'active' | 'deactivated' | 'suspended'
  ): Promise<{ success: boolean; account?: any; message: string }> {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // 7. Database Status
  async getDbStatus(): Promise<{
    success: boolean;
    status: DatabaseStatus;
    pgAdminInstructions: any;
  }> {
    const res = await fetch('/api/db/status');
    return res.json();
  },
};
