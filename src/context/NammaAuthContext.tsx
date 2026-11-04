import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import {
  AuthUser,
  UserRole,
  Customer,
  Provider,
  Admin,
  AuthResponse,
} from '../types/nammaservices';
import { nammaApi } from '../services/api';

interface NammaAuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  loginCustomer: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: (portalRole?: 'customer' | 'provider' | 'admin') => Promise<AuthResponse>;
  registerCustomer: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    address?: string;
  }) => Promise<AuthResponse>;
  loginProvider: (email: string, password: string) => Promise<AuthResponse>;
  registerProvider: (data: {
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
  }) => Promise<AuthResponse>;
  loginAdmin: (email: string, password: string) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateUserLocally: (updated: AuthUser) => void;
}

const NammaAuthContext = createContext<NammaAuthContextType | undefined>(undefined);

export const NammaAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore stored session on mount
  useEffect(() => {
    try {
      const storedUser = nammaApi.getStoredUser();
      const storedToken = nammaApi.getStoredToken();
      if (storedUser && storedToken) {
        setUser(storedUser);
        setRole(storedUser.role);
        setToken(storedToken);
      }
    } catch (e) {
      console.error('Failed to restore NammaServices auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginCustomer = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await nammaApi.loginCustomer(email, password);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setRole(res.user.role);
        setToken(res.token);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (portalRole: 'customer' | 'provider' | 'admin' = 'customer') => {
    setIsLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await credential.user.getIdToken();
      const res = await nammaApi.loginWithGoogle(idToken, portalRole);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setRole(res.user.role);
        setToken(res.token);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const registerCustomer = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await nammaApi.registerCustomer(data);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setRole(res.user.role);
        setToken(res.token);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const loginProvider = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await nammaApi.loginProvider(email, password);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setRole(res.user.role);
        setToken(res.token);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const registerProvider = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await nammaApi.registerProvider(data);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setRole(res.user.role);
        setToken(res.token);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await nammaApi.loginAdmin(email, password);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setRole(res.user.role);
        setToken(res.token);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    return nammaApi.forgotPassword(email);
  };

  const logout = async () => {
    await nammaApi.logout();
    setUser(null);
    setRole(null);
    setToken(null);
  };

  const updateUserLocally = (updated: AuthUser) => {
    setUser(updated);
    setRole(updated.role);
    const token = nammaApi.getStoredToken() || 'token';
    nammaApi.saveSession(token, updated);
  };

  return (
    <NammaAuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        loginCustomer,
        loginWithGoogle,
        registerCustomer,
        loginProvider,
        registerProvider,
        loginAdmin,
        forgotPassword,
        logout,
        updateUserLocally,
      }}
    >
      {children}
    </NammaAuthContext.Provider>
  );
};

export const useNammaAuth = () => {
  const context = useContext(NammaAuthContext);
  if (!context) {
    throw new Error('useNammaAuth must be used within a NammaAuthProvider');
  }
  return context;
};
