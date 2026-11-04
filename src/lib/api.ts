import {
  Booking,
  BookingStatus,
  CustomerAddress,
  PlatformComplaint,
  ProviderProfile,
  Review,
  ServiceCategory,
  ServiceItem,
  SubscriptionPlan,
  AdminMetrics,
} from '../types';

const BASE_URL = '/api';

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) errMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Categories & Services
  async getCategories(): Promise<ServiceCategory[]> {
    const data = await fetchJson<{ categories: ServiceCategory[] }>(`${BASE_URL}/categories`);
    return data.categories;
  },

  async getServices(categoryId?: string): Promise<ServiceItem[]> {
    const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
    const data = await fetchJson<{ services: ServiceItem[] }>(`${BASE_URL}/services${query}`);
    return data.services;
  },

  // Providers
  async getProviders(params: {
    city?: string;
    area?: string;
    category?: string;
    minRating?: number;
    maxPrice?: number;
    search?: string;
    verifiedOnly?: boolean;
  }): Promise<ProviderProfile[]> {
    const q = new URLSearchParams();
    if (params.city && params.city !== 'All') q.append('city', params.city);
    if (params.area && params.area !== 'All') q.append('area', params.area);
    if (params.category && params.category !== 'All') q.append('category', params.category);
    if (params.minRating) q.append('minRating', params.minRating.toString());
    if (params.maxPrice) q.append('maxPrice', params.maxPrice.toString());
    if (params.search) q.append('search', params.search);
    if (params.verifiedOnly) q.append('verifiedOnly', 'true');

    const data = await fetchJson<{ providers: ProviderProfile[] }>(
      `${BASE_URL}/providers?${q.toString()}`
    );
    return data.providers;
  },

  async getProviderById(id: string): Promise<{
    provider: ProviderProfile;
    services: ServiceItem[];
    reviews: Review[];
    documents: any[];
  }> {
    return fetchJson(`${BASE_URL}/providers/${id}`);
  },

  async checkAvailability(
    providerId: string,
    date: string
  ): Promise<{ providerId: string; date: string; bookedSlots: string[] }> {
    return fetchJson(
      `${BASE_URL}/providers/${providerId}/availability?date=${encodeURIComponent(date)}`
    );
  },

  async registerProvider(providerData: any): Promise<{ message: string; provider: ProviderProfile }> {
    return fetchJson(`${BASE_URL}/providers/register`, {
      method: 'POST',
      body: JSON.stringify(providerData),
    });
  },

  // Bookings
  async getBookings(params?: {
    customerId?: string;
    providerId?: string;
    status?: string;
  }): Promise<Booking[]> {
    const q = new URLSearchParams();
    if (params?.customerId) q.append('customerId', params.customerId);
    if (params?.providerId) q.append('providerId', params.providerId);
    if (params?.status) q.append('status', params.status);

    const data = await fetchJson<{ bookings: Booking[] }>(
      `${BASE_URL}/bookings?${q.toString()}`
    );
    return data.bookings;
  },

  async getBookingById(
    id: string
  ): Promise<{ booking: Booking; history: any[] }> {
    return fetchJson(`${BASE_URL}/bookings/${id}`);
  },

  async createBooking(bookingData: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    providerId: string;
    serviceId: string;
    date: string;
    timeSlot: string;
    address: CustomerAddress;
    problemDescription: string;
    paymentMethod: 'cash_on_delivery' | 'upi' | 'card';
    addOnsPricePaise?: number;
  }): Promise<{ message: string; booking: Booking }> {
    return fetchJson(`${BASE_URL}/bookings`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  async updateBookingStatus(
    id: string,
    status: BookingStatus,
    note?: string,
    changedBy?: string
  ): Promise<{ message: string; booking: Booking }> {
    return fetchJson(`${BASE_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note, changedBy }),
    });
  },

  async rescheduleBooking(
    id: string,
    newDate: string,
    newTimeSlot: string,
    reason?: string
  ): Promise<{ message: string; booking: Booking }> {
    return fetchJson(`${BASE_URL}/bookings/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ newDate, newTimeSlot, reason }),
    });
  },

  // Reviews
  async getReviews(providerId?: string): Promise<Review[]> {
    const q = providerId ? `?providerId=${encodeURIComponent(providerId)}` : '';
    const data = await fetchJson<{ reviews: Review[] }>(`${BASE_URL}/reviews${q}`);
    return data.reviews;
  },

  async submitReview(reviewData: {
    bookingId: string;
    rating: number;
    comment: string;
    customerName: string;
    customerCity: string;
  }): Promise<{ message: string; review: Review }> {
    return fetchJson(`${BASE_URL}/bookings/${reviewData.bookingId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Subscriptions
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const data = await fetchJson<{ plans: SubscriptionPlan[] }>(
      `${BASE_URL}/subscriptions/plans`
    );
    return data.plans;
  },

  async subscribePlan(
    providerId: string,
    planId: string
  ): Promise<{ message: string; provider: ProviderProfile }> {
    return fetchJson(`${BASE_URL}/subscriptions/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ providerId, planId }),
    });
  },

  // Admin
  async getAdminMetrics(): Promise<AdminMetrics> {
    const data = await fetchJson<{ metrics: AdminMetrics }>(`${BASE_URL}/admin/metrics`);
    return data.metrics;
  },

  async updateCommissionRate(ratePercent: number): Promise<{ message: string; defaultCommissionRatePercent: number }> {
    return fetchJson(`${BASE_URL}/admin/commission-rate`, {
      method: 'POST',
      body: JSON.stringify({ ratePercent }),
    });
  },

  async verifyProvider(
    providerId: string,
    status: 'verified' | 'rejected',
    note?: string
  ): Promise<{ message: string; provider: ProviderProfile }> {
    return fetchJson(`${BASE_URL}/admin/providers/${providerId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status, note }),
    });
  },

  async getComplaints(): Promise<PlatformComplaint[]> {
    const data = await fetchJson<{ complaints: PlatformComplaint[] }>(
      `${BASE_URL}/admin/complaints`
    );
    return data.complaints;
  },

  async resolveComplaint(
    id: string,
    resolutionNotes: string
  ): Promise<{ message: string; complaint: PlatformComplaint }> {
    return fetchJson(`${BASE_URL}/admin/complaints/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes }),
    });
  },

  // Test Runner
  async runTests(): Promise<{ success: boolean; results: { name: string; passed: boolean; message?: string }[] }> {
    return fetchJson(`${BASE_URL}/tests/run`);
  },
};
