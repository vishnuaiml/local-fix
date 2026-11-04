import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthUser,
  UserRole,
  CustomerUser,
  ProviderUser,
  AdminUser,
  AuthResponse,
} from '../types/campusConnect';
import {
  campusAuthApi,
  RegisterCustomerData,
  RegisterProviderData,
} from '../lib/campusAuth';

interface CampusAuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  loginCustomer: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>;
  registerCustomer: (data: RegisterCustomerData) => Promise<AuthResponse>;
  loginProvider: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>;
  registerProvider: (data: RegisterProviderData) => Promise<AuthResponse>;
  loginAdmin: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; demoToken?: string }>;
  logout: () => Promise<void>;
  updateUserLocally: (updated: AuthUser) => void;
}

const CampusAuthContext = createContext<CampusAuthContextType | undefined>(undefined);

export const CampusAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore stored session on mount
  useEffect(() => {
    try {
      const storedUser = campusAuthApi.getStoredUser();
      const storedToken = campusAuthApi.getStoredToken();
      if (storedUser && storedToken) {
        setUser(storedUser);
        setRole(storedUser.role);
        setToken(storedToken);
      }
    } catch (e) {
      console.error('Failed to restore CampusConnect auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginCustomer = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await campusAuthApi.loginCustomer(email, password, rememberMe);
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

  const registerCustomer = async (data: RegisterCustomerData) => {
    setIsLoading(true);
    try {
      const res = await campusAuthApi.registerCustomer(data);
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

  const loginProvider = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await campusAuthApi.loginProvider(email, password, rememberMe);
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

  const registerProvider = async (data: RegisterProviderData) => {
    setIsLoading(true);
    try {
      const res = await campusAuthApi.registerProvider(data);
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

  const loginAdmin = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await campusAuthApi.loginAdmin(email, password, rememberMe);
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
    return campusAuthApi.forgotPassword(email);
  };

  const logout = async () => {
    await campusAuthApi.logout();
    setUser(null);
    setRole(null);
    setToken(null);
  };

  const updateUserLocally = (updated: AuthUser) => {
    setUser(updated);
    setRole(updated.role);
    const token = campusAuthApi.getStoredToken() || 'token';
    campusAuthApi.saveSession(token, updated);
  };

  return (
    <CampusAuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        loginCustomer,
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
    </CampusAuthContext.Provider>
  );
};

export const useCampusAuth = () => {
  const context = useContext(CampusAuthContext);
  if (!context) {
    throw new Error('useCampusAuth must be used within a CampusAuthProvider');
  }
  return context;
};
