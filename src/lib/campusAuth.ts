import {
  AuthResponse,
  AuthUser,
  CustomerUser,
  ProviderUser,
  AdminUser,
  ServiceCategory,
} from '../types/campusConnect';

const TOKEN_KEY = 'campusconnect_auth_token';
const USER_KEY = 'campusconnect_auth_user';
const ROLE_KEY = 'campusconnect_auth_role';

export interface RegisterCustomerData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterProviderData {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  serviceCategory: ServiceCategory;
  serviceArea: string;
  experienceYears: number;
  avatarUrl?: string;
  password: string;
  confirmPassword: string;
}

// Client API Helper
export const campusAuthApi = {
  // Store session
  saveSession(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ROLE_KEY, user.role);
  },

  // Clear session
  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  },

  // Get current user from storage
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

  // 1. Customer APIs
  async registerCustomer(data: RegisterCustomerData): Promise<AuthResponse> {
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

  async loginCustomer(email: string, password: string, rememberMe = false): Promise<AuthResponse> {
    const res = await fetch('/api/auth/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
    });
    const result = await res.json();
    if (result.success && result.token && result.user) {
      this.saveSession(result.token, result.user);
    }
    return result;
  },

  // 2. Provider APIs
  async registerProvider(data: RegisterProviderData): Promise<AuthResponse> {
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

  async loginProvider(email: string, password: string, rememberMe = false): Promise<AuthResponse> {
    const res = await fetch('/api/auth/provider/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
    });
    const result = await res.json();
    if (result.success && result.token && result.user) {
      this.saveSession(result.token, result.user);
    }
    return result;
  },

  // 3. Admin APIs (Strict: No public registration)
  async loginAdmin(email: string, password: string, rememberMe = false): Promise<AuthResponse> {
    const res = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
    });
    const result = await res.json();
    if (result.success && result.token && result.user) {
      this.saveSession(result.token, result.user);
    }
    return result;
  },

  // 4. Common APIs
  async forgotPassword(email: string): Promise<{ success: boolean; message: string; demoToken?: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    this.clearSession();
  },

  // Admin Management Endpoints
  async getAdminProviders(): Promise<{ success: boolean; providers: ProviderUser[] }> {
    const res = await fetch('/api/auth/admin/providers');
    return res.json();
  },

  async verifyProvider(
    id: string,
    status: 'approved' | 'rejected',
    notes?: string
  ): Promise<{ success: boolean; message: string; provider?: ProviderUser }> {
    const res = await fetch(`/api/auth/admin/providers/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    return res.json();
  },

  async getAdminCustomers(): Promise<{ success: boolean; customers: CustomerUser[] }> {
    const res = await fetch('/api/auth/admin/customers');
    return res.json();
  },

  async getAdminStats(): Promise<{
    success: boolean;
    stats: {
      totalCustomers: number;
      totalProviders: number;
      pendingApprovals: number;
      approvedProviders: number;
    };
  }> {
    const res = await fetch('/api/auth/admin/stats');
    return res.json();
  },
};
