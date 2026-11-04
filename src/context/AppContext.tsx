import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile, CustomerAddress, ProviderProfile, ServiceItem } from '../types';
import { DEMO_USERS, DEMO_CUSTOMER_ADDRESS, TRANSLATIONS } from '../lib/constants';
import { authService } from '../lib/auth';

export type AppView =
  | 'home'
  | 'services'
  | 'search'
  | 'provider-detail'
  | 'booking-checkout'
  | 'booking-confirmed'
  | 'customer-dashboard'
  | 'provider-dashboard'
  | 'admin-dashboard'
  | 'provider-register'
  | 'reviews'
  | 'faq'
  | 'contact'
  | 'privacy'
  | 'terms';

export interface BookingDraft {
  provider: ProviderProfile;
  service: ServiceItem;
  date: string;
  timeSlot: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  language: 'en' | 'ta';
  setLanguage: (lang: 'en' | 'ta') => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategorySlug: string;
  setSelectedCategorySlug: (cat: string) => void;
  selectedProviderId: string | null;
  setSelectedProviderId: (id: string | null) => void;
  bookingDraft: BookingDraft | null;
  setBookingDraft: (draft: BookingDraft | null) => void;
  confirmedBookingId: string | null;
  setConfirmedBookingId: (id: string | null) => void;
  favorites: Set<string>;
  toggleFavorite: (providerId: string) => void;
  customerAddress: CustomerAddress;
  setCustomerAddress: (addr: CustomerAddress) => void;
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  navigate: (view: AppView, params?: { providerId?: string; category?: string; bookingId?: string }) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('customer');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS.customer);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedCity, setSelectedCity] = useState<string>('Chennai');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('All');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>('prov_rajesh_elec');
  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['prov_rajesh_elec', 'prov_arun_plumb']));
  const [customerAddress, setCustomerAddress] = useState<CustomerAddress>(DEMO_CUSTOMER_ADDRESS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Restore authenticated session on load
  useEffect(() => {
    const session = authService.getSession();
    if (session?.user) {
      setCurrentUser(session.user);
      setRoleState(session.user.role);
    }
  }, []);

  const openAuthModal = (m: 'login' | 'register' = 'login') => {
    setAuthModalMode(m);
    setIsAuthModalOpen(true);
  };

  const logout = () => {
    authService.logout();
    setRoleState('customer');
    setCurrentUser(DEMO_USERS.customer);
    showToast('You have signed out successfully.', 'info');
    setCurrentView('home');
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'customer') {
      setCurrentUser(DEMO_USERS.customer);
      authService.saveSession(DEMO_USERS.customer);
    } else if (newRole === 'provider') {
      setCurrentUser(DEMO_USERS.provider);
      authService.saveSession(DEMO_USERS.provider);
    } else if (newRole === 'admin') {
      setCurrentUser(DEMO_USERS.admin);
      authService.saveSession(DEMO_USERS.admin);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleFavorite = (providerId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(providerId)) {
        next.delete(providerId);
        showToast('Removed from saved professionals', 'info');
      } else {
        next.add(providerId);
        showToast('Added to saved professionals', 'success');
      }
      return next;
    });
  };

  const t = (key: keyof typeof TRANSLATIONS.en): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  const navigate = (
    view: AppView,
    params?: { providerId?: string; category?: string; bookingId?: string }
  ) => {
    if (params?.providerId) {
      setSelectedProviderId(params.providerId);
    }
    if (params?.category) {
      setSelectedCategorySlug(params.category);
    }
    if (params?.bookingId) {
      setConfirmedBookingId(params.bookingId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        role,
        setRole,
        currentView,
        setCurrentView,
        selectedCity,
        setSelectedCity,
        selectedArea,
        setSelectedArea,
        language,
        setLanguage,
        t,
        searchQuery,
        setSearchQuery,
        selectedCategorySlug,
        setSelectedCategorySlug,
        selectedProviderId,
        setSelectedProviderId,
        bookingDraft,
        setBookingDraft,
        confirmedBookingId,
        setConfirmedBookingId,
        favorites,
        toggleFavorite,
        customerAddress,
        setCustomerAddress,
        toasts,
        showToast,
        dismissToast,
        navigate,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        openAuthModal,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
