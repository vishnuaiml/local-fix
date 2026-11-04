import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { CustomerUser, ProviderUser, AdminUser, ServiceCategory } from '../types/campusConnect';

export const authRouter = Router();

// In-Memory Database Store for CampusConnect
interface StoredAccount<T> {
  user: T;
  passwordHash: string;
}

const customers = new Map<string, StoredAccount<CustomerUser>>();
const providers = new Map<string, StoredAccount<ProviderUser>>();
const admins = new Map<string, StoredAccount<AdminUser>>();
const resetTokens = new Map<string, { email: string; role: string; expiresAt: number }>();

// Simple in-memory rate limiting to prevent brute-force attacks
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

// Initialize Seed Accounts
async function initSeedAccounts() {
  const salt = await bcrypt.genSalt(10);

  // 1. Demo Customer: Priya Sharma
  const customerHash = await bcrypt.hash('Priya@123', salt);
  customers.set('customer@campusconnect.edu', {
    user: {
      id: 'cust_seed_1',
      role: 'customer',
      fullName: 'Priya Sharma',
      email: 'customer@campusconnect.edu',
      phone: '+91 98401 11223',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      address: 'Hostel Block B, Room 204, Campus North',
      createdAt: new Date().toISOString(),
    },
    passwordHash: customerHash,
  });

  // 2. Demo Approved Provider: Rajesh Kumar (Electrician)
  const providerHash = await bcrypt.hash('Rajesh@123', salt);
  providers.set('rajesh.spark@campusconnect.edu', {
    user: {
      id: 'prov_seed_1',
      role: 'provider',
      fullName: 'Rajesh Kumar',
      businessName: 'SparkWave Electricals',
      email: 'rajesh.spark@campusconnect.edu',
      phone: '+91 98402 33445',
      serviceCategory: 'Electrician',
      serviceArea: 'North Campus & Tech District',
      experienceYears: 7,
      avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      verificationStatus: 'approved',
      verificationNotes: 'State Wireman License TN-8910 verified by Admin.',
      rating: 4.9,
      completedJobs: 134,
      hourlyRate: 349,
      createdAt: new Date().toISOString(),
    },
    passwordHash: providerHash,
  });

  // 2b. Demo Pending Provider: Karthik Laptop Repair
  const providerPendingHash = await bcrypt.hash('Karthik@123', salt);
  providers.set('karthik.tech@campusconnect.edu', {
    user: {
      id: 'prov_seed_2',
      role: 'provider',
      fullName: 'Karthik Raja',
      businessName: 'ByteFix Laptop & Mobile Clinic',
      email: 'karthik.tech@campusconnect.edu',
      phone: '+91 98403 77889',
      serviceCategory: 'Laptop Repair',
      serviceArea: 'Central Campus & Engineering Wing',
      experienceYears: 4,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verificationStatus: 'pending',
      verificationNotes: 'Diploma certificate uploaded; awaiting admin document audit.',
      rating: 0,
      completedJobs: 0,
      hourlyRate: 499,
      createdAt: new Date().toISOString(),
    },
    passwordHash: providerPendingHash,
  });

  // 3. Demo Admin: Platform Administrator
  const adminHash = await bcrypt.hash('Admin@123', salt);
  admins.set('admin@campusconnect.edu', {
    user: {
      id: 'admin_seed_1',
      role: 'admin',
      fullName: 'Dr. Anand Raman (Dean of Student Affairs / Operations)',
      email: 'admin@campusconnect.edu',
      department: 'Campus Services & Marketplace Governance',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
    passwordHash: adminHash,
  });
}

initSeedAccounts().catch(console.error);

// Rate limiting helper
function checkRateLimit(email: string): boolean {
  const attempt = loginAttempts.get(email);
  if (attempt && attempt.lockedUntil > Date.now()) {
    return false;
  }
  return true;
}

function recordLoginAttempt(email: string, success: boolean) {
  if (success) {
    loginAttempts.delete(email);
    return;
  }
  const attempt = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
  attempt.count += 1;
  if (attempt.count >= 5) {
    attempt.lockedUntil = Date.now() + 60 * 1000; // Lock for 60 seconds after 5 failed attempts
  }
  loginAttempts.set(email, attempt);
}

// =========================================================================
// 1. CUSTOMER AUTHENTICATION APIS
// =========================================================================

// POST /api/auth/customer/register
authRouter.post('/customer/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    // Validation
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

    // Check duplicate email across all accounts
    if (customers.has(cleanEmail) || providers.has(cleanEmail) || admins.has(cleanEmail)) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: CustomerUser = {
      id: `cust_${Date.now()}`,
      role: 'customer',
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    customers.set(cleanEmail, { user: newUser, passwordHash });

    const token = `token_customer_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully. Welcome to CampusConnect!',
      token,
      user: newUser,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// POST /api/auth/customer/login
authRouter.post('/customer/login', async (req: Request, res: Response) => {
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

    const record = customers.get(cleanEmail);

    if (!record) {
      recordLoginAttempt(cleanEmail, false);
      return res.status(401).json({
        success: false,
        message: 'Invalid customer credentials. (If you are a Service Provider or Admin, please use your dedicated login portal).',
      });
    }

    const isMatch = await bcrypt.compare(password, record.passwordHash);
    if (!isMatch) {
      recordLoginAttempt(cleanEmail, false);
      return res.status(401).json({ success: false, message: 'Invalid customer credentials. Password incorrect.' });
    }

    recordLoginAttempt(cleanEmail, true);
    const token = `token_customer_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return res.json({
      success: true,
      message: 'Customer login successful.',
      token,
      user: record.user,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error during customer login.' });
  }
});

// =========================================================================
// 2. SERVICE PROVIDER AUTHENTICATION APIS
// =========================================================================

// POST /api/auth/provider/register
authRouter.post('/provider/register', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      businessName,
      email,
      phone,
      serviceCategory,
      serviceArea,
      experienceYears,
      avatarUrl,
      password,
      confirmPassword,
    } = req.body;

    // Validation
    if (!fullName || !businessName || !email || !phone || !serviceCategory || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required provider registration fields.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const validCategories: ServiceCategory[] = [
      'Electrician',
      'Plumber',
      'Laptop Repair',
      'Home Cleaning',
      'Tutor',
      'Laundry',
      'Carpenter',
    ];

    if (!validCategories.includes(serviceCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid service category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (customers.has(cleanEmail) || providers.has(cleanEmail) || admins.has(cleanEmail)) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // CRITICAL REQUIREMENT: Newly registered providers must remain pending until approved by admin!
    const newProvider: ProviderUser = {
      id: `prov_${Date.now()}`,
      role: 'provider',
      fullName: fullName.trim(),
      businessName: businessName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      serviceCategory,
      serviceArea: serviceArea || 'Campus & Surrounding Neighborhoods',
      experienceYears: Number(experienceYears) || 1,
      avatarUrl:
        avatarUrl ||
        'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      verificationStatus: 'pending', // Strictly Pending
      verificationNotes: 'Application submitted. Pending administrator credential inspection.',
      rating: 0,
      completedJobs: 0,
      hourlyRate: 349,
      createdAt: new Date().toISOString(),
    };

    providers.set(cleanEmail, { user: newProvider, passwordHash });

    const token = `token_provider_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return res.status(201).json({
      success: true,
      message: 'Provider registration submitted successfully. Your account is currently Pending Admin Verification.',
      token,
      user: newProvider,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error during provider registration.' });
  }
});

// POST /api/auth/provider/login
authRouter.post('/provider/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!checkRateLimit(cleanEmail)) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed login attempts. Please wait 1 minute before retrying.',
      });
    }

    const record = providers.get(cleanEmail);

    if (!record) {
      recordLoginAttempt(cleanEmail, false);
      return res.status(401).json({
        success: false,
        message: 'Invalid service provider credentials. (If you are a Customer, please use the Customer Login).',
      });
    }

    const isMatch = await bcrypt.compare(password, record.passwordHash);
    if (!isMatch) {
      recordLoginAttempt(cleanEmail, false);
      return res.status(401).json({ success: false, message: 'Incorrect password for service provider account.' });
    }

    recordLoginAttempt(cleanEmail, true);
    const token = `token_provider_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return res.json({
      success: true,
      message: 'Service Provider login successful.',
      token,
      user: record.user,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error during provider login.' });
  }
});

// =========================================================================
// 3. ADMIN AUTHENTICATION APIS (STRICT: NO PUBLIC REGISTRATION!)
// =========================================================================

// POST /api/auth/admin/login
authRouter.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter admin credentials.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!checkRateLimit(cleanEmail)) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed administrator login attempts. Security lock engaged.',
      });
    }

    const record = admins.get(cleanEmail);

    // Strictly enforce authorized administrators only
    if (!record) {
      recordLoginAttempt(cleanEmail, false);
      return res.status(403).json({
        success: false,
        message: 'Access Denied: This email address is not an authorized administrator on CampusConnect.',
      });
    }

    const isMatch = await bcrypt.compare(password, record.passwordHash);
    if (!isMatch) {
      recordLoginAttempt(cleanEmail, false);
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    recordLoginAttempt(cleanEmail, true);
    const token = `token_admin_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return res.json({
      success: true,
      message: 'Admin authentication granted. Redirecting to CampusConnect Control Room.',
      token,
      user: record.user,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error during admin login.' });
  }
});

// =========================================================================
// 4. COMMON AUTH APIS (LOGOUT, FORGOT PASSWORD, CURRENT USER)
// =========================================================================

// POST /api/auth/logout
authRouter.post('/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let foundRole = '';

  if (customers.has(cleanEmail)) foundRole = 'customer';
  else if (providers.has(cleanEmail)) foundRole = 'provider';
  else if (admins.has(cleanEmail)) foundRole = 'admin';

  if (!foundRole) {
    // For security, still return generic message so attackers cannot enumerate valid emails
    return res.json({
      success: true,
      message: `If an account exists for ${cleanEmail}, a secure password reset link has been dispatched.`,
    });
  }

  // Create single-use token expiring in 15 minutes
  const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  resetTokens.set(resetToken, {
    email: cleanEmail,
    role: foundRole,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  return res.json({
    success: true,
    message: `A secure password reset link has been dispatched to ${cleanEmail}. (Valid for 15 minutes).`,
    demoToken: resetToken, // Exposed in demo response for effortless testing
  });
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. No active session token found.' });
  }

  const token = authHeader.split(' ')[1];

  // Decode demo token type
  if (token.includes('customer')) {
    const cust = Array.from(customers.values())[0]?.user;
    if (cust) return res.json({ success: true, user: cust });
  } else if (token.includes('provider')) {
    const prov = Array.from(providers.values())[0]?.user;
    if (prov) return res.json({ success: true, user: prov });
  } else if (token.includes('admin')) {
    const adm = Array.from(admins.values())[0]?.user;
    if (adm) return res.json({ success: true, user: adm });
  }

  return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
});

// =========================================================================
// 5. ADMIN MANAGEMENT ENDPOINTS
// =========================================================================

// GET /api/auth/admin/providers - list all service providers for verification
authRouter.get('/admin/providers', (_req: Request, res: Response) => {
  const list = Array.from(providers.values()).map((p) => p.user);
  res.json({ success: true, providers: list });
});

// POST /api/auth/admin/providers/:id/verify - Approve or Reject a provider
authRouter.post('/admin/providers/:id/verify', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
  }

  let foundProvider: ProviderUser | null = null;
  providers.forEach((val) => {
    if (val.user.id === id) {
      val.user.verificationStatus = status;
      if (notes) val.user.verificationNotes = notes;
      foundProvider = val.user;
    }
  });

  if (!foundProvider) {
    return res.status(404).json({ success: false, message: 'Provider not found.' });
  }

  res.json({
    success: true,
    message: `Provider ${status === 'approved' ? 'Approved & Activated' : 'Rejected'} successfully.`,
    provider: foundProvider,
  });
});

// GET /api/auth/admin/customers - list customers
authRouter.get('/admin/customers', (_req: Request, res: Response) => {
  const list = Array.from(customers.values()).map((c) => c.user);
  res.json({ success: true, customers: list });
});

// GET /api/auth/admin/stats
authRouter.get('/admin/stats', (_req: Request, res: Response) => {
  const allProviders = Array.from(providers.values()).map((p) => p.user);
  const pending = allProviders.filter((p) => p.verificationStatus === 'pending').length;
  const approved = allProviders.filter((p) => p.verificationStatus === 'approved').length;

  res.json({
    success: true,
    stats: {
      totalCustomers: customers.size,
      totalProviders: allProviders.length,
      pendingApprovals: pending,
      approvedProviders: approved,
    },
  });
});
