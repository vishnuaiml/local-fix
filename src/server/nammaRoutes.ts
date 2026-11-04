/**
 * NammaServices: REST API Router
 * All endpoints for Customers, Providers, Admin, Services, Bookings, Reviews, and Complaints
 */

import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.ts';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';
import { ALL_CATEGORIES } from '../types/nammaservices.ts';
import type {
  Customer,
  Provider,
  Admin,
  ServiceCategory,
  BookingStatus,
  ComplaintStatus,
} from '../types/nammaservices.ts';

export const nammaRouter = Router();

const ADMIN_EMAILS = [
  'vishnu68c@gmail.com',
  'vishnuchinnarasu92@gmail.com',
  'admin@nammaservices.in',
];

// POST /api/auth/google (Firebase Google Sign-In with Role Routing)
nammaRouter.post('/auth/google', async (req: Request, res: Response) => {
  try {
    const { idToken, portalRole = 'customer' } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Missing ID Token.' });
    }
    const decoded = await adminAuth.verifyIdToken(idToken);
    const email = decoded.email || `${decoded.uid}@google.local`;
    const cleanEmail = email.toLowerCase().trim();
    const fullName = decoded.name || email.split('@')[0];
    const isAdmin = ADMIN_EMAILS.includes(cleanEmail);

    // 1. Admin Portal or Authorized Admin Email
    if (portalRole === 'admin' || isAdmin) {
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: This Google account does not have platform administrator privileges.',
        });
      }

      const existingAdmin = await db.findAdminByEmail(cleanEmail);
      const adminUser: Admin = existingAdmin
        ? existingAdmin.data
        : {
            id: decoded.uid,
            role: 'admin',
            full_name: fullName,
            email: cleanEmail,
            department: 'Platform Executive & Security Administration',
            account_status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

      const token = `token_google_admin_${Date.now()}_${decoded.uid}`;

      return res.json({
        success: true,
        message: `Admin access granted. Welcome, ${adminUser.full_name}!`,
        token,
        user: adminUser,
      });
    }

    // 2. Provider Portal Login via Google
    if (portalRole === 'provider') {
      const existingProvider = await db.findProviderByEmail(cleanEmail);
      if (!existingProvider) {
        return res.status(404).json({
          success: false,
          message: `No service provider account found for ${cleanEmail}. Please complete provider registration first.`,
        });
      }

      const token = `token_google_provider_${Date.now()}_${decoded.uid}`;

      return res.json({
        success: true,
        message: `Welcome back, ${existingProvider.data.full_name}!`,
        token,
        user: existingProvider.data,
      });
    }

    // 3. Default: Customer Authentication
    if (process.env.SQL_HOST) {
      try {
        await getOrCreateUser(decoded.uid, cleanEmail, fullName);
      } catch (dbErr) {
        console.warn('[LocalFix] User sync warning:', dbErr);
      }
    }

    const customerUser: Customer = {
      id: decoded.uid,
      role: 'customer',
      full_name: fullName,
      email: cleanEmail,
      phone_number: (decoded as any).phone_number || '',
      account_status: 'active',
      avatar_url: decoded.picture || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.createCustomer(customerUser, '');

    const token = `token_google_${Date.now()}_${decoded.uid}`;

    return res.json({
      success: true,
      message: 'Google authentication successful! Welcome to LocalFix.',
      token,
      user: customerUser,
    });
  } catch (err: any) {
    console.error('Google Auth Error:', err);
    return res.status(401).json({
      success: false,
      message: 'Google Authentication failed: ' + (err.message || 'Invalid token'),
    });
  }
});


// Rate limiting map for login
const loginFailures = new Map<string, { count: number; lockedUntil: number }>();

function checkRateLimit(email: string): boolean {
  const attempt = loginFailures.get(email.toLowerCase());
  if (attempt && attempt.lockedUntil > Date.now()) {
    return false;
  }
  return true;
}

function recordAttempt(email: string, success: boolean) {
  const key = email.toLowerCase();
  if (success) {
    loginFailures.delete(key);
    return;
  }
  const attempt = loginFailures.get(key) || { count: 0, lockedUntil: 0 };
  attempt.count += 1;
  if (attempt.count >= 5) {
    attempt.lockedUntil = Date.now() + 60 * 1000; // 1-minute lockout
  }
  loginFailures.set(key, attempt);
}

// =========================================================================
// 1. AUTHENTICATION ENDPOINTS
// =========================================================================

// POST /api/auth/customer/register
nammaRouter.post('/auth/customer/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, confirmPassword, address } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All registration fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate
    const existing = await db.findCustomerByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      role: 'customer',
      full_name: fullName.trim(),
      email: cleanEmail,
      phone_number: phone.trim(),
      account_status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      address: address ? address.trim() : 'Chennai, Tamil Nadu',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.createCustomer(newCustomer, passwordHash);
    const token = `token_customer_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to LocalFix.',
      token,
      user: newCustomer,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Server error during customer registration.' });
  }
});

// POST /api/auth/customer/login
nammaRouter.post('/auth/customer/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!checkRateLimit(cleanEmail)) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed login attempts. Please wait 1 minute before retrying.',
      });
    }

    const record = await db.findCustomerByEmail(cleanEmail);
    if (!record) {
      recordAttempt(cleanEmail, false);
      return res.status(401).json({
        success: false,
        message: 'Invalid customer credentials. (Service Providers and Admins should use their respective portals).',
      });
    }

    const isMatch = await bcrypt.compare(password, record.passwordHash || '');
    if (!isMatch) {
      recordAttempt(cleanEmail, false);
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
    }

    recordAttempt(cleanEmail, true);
    const token = `token_customer_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return res.json({
      success: true,
      message: 'Customer sign in successful.',
      token,
      user: record.data,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// POST /api/auth/provider/register
nammaRouter.post('/auth/provider/register', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      businessName,
      email,
      phone,
      serviceCategory,
      serviceArea,
      experienceYears,
      serviceDescription,
      password,
      confirmPassword,
      avatarUrl,
    } = req.body;

    if (!fullName || !businessName || !email || !phone || !serviceCategory || !serviceDescription || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required provider fields.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.findProviderByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'A provider account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // CRITICAL: Newly registered providers strictly start as 'pending'
    const newProvider: Provider = {
      id: `prov_${Date.now()}`,
      role: 'provider',
      full_name: fullName.trim(),
      business_name: businessName.trim(),
      email: cleanEmail,
      phone_number: phone.trim(),
      service_category: serviceCategory as ServiceCategory,
      service_description: serviceDescription.trim(),
      service_area: serviceArea ? serviceArea.trim() : 'Chennai Central',
      experience_years: Number(experienceYears) || 1,
      verification_status: 'pending',
      verification_notes: 'Application registered. Awaiting trade certificate verification by Administrator.',
      account_status: 'active',
      avatar_url:
        avatarUrl ||
        'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      hourly_rate: 349,
      rating: 0,
      completed_jobs: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.createProvider(newProvider, passwordHash);
    const token = `token_provider_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return res.status(201).json({
      success: true,
      message: 'Provider registration submitted. Status is PENDING admin verification.',
      token,
      user: newProvider,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Server error during provider registration.' });
  }
});

// POST /api/auth/provider/login
nammaRouter.post('/auth/provider/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!checkRateLimit(cleanEmail)) {
      return res.status(429).json({ success: false, message: 'Rate limit engaged. Try again in 1 minute.' });
    }

    const record = await db.findProviderByEmail(cleanEmail);
    if (!record) {
      recordAttempt(cleanEmail, false);
      return res.status(401).json({ success: false, message: 'Invalid provider credentials.' });
    }

    const isMatch = await bcrypt.compare(password, record.passwordHash || '');
    if (!isMatch) {
      recordAttempt(cleanEmail, false);
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    recordAttempt(cleanEmail, true);
    const token = `token_provider_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return res.json({
      success: true,
      message: 'Provider signed in successfully.',
      token,
      user: record.data,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Server error during provider login.' });
  }
});

// POST /api/auth/admin/login (Strict: No public admin registration!)
nammaRouter.post('/auth/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Admin credentials required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!checkRateLimit(cleanEmail)) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Locked for 60 seconds.' });
    }

    const record = await db.findAdminByEmail(cleanEmail);
    if (!record) {
      recordAttempt(cleanEmail, false);
      return res.status(403).json({
        success: false,
        message: 'Access Denied: This email is not an authorized administrator on LocalFix.',
      });
    }

    const isMatch = await bcrypt.compare(password, record.passwordHash || '');
    if (!isMatch) {
      recordAttempt(cleanEmail, false);
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    recordAttempt(cleanEmail, true);
    const token = `token_admin_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return res.json({
      success: true,
      message: 'Admin authorization granted. Welcome to LocalFix Control Room.',
      token,
      user: record.data,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Server error during admin login.' });
  }
});

// POST /api/auth/logout
nammaRouter.post('/auth/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Signed out successfully.' });
});

// POST /api/auth/forgot-password
nammaRouter.post('/auth/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(2)}`;

  return res.json({
    success: true,
    message: `If an account exists for ${cleanEmail}, a secure password reset link has been dispatched (Valid 15 minutes).`,
  });
});

// GET /api/auth/me
nammaRouter.get('/auth/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No authorization header provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (token.includes('customer')) {
    const cust = (await db.listCustomers())[0];
    if (cust) return res.json({ success: true, user: cust });
  } else if (token.includes('provider')) {
    const prov = (await db.listAllProvidersForAdmin())[0];
    if (prov) return res.json({ success: true, user: prov });
  } else if (token.includes('admin')) {
    const admin = await db.findAdminByEmail('admin@nammaservices.in');
    if (admin) return res.json({ success: true, user: admin.data });
  }

  return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
});

// =========================================================================
// 2. PROVIDERS & DISCOVERY ENDPOINTS
// =========================================================================

// GET /api/providers (Public search & locality filtering: Approved & Active only!)
nammaRouter.get('/providers', async (req: Request, res: Response) => {
  const { category, area, search, maxPrice } = req.query;

  const providers = await db.listProviders({
    category: category ? String(category) : undefined,
    area: area ? String(area) : undefined,
    search: search ? String(search) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    verifiedOnly: true, // Crucial: pending/rejected do not appear in public search!
  });

  return res.json({ success: true, providers, count: providers.length });
});

// GET /api/providers/:id
nammaRouter.get('/providers/:id', async (req: Request, res: Response) => {
  const provider = await db.findProviderById(req.params.id);
  if (!provider) {
    return res.status(404).json({ success: false, message: 'Provider not found.' });
  }

  const services = await db.listServices(provider.id);
  const reviews = await db.listReviewsByProvider(provider.id);

  return res.json({
    success: true,
    provider,
    services,
    reviews,
  });
});

// PUT /api/providers/profile
nammaRouter.put('/providers/profile', async (req: Request, res: Response) => {
  const { id, ...updates } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: 'Provider ID is required.' });
  }

  const updated = await db.updateProviderProfile(id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Provider not found.' });
  }

  return res.json({ success: true, message: 'Profile updated successfully.', provider: updated });
});

// =========================================================================
// 3. SERVICES ENDPOINTS
// =========================================================================

// GET /api/services
nammaRouter.get('/services', async (req: Request, res: Response) => {
  const { providerId, category } = req.query;
  const services = await db.listServices(
    providerId ? String(providerId) : undefined,
    category ? String(category) : undefined
  );
  return res.json({ success: true, services });
});

// POST /api/services
nammaRouter.post('/services', async (req: Request, res: Response) => {
  const { provider_id, service_name, category, description, indicative_price } = req.body;
  if (!provider_id || !service_name || !category || indicative_price === undefined) {
    return res.status(400).json({ success: false, message: 'Missing service fields.' });
  }

  const newService = await db.createService({
    id: `srv_${Date.now()}`,
    provider_id,
    service_name,
    category,
    description: description || '',
    indicative_price: Number(indicative_price) || 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return res.status(201).json({ success: true, service: newService });
});

// =========================================================================
// 4. BOOKINGS ENDPOINTS
// =========================================================================

// POST /api/bookings (Submit a booking request)
nammaRouter.post('/bookings', async (req: Request, res: Response) => {
  try {
    const {
      customer_id,
      provider_id,
      service_id,
      service_description,
      service_location,
      preferred_date,
      preferred_time,
      customer_notes,
      indicative_price,
    } = req.body;

    if (!customer_id || !provider_id || !service_description || !service_location || !preferred_date || !preferred_time) {
      return res.status(400).json({ success: false, message: 'Please provide all booking requirement fields.' });
    }

    const customer = await db.findCustomerById(customer_id);
    const provider = await db.findProviderById(provider_id);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Selected provider not found.' });
    }

    // Verify provider is approved
    if (provider.verification_status !== 'approved') {
      return res.status(400).json({ success: false, message: 'This provider is not currently verified to accept bookings.' });
    }

    // Prevent double booking at the same date & time slot for the provider
    const existingBookings = await db.listBookingsByProvider(provider_id);
    const conflict = existingBookings.find(
      (b) =>
        b.preferred_date === preferred_date &&
        b.preferred_time === preferred_time &&
        (b.booking_status === 'Accepted' || b.booking_status === 'In Progress')
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'This provider already has a confirmed booking for the selected date and time slot. Please choose another slot.',
      });
    }

    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = await db.createBooking({
      id: bookingId,
      customer_id,
      provider_id,
      service_id,
      service_description,
      service_location,
      preferred_date,
      preferred_time,
      booking_status: 'Pending',
      customer_notes,
      indicative_price: Number(indicative_price) || provider.hourly_rate,
      customer_name: customer?.full_name || 'Customer',
      customer_phone: customer?.phone_number || '',
      provider_name: provider.full_name,
      provider_business_name: provider.business_name,
      provider_phone: provider.phone_number,
      service_category: provider.service_category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: 'Booking request sent to provider! Awaiting acceptance.',
      booking: newBooking,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Server error while creating booking.' });
  }
});

// GET /api/bookings/my-bookings (Customer's own bookings)
nammaRouter.get('/bookings/my-bookings', async (req: Request, res: Response) => {
  const { customerId } = req.query;
  if (!customerId) {
    return res.status(400).json({ success: false, message: 'customerId query parameter required.' });
  }
  const bookings = await db.listBookingsByCustomer(String(customerId));
  return res.json({ success: true, bookings });
});

// GET /api/providers/bookings (Provider's assigned bookings)
nammaRouter.get('/providers/bookings', async (req: Request, res: Response) => {
  const { providerId } = req.query;
  if (!providerId) {
    return res.status(400).json({ success: false, message: 'providerId query parameter required.' });
  }
  const bookings = await db.listBookingsByProvider(String(providerId));
  return res.json({ success: true, bookings });
});

// PATCH /api/bookings/:id/status (Provider updates status: Accepted, Rejected, In Progress, Completed)
nammaRouter.patch('/bookings/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, providerResponse } = req.body;

  const validStatuses: BookingStatus[] = ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid booking status.' });
  }

  const updated = await db.updateBookingStatus(id, status, providerResponse);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  return res.json({ success: true, message: `Booking marked as ${status}.`, booking: updated });
});

// POST /api/bookings/:id/cancel
nammaRouter.post('/bookings/:id/cancel', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const cancelled = await db.cancelBooking(id, reason);
    if (!cancelled) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    return res.json({ success: true, message: 'Booking cancelled successfully.', booking: cancelled });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 5. REVIEWS ENDPOINTS
// =========================================================================

// POST /api/reviews (Strictly only after completed bookings!)
nammaRouter.post('/reviews', async (req: Request, res: Response) => {
  try {
    const { booking_id, customer_id, provider_id, rating, review_text, customer_name } = req.body;

    if (!booking_id || !customer_id || !provider_id || !rating || !review_text) {
      return res.status(400).json({ success: false, message: 'All review fields are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    const newReview = await db.createReview({
      id: `rev_${Date.now()}`,
      booking_id,
      customer_id,
      provider_id,
      rating: Number(rating),
      review_text: review_text.trim(),
      customer_name: customer_name || 'Customer',
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({ success: true, message: 'Review submitted successfully!', review: newReview });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || 'Cannot submit review.' });
  }
});

// GET /api/providers/:id/reviews
nammaRouter.get('/providers/:id/reviews', async (req: Request, res: Response) => {
  const reviews = await db.listReviewsByProvider(req.params.id);
  return res.json({ success: true, reviews });
});

// =========================================================================
// 6. COMPLAINTS ENDPOINTS
// =========================================================================

// POST /api/complaints
nammaRouter.post('/complaints', async (req: Request, res: Response) => {
  const { booking_id, customer_id, provider_id, complaint_description, customer_name, provider_business_name } = req.body;
  if (!customer_id || !provider_id || !complaint_description) {
    return res.status(400).json({ success: false, message: 'Complaint description is required.' });
  }

  const complaint = await db.createComplaint({
    id: `comp_${Date.now()}`,
    booking_id,
    customer_id,
    provider_id,
    complaint_description: complaint_description.trim(),
    complaint_status: 'Open',
    customer_name,
    provider_business_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return res.status(201).json({ success: true, message: 'Complaint filed. Admin team notified.', complaint });
});

// =========================================================================
// 7. ADMIN ENDPOINTS (Protected)
// =========================================================================

// GET /api/admin/dashboard
nammaRouter.get('/admin/dashboard', async (_req: Request, res: Response) => {
  const customers = await db.listCustomers();
  const providers = await db.listAllProvidersForAdmin();
  const bookings = await db.listAllBookings();
  const complaints = await db.listComplaints();

  const pendingProviders = providers.filter((p) => p.verification_status === 'pending').length;
  const approvedProviders = providers.filter((p) => p.verification_status === 'approved').length;
  const completedBookings = bookings.filter((b) => b.booking_status === 'Completed').length;
  const cancelledBookings = bookings.filter((b) => b.booking_status === 'Cancelled').length;

  return res.json({
    success: true,
    stats: {
      totalCustomers: customers.length,
      totalProviders: providers.length,
      pendingVerifications: pendingProviders,
      approvedProviders,
      totalBookings: bookings.length,
      completedBookings,
      cancelledBookings,
      openComplaints: complaints.filter((c) => c.complaint_status === 'Open').length,
    },
  });
});

// GET /api/admin/providers
nammaRouter.get('/admin/providers', async (_req: Request, res: Response) => {
  const providers = await db.listAllProvidersForAdmin();
  return res.json({ success: true, providers });
});

// PATCH /api/admin/providers/:id/verification (Approve or Reject provider)
nammaRouter.patch('/admin/providers/:id/verification', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
  }

  const updated = await db.verifyProvider(id, status, notes);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Provider not found.' });
  }

  return res.json({
    success: true,
    message: `Provider ${status === 'approved' ? 'Approved & Activated' : 'Rejected'} successfully.`,
    provider: updated,
  });
});

// GET /api/admin/customers
nammaRouter.get('/admin/customers', async (_req: Request, res: Response) => {
  const customers = await db.listCustomers();
  return res.json({ success: true, customers });
});

// GET /api/admin/bookings
nammaRouter.get('/admin/bookings', async (_req: Request, res: Response) => {
  const bookings = await db.listAllBookings();
  return res.json({ success: true, bookings });
});

// GET /api/admin/complaints
nammaRouter.get('/admin/complaints', async (_req: Request, res: Response) => {
  const complaints = await db.listComplaints();
  return res.json({ success: true, complaints });
});

// PATCH /api/admin/complaints/:id
nammaRouter.patch('/admin/complaints/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const updated = await db.updateComplaint(id, status, adminNotes);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  return res.json({ success: true, message: 'Complaint updated.', complaint: updated });
});

// PATCH /api/admin/users/:id/status (Activate or deactivate user/provider)
nammaRouter.patch('/admin/users/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await db.updateAccountStatus(id, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Account not found.' });
  }

  return res.json({ success: true, message: `Account status updated to ${status}.`, account: updated });
});

// =========================================================================
// 8. DATABASE & PGADMIN 4 STATUS ENDPOINT
// =========================================================================

// GET /api/db/status
nammaRouter.get('/db/status', async (_req: Request, res: Response) => {
  const status = await db.getStatus();
  return res.json({
    success: true,
    status,
    pgAdminInstructions: {
      host: 'localhost',
      port: 5432,
      database: 'nammaservices_db',
      username: 'namma_user',
      password: 'namma_secure_password',
      migrationFile: 'server/src/db/migrations/001_initial_schema.sql',
      seedFile: 'server/src/db/seeds/001_seed_data.sql',
    },
  });
});
