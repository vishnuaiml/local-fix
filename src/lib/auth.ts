import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from './constants';

const SESSION_KEY = 'localfix_auth_session';
const USERS_STORAGE_KEY = 'localfix_registered_users';

export interface AuthSession {
  user: UserProfile;
  token: string;
  authProvider: 'google' | 'password';
  expiresAt: number;
}

export interface GoogleAccount {
  email: string;
  name: string;
  avatarUrl: string;
}

// Default Google accounts available for 1-click Google Sign-In
export const AVAILABLE_GOOGLE_ACCOUNTS: GoogleAccount[] = [
  {
    email: 'vishnu68c@gmail.com',
    name: 'Vishnu C.',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    email: 'priya.sharma@gmail.com',
    name: 'Priya Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    email: 'rajesh.electrician@gmail.com',
    name: 'Rajesh Kumar',
    avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
  },
  {
    email: 'admin@localfix.in',
    name: 'Platform Administrator (Google Workspace)',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
];

function getStoredUsers(): Map<string, { profile: UserProfile; passwordHash?: string; authProvider?: string }> {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const initial = new Map<string, { profile: UserProfile; passwordHash?: string; authProvider?: string }>();
      // Pre-seed demo accounts
      initial.set(DEMO_USERS.customer.email.toLowerCase(), {
        profile: DEMO_USERS.customer,
        passwordHash: 'Priya@123',
        authProvider: 'google',
      });
      initial.set(DEMO_USERS.provider.email.toLowerCase(), {
        profile: DEMO_USERS.provider,
        passwordHash: 'Rajesh@123',
        authProvider: 'google',
      });
      initial.set(DEMO_USERS.admin.email.toLowerCase(), {
        profile: DEMO_USERS.admin,
        passwordHash: 'Admin@123',
        authProvider: 'google',
      });
      return initial;
    }
    const parsed = JSON.parse(raw);
    const map = new Map<string, { profile: UserProfile; passwordHash?: string; authProvider?: string }>();
    Object.entries(parsed).forEach(([k, v]: [string, any]) => map.set(k, v));
    return map;
  } catch {
    return new Map();
  }
}

function saveStoredUsers(map: Map<string, { profile: UserProfile; passwordHash?: string; authProvider?: string }>) {
  const obj: Record<string, any> = {};
  map.forEach((v, k) => {
    obj[k] = v;
  });
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(obj));
}

export const authService = {
  // Get active session
  getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as AuthSession;
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  // Save session
  saveSession(user: UserProfile, authProvider: 'google' | 'password' = 'google'): AuthSession {
    const session: AuthSession = {
      user,
      token: `lf_google_oauth_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      authProvider,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  // Clear session
  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  // 1. Primary Google Authentication Method
  async signInWithGoogle(params: {
    email: string;
    name?: string;
    avatarUrl?: string;
    rolePreference?: 'customer' | 'provider';
    city?: string;
  }): Promise<{ user: UserProfile; redirectTo: string; isNewUser: boolean }> {
    const cleanEmail = params.email.trim().toLowerCase();
    const users = getStoredUsers();
    let existing = users.get(cleanEmail);

    let userProfile: UserProfile;
    let isNewUser = false;

    if (existing) {
      userProfile = existing.profile;
      // Update avatar or name if provided
      if (params.name && !userProfile.name) userProfile.name = params.name;
      if (params.avatarUrl) userProfile.avatarUrl = params.avatarUrl;
    } else {
      isNewUser = true;
      // Determine initial role
      // Admin accounts are privileged and recognized by email
      let assignedRole: UserRole = 'customer';
      if (cleanEmail === 'admin@localfix.in' || cleanEmail.includes('admin')) {
        assignedRole = 'admin';
      } else if (params.rolePreference === 'provider') {
        assignedRole = 'provider';
      }

      userProfile = {
        id: `usr_g_${Date.now()}`,
        role: assignedRole,
        name: params.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: '+91 98400 ' + Math.floor(10000 + Math.random() * 90000),
        avatarUrl:
          params.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        city: params.city || 'Chennai',
        createdAt: new Date().toISOString(),
      };

      users.set(cleanEmail, {
        profile: userProfile,
        authProvider: 'google',
      });
      saveStoredUsers(users);
    }

    this.saveSession(userProfile, 'google');

    return {
      user: userProfile,
      redirectTo: this.getRoleRedirectPath(userProfile.role),
      isNewUser,
    };
  },

  // 2. Email & Password Login
  async login(email: string, password: string): Promise<{ user: UserProfile; redirectTo: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const existing = users.get(cleanEmail);

    if (!existing) {
      throw new Error('No account found with this email. Please sign in with Google or register.');
    }

    if (existing.passwordHash && existing.passwordHash !== password) {
      throw new Error('Incorrect password. Please try again or use Google Sign-In.');
    }

    this.saveSession(existing.profile, 'password');

    return {
      user: existing.profile,
      redirectTo: this.getRoleRedirectPath(existing.profile.role),
    };
  },

  // 3. Register with role constraint (Admin role prohibited from self-selection)
  async register(params: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    city: string;
    role: 'customer' | 'provider';
    businessName?: string;
    primaryCategory?: string;
  }): Promise<{ user: UserProfile; redirectTo: string }> {
    const cleanEmail = params.email.trim().toLowerCase();

    if ((params.role as string) === 'admin') {
      throw new Error('Admin role cannot be self-selected during public registration.');
    }

    const users = getStoredUsers();
    if (users.has(cleanEmail)) {
      throw new Error('An account already exists with this email address. Please sign in instead.');
    }

    const userId = `usr_${params.role}_${Date.now()}`;
    const newProfile: UserProfile = {
      id: userId,
      role: params.role,
      name: params.name,
      email: cleanEmail,
      phone: params.phone,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      city: params.city || 'Chennai',
      createdAt: new Date().toISOString(),
    };

    users.set(cleanEmail, {
      profile: newProfile,
      passwordHash: params.password || 'Secret@123',
      authProvider: 'password',
    });
    saveStoredUsers(users);

    this.saveSession(newProfile, 'password');

    return {
      user: newProfile,
      redirectTo: this.getRoleRedirectPath(newProfile.role),
    };
  },

  // 4. Password Recovery
  async requestPasswordRecovery(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    return {
      success: true,
      message: `Password reset link sent to ${cleanEmail}. If you signed up with Google, you can sign in directly with Google.`,
    };
  },

  // Determine role-based redirect view
  getRoleRedirectPath(role: UserRole): string {
    switch (role) {
      case 'customer':
        return 'customer-dashboard';
      case 'provider':
        return 'provider-dashboard';
      case 'admin':
        return 'admin-dashboard';
      default:
        return 'home';
    }
  },
};
