import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { db as drizzleDb, createPool } from '../db/index.ts';
import {
  users,
  providers,
  services,
  bookings,
  reviews,
  complaints,
} from '../db/schema.ts';
import type {
  Customer,
  Provider,
  Admin,
  ServiceItem,
  Booking,
  Review,
  Complaint,
  ServiceCategory,
  DatabaseStatus,
  BookingStatus,
  ComplaintStatus,
} from '../types/nammaservices.ts';
import {
  findTiDbUserByEmail,
  checkTiDbConnection,
  getTiDbTableCounts,
} from '../db/tidb.ts';

// -------------------------------------------------------------
// Cloud SQL PostgreSQL Connection Check
// -------------------------------------------------------------
const hasCloudSql = Boolean(process.env.SQL_HOST);


// -------------------------------------------------------------
// In-Memory Relational Engine Store (Mirror of PostgreSQL Tables)
// -------------------------------------------------------------
interface StoredRecord<T> {
  data: T;
  passwordHash?: string;
}

class NammaDatabaseStore {
  customers: Map<string, StoredRecord<Customer>> = new Map();
  providers: Map<string, StoredRecord<Provider>> = new Map();
  admins: Map<string, StoredRecord<Admin>> = new Map();
  services: Map<string, ServiceItem> = new Map();
  bookings: Map<string, Booking> = new Map();
  reviews: Map<string, Review> = new Map();
  complaints: Map<string, Complaint> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private async seedInitialData() {
    const salt = await bcrypt.genSalt(10);

    // 1. Seed Customer: Priya Sharma
    const custHash = await bcrypt.hash('Priya@123', salt);
    const cust: Customer = {
      id: 'cust_seed_1',
      role: 'customer',
      full_name: 'Priya Sharma',
      email: 'customer@nammaservices.in',
      phone_number: '+91 98401 11223',
      account_status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      address: 'Flat 4A, Green Meadows Apartments, T. Nagar, Chennai',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.customers.set(cust.email.toLowerCase(), { data: cust, passwordHash: custHash });

    // 2. Seed Admin: Dr. Anand Raman
    const adminHash = await bcrypt.hash('Admin@123', salt);
    const admin: Admin = {
      id: 'admin_seed_1',
      role: 'admin',
      full_name: 'Dr. Anand Raman',
      email: 'admin@nammaservices.in',
      department: 'LocalFix Platform Governance & Audit',
      account_status: 'active',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.admins.set(admin.email.toLowerCase(), { data: admin, passwordHash: adminHash });

    // 2b. Seed Super Admin: Vishnu
    const vishnuHash = await bcrypt.hash('Vishnu@2007', salt);
    const adminVishnu: Admin = {
      id: 'admin_vishnu_1',
      role: 'admin',
      full_name: 'Vishnu (Super Admin)',
      email: 'vishnu68c@gmail.com',
      department: 'Platform Executive & Security Administration',
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.admins.set(adminVishnu.email.toLowerCase(), { data: adminVishnu, passwordHash: vishnuHash });

    // 2c. Seed Alternate Admin: Vishnu Chinnarasu
    const adminVishnu2: Admin = {
      id: 'admin_vishnu_2',
      role: 'admin',
      full_name: 'Vishnu Chinnarasu (Alternate Admin)',
      email: 'vishnuchinnarasu92@gmail.com',
      department: 'Platform Governance & Audit',
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.admins.set(adminVishnu2.email.toLowerCase(), { data: adminVishnu2, passwordHash: vishnuHash });

    // 3. Seed Approved Provider 1: Rajesh Kumar (Electrician)
    const prov1Hash = await bcrypt.hash('Rajesh@123', salt);
    const prov1: Provider = {
      id: 'prov_seed_1',
      role: 'provider',
      full_name: 'Rajesh Kumar',
      business_name: 'SparkWave Electrical Works',
      email: 'rajesh.spark@nammaservices.in',
      phone_number: '+91 98402 33445',
      service_category: 'Electrician',
      service_description: 'Specialist in domestic wiring, switchboards, MCB repair, ceiling fan installation, and safety earthing tests.',
      service_area: 'T. Nagar & Central Chennai',
      experience_years: 8,
      verification_status: 'approved',
      verification_notes: 'Government Wireman Competency License TN-8902 verified by Admin.',
      account_status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      hourly_rate: 349,
      rating: 4.9,
      completed_jobs: 142,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.providers.set(prov1.email.toLowerCase(), { data: prov1, passwordHash: prov1Hash });

    // 4. Seed Approved Provider 2: Selvam M. (Plumber)
    const prov2Hash = await bcrypt.hash('Selvam@123', salt);
    const prov2: Provider = {
      id: 'prov_seed_2',
      role: 'provider',
      full_name: 'Selvam M.',
      business_name: 'Namma Cauvery Plumbing Services',
      email: 'selvam.plumbing@nammaservices.in',
      phone_number: '+91 98403 44556',
      service_category: 'Plumber',
      service_description: 'Expert in water tank cleaning, pipe leakage troubleshooting, tap and sanitary fittings, geyser connections.',
      service_area: 'Velachery & Adyar',
      experience_years: 6,
      verification_status: 'approved',
      verification_notes: 'ITI Certified Plumbing Craftsman credential audited and confirmed.',
      account_status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      hourly_rate: 399,
      rating: 4.8,
      completed_jobs: 98,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.providers.set(prov2.email.toLowerCase(), { data: prov2, passwordHash: prov2Hash });

    // 5. Seed Approved Provider 3: Deepa R. (Home Cleaning)
    const prov3Hash = await bcrypt.hash('Deepa@123', salt);
    const prov3: Provider = {
      id: 'prov_seed_3',
      role: 'provider',
      full_name: 'Deepa R.',
      business_name: 'Thiru Deep Cleaners & Housekeeping',
      email: 'deepa.clean@nammaservices.in',
      phone_number: '+91 98404 55667',
      service_category: 'Home Cleaning',
      service_description: 'Eco-friendly deep residential cleaning, kitchen degreasing, bathroom descaling, balcony wash, and sofa shampooing.',
      service_area: 'Anna Nagar & Kilpauk',
      experience_years: 5,
      verification_status: 'approved',
      verification_notes: 'Aadhaar business identity and police verification clear.',
      account_status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      hourly_rate: 499,
      rating: 5.0,
      completed_jobs: 76,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.providers.set(prov3.email.toLowerCase(), { data: prov3, passwordHash: prov3Hash });

    // 6. Seed Approved Provider 4: Manoj Kumar (Laptop and Computer Repair)
    const prov4Hash = await bcrypt.hash('Manoj@123', salt);
    const prov4: Provider = {
      id: 'prov_seed_4',
      role: 'provider',
      full_name: 'Manoj Kumar',
      business_name: 'Chennai ByteFix Computer Clinic',
      email: 'manoj.tech@nammaservices.in',
      phone_number: '+91 98405 66778',
      service_category: 'Laptop and Computer Repair',
      service_description: 'On-site chip-level diagnostics, RAM/SSD upgrades, screen and keyboard replacement, OS restore, and thermal servicing.',
      service_area: 'OMR / Perungudi',
      experience_years: 7,
      verification_status: 'approved',
      verification_notes: 'Hardware Engineering Diploma and commercial registration verified.',
      account_status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      hourly_rate: 499,
      rating: 4.7,
      completed_jobs: 112,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.providers.set(prov4.email.toLowerCase(), { data: prov4, passwordHash: prov4Hash });

    // 7. Seed Pending Provider 5: Karthik Raja (Appliance Repair) - For Admin Verification Testing!
    const prov5Hash = await bcrypt.hash('Karthik@123', salt);
    const prov5: Provider = {
      id: 'prov_seed_5',
      role: 'provider',
      full_name: 'Karthik Raja',
      business_name: 'QuickFix Washing Machine & Appliance Hub',
      email: 'karthik.appliances@nammaservices.in',
      phone_number: '+91 98406 77889',
      service_category: 'Washing Machine and Appliance Repair',
      service_description: 'Front-load and top-load washing machine repairs, refrigerator cooling diagnostics, microwave oven element service.',
      service_area: 'Tambaram',
      experience_years: 4,
      verification_status: 'pending',
      verification_notes: 'Newly registered provider. Awaiting trade certificate inspection by Administrator.',
      account_status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      hourly_rate: 450,
      rating: 0,
      completed_jobs: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.providers.set(prov5.email.toLowerCase(), { data: prov5, passwordHash: prov5Hash });

    // 8. Seed Services
    const initialServices: ServiceItem[] = [
      {
        id: 'srv_1',
        provider_id: 'prov_seed_1',
        service_name: 'Ceiling Fan & Light Fixture Installation',
        category: 'Electrician',
        description: 'Installation or replacement of fans, LED panel fixtures, chandeliers, and decorative lights.',
        indicative_price: 299,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'srv_2',
        provider_id: 'prov_seed_1',
        service_name: 'Switchboard Repair & Rewiring',
        category: 'Electrician',
        description: 'Diagnosis of burned switches, tripping breakers, socket repairs, and concealed wiring testing.',
        indicative_price: 349,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'srv_3',
        provider_id: 'prov_seed_2',
        service_name: 'Tap & Shower Mixer Repair',
        category: 'Plumber',
        description: 'Replacing leaking spindle valves, shower heads, tap washouts, and angle valves.',
        indicative_price: 249,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'srv_4',
        provider_id: 'prov_seed_2',
        service_name: 'Overhead Water Tank Cleaning',
        category: 'Plumber',
        description: 'Complete high-pressure wash, sediment clearance, and chlorine sanitization of tank up to 1000L.',
        indicative_price: 799,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'srv_5',
        provider_id: 'prov_seed_3',
        service_name: 'Full 2BHK Deep Home Cleaning',
        category: 'Home Cleaning',
        description: 'Full house floor scrubbing, cobweb removal, doors, windows, and disinfection.',
        indicative_price: 1499,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'srv_6',
        provider_id: 'prov_seed_3',
        service_name: 'Kitchen Chimney & Counter Degreasing',
        category: 'Home Cleaning',
        description: 'Heavy grease filter cleaning, tile scrub, and exhaust vent wash.',
        indicative_price: 599,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'srv_7',
        provider_id: 'prov_seed_4',
        service_name: 'Laptop Diagnosis & Thermal Servicing',
        category: 'Laptop and Computer Repair',
        description: 'Dust removal, heatsink thermal paste re-application, fan servicing, and full benchmark inspection.',
        indicative_price: 499,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    initialServices.forEach((s) => this.services.set(s.id, s));

    // 9. Seed Bookings
    const b1: Booking = {
      id: 'BK-1001',
      customer_id: 'cust_seed_1',
      provider_id: 'prov_seed_1',
      service_id: 'srv_2',
      service_description: 'Switchboard Repair & Rewiring in Master Bedroom',
      service_location: 'Flat 4A, Green Meadows Apartments, T. Nagar, Chennai',
      preferred_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      preferred_time: '10:30 AM',
      booking_status: 'Accepted',
      customer_notes: '16A AC socket has spark sounds when switched on. Please bring genuine modular switches.',
      provider_response: 'Request accepted. I will arrive with genuine Anchor/Legrand modular switches.',
      indicative_price: 349,
      customer_name: 'Priya Sharma',
      customer_phone: '+91 98401 11223',
      provider_name: 'Rajesh Kumar',
      provider_business_name: 'SparkWave Electrical Works',
      provider_phone: '+91 98402 33445',
      service_category: 'Electrician',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.bookings.set(b1.id, b1);

    const b2: Booking = {
      id: 'BK-1002',
      customer_id: 'cust_seed_1',
      provider_id: 'prov_seed_3',
      service_id: 'srv_6',
      service_description: 'Kitchen Chimney & Counter Degreasing',
      service_location: 'Flat 4A, Green Meadows Apartments, T. Nagar, Chennai',
      preferred_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      preferred_time: '02:00 PM',
      booking_status: 'Completed',
      customer_notes: 'Kitchen exhaust filter needs deep steam cleaning.',
      provider_response: 'Service completed. Customer signed off with 100% satisfaction.',
      indicative_price: 599,
      customer_name: 'Priya Sharma',
      customer_phone: '+91 98401 11223',
      provider_name: 'Deepa R.',
      provider_business_name: 'Thiru Deep Cleaners & Housekeeping',
      provider_phone: '+91 98404 55667',
      service_category: 'Home Cleaning',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.bookings.set(b2.id, b2);

    // 10. Seed Reviews
    const rev1: Review = {
      id: 'rev_1',
      booking_id: 'BK-1002',
      customer_id: 'cust_seed_1',
      provider_id: 'prov_seed_3',
      rating: 5,
      review_text: 'Deepa did an extraordinary job! The kitchen tiles and chimney look sparkling clean like brand new. On time, polite, and very professional.',
      customer_name: 'Priya Sharma',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    };
    this.reviews.set(rev1.id, rev1);

    // 11. Seed Complaint
    const comp1: Complaint = {
      id: 'comp_1',
      booking_id: 'BK-1002',
      customer_id: 'cust_seed_1',
      provider_id: 'prov_seed_3',
      complaint_description: 'Requesting digital tax invoice copy for residential society reimbursement.',
      complaint_status: 'Resolved',
      admin_notes: 'Admin dispatched official PDF invoice copy to customer email.',
      customer_name: 'Priya Sharma',
      provider_business_name: 'Thiru Deep Cleaners & Housekeeping',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.complaints.set(comp1.id, comp1);
  }
}

export const inMemoryDb = new NammaDatabaseStore();

// -------------------------------------------------------------
// Unified Database Access Helpers
// -------------------------------------------------------------
export const db = {
  isPostgresConnected(): boolean {
    return hasCloudSql;
  },

  async getStatus(): Promise<DatabaseStatus> {
    const tidbCheck = await checkTiDbConnection();
    const tables: DatabaseStatus['tables'] = {
      customers: inMemoryDb.customers.size,
      providers: inMemoryDb.providers.size,
      admins: inMemoryDb.admins.size,
      services: inMemoryDb.services.size,
      bookings: inMemoryDb.bookings.size,
      reviews: inMemoryDb.reviews.size,
      complaints: inMemoryDb.complaints.size,
    };

    if (tidbCheck.connected) {
      try {
        const tidbCounts = await getTiDbTableCounts();
        Object.assign(tables, tidbCounts);
      } catch {
        // Keep fallback counts
      }
    }

    return {
      engine: tidbCheck.connected
        ? 'TiDB Cloud Serverless (MySQL 8.0)'
        : hasCloudSql
        ? 'PostgreSQL'
        : 'In-Memory Engine (Dev Fallback)',
      databaseName: process.env.DB_NAME || process.env.SQL_DB_NAME || 'localfix',
      connected: tidbCheck.connected || hasCloudSql,
      host: tidbCheck.connected
        ? (process.env.DB_HOST || 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com')
        : (process.env.SQL_HOST || 'localhost'),
      port: tidbCheck.connected ? Number(process.env.DB_PORT || 4000) : 5432,
      tables,
    };
  },

  // Customers
  async findCustomerByEmail(email: string) {
    return inMemoryDb.customers.get(email.trim().toLowerCase()) || null;
  },

  async findCustomerById(id: string) {
    for (const record of inMemoryDb.customers.values()) {
      if (record.data.id === id) return record.data;
    }
    return null;
  },

  async createCustomer(customer: Customer, passwordHash: string) {
    inMemoryDb.customers.set(customer.email.toLowerCase(), {
      data: customer,
      passwordHash,
    });
    return customer;
  },

  async listCustomers() {
    return Array.from(inMemoryDb.customers.values()).map((c) => c.data);
  },

  // Providers
  async findProviderByEmail(email: string) {
    return inMemoryDb.providers.get(email.trim().toLowerCase()) || null;
  },

  async findProviderById(id: string) {
    for (const record of inMemoryDb.providers.values()) {
      if (record.data.id === id) return record.data;
    }
    return null;
  },

  async createProvider(provider: Provider, passwordHash: string) {
    inMemoryDb.providers.set(provider.email.toLowerCase(), {
      data: provider,
      passwordHash,
    });
    return provider;
  },

  async listProviders(filter?: {
    category?: string;
    area?: string;
    search?: string;
    verifiedOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }) {
    let list = Array.from(inMemoryDb.providers.values()).map((p) => p.data);

    // By default for public search, only show approved and active providers!
    if (filter?.verifiedOnly !== false) {
      list = list.filter(
        (p) => p.verification_status === 'approved' && p.account_status === 'active'
      );
    }

    if (filter?.category && filter.category !== 'All') {
      list = list.filter((p) => p.service_category === filter.category);
    }

    if (filter?.area && filter.area !== 'All Areas') {
      list = list.filter((p) =>
        p.service_area.toLowerCase().includes(filter.area!.toLowerCase())
      );
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.business_name.toLowerCase().includes(q) ||
          p.service_category.toLowerCase().includes(q) ||
          p.service_area.toLowerCase().includes(q)
      );
    }

    if (filter?.maxPrice) {
      list = list.filter((p) => p.hourly_rate <= filter.maxPrice!);
    }

    return list;
  },

  async listAllProvidersForAdmin() {
    return Array.from(inMemoryDb.providers.values()).map((p) => p.data);
  },

  async verifyProvider(id: string, status: 'approved' | 'rejected', notes?: string) {
    for (const record of inMemoryDb.providers.values()) {
      if (record.data.id === id) {
        record.data.verification_status = status;
        if (notes) record.data.verification_notes = notes;
        record.data.updated_at = new Date().toISOString();
        return record.data;
      }
    }
    return null;
  },

  async updateProviderProfile(id: string, updates: Partial<Provider>) {
    for (const record of inMemoryDb.providers.values()) {
      if (record.data.id === id) {
        // Prevent provider from altering verification_status directly!
        delete updates.verification_status;
        record.data = { ...record.data, ...updates, updated_at: new Date().toISOString() };
        return record.data;
      }
    }
    return null;
  },

  // Admins
  async findAdminByEmail(email: string) {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check TiDB Cloud database
    try {
      const tidbUser = await findTiDbUserByEmail(cleanEmail);
      if (tidbUser && tidbUser.role === 'admin') {
        return {
          data: {
            id: String(tidbUser.id),
            role: 'admin' as const,
            full_name: tidbUser.name || 'Vishnu (Admin)',
            email: tidbUser.email,
            department: 'Platform Operations & Security',
            account_status: tidbUser.is_active ? ('active' as const) : ('suspended' as const),
            created_at: tidbUser.created_at ? new Date(tidbUser.created_at).toISOString() : new Date().toISOString(),
            updated_at: tidbUser.updated_at ? new Date(tidbUser.updated_at).toISOString() : new Date().toISOString(),
          },
          passwordHash: tidbUser.password_hash || undefined,
        };
      }
    } catch (err) {
      console.warn('[LocalFix] Failed to query admin from TiDB Cloud:', err);
    }

    // 2. Check PostgreSQL Cloud SQL
    if (hasCloudSql) {
      try {
        const rows = await drizzleDb
          .select()
          .from(users)
          .where(and(eq(users.email, cleanEmail), eq(users.role, 'admin')));
        if (rows.length > 0) {
          const row = rows[0];
          return {
            data: {
              id: String(row.id),
              role: 'admin' as const,
              full_name: row.fullName,
              email: row.email,
              department: row.department || 'Platform Operations',
              account_status: (row.accountStatus as any) || 'active',
              created_at: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
              updated_at: row.updatedAt ? row.updatedAt.toISOString() : new Date().toISOString(),
            },
            passwordHash: row.passwordHash || undefined,
          };
        }
      } catch (err) {
        console.warn('[LocalFix] Failed to query admin from PostgreSQL:', err);
      }
    }

    // 3. In-memory fallback
    return inMemoryDb.admins.get(cleanEmail) || null;
  },

  // Services
  async listServices(providerId?: string, category?: string) {
    let list = Array.from(inMemoryDb.services.values());
    if (providerId) {
      list = list.filter((s) => s.provider_id === providerId);
    }
    if (category && category !== 'All') {
      list = list.filter((s) => s.category === category);
    }
    return list;
  },

  async createService(item: ServiceItem) {
    inMemoryDb.services.set(item.id, item);
    return item;
  },

  // Bookings
  async createBooking(booking: Booking) {
    inMemoryDb.bookings.set(booking.id, booking);
    return booking;
  },

  async listBookingsByCustomer(customerId: string) {
    return Array.from(inMemoryDb.bookings.values()).filter(
      (b) => b.customer_id === customerId
    );
  },

  async listBookingsByProvider(providerId: string) {
    return Array.from(inMemoryDb.bookings.values()).filter(
      (b) => b.provider_id === providerId
    );
  },

  async listAllBookings() {
    return Array.from(inMemoryDb.bookings.values());
  },

  async findBookingById(id: string) {
    return inMemoryDb.bookings.get(id) || null;
  },

  async updateBookingStatus(
    id: string,
    newStatus: BookingStatus,
    providerResponse?: string
  ) {
    const booking = inMemoryDb.bookings.get(id);
    if (!booking) return null;
    booking.booking_status = newStatus;
    if (providerResponse) booking.provider_response = providerResponse;
    booking.updated_at = new Date().toISOString();

    // If completed, increment provider completed_jobs counter
    if (newStatus === 'Completed') {
      const provider = await this.findProviderById(booking.provider_id);
      if (provider) {
        provider.completed_jobs = (provider.completed_jobs || 0) + 1;
      }
    }
    return booking;
  },

  async cancelBooking(id: string, reason?: string) {
    const booking = inMemoryDb.bookings.get(id);
    if (!booking) return null;
    if (booking.booking_status === 'Completed') {
      throw new Error('Completed bookings cannot be cancelled.');
    }
    booking.booking_status = 'Cancelled';
    if (reason) {
      booking.customer_notes = `${booking.customer_notes || ''} [Cancellation reason: ${reason}]`;
    }
    booking.updated_at = new Date().toISOString();
    return booking;
  },

  // Reviews
  async createReview(review: Review) {
    // Check that booking is Completed
    const booking = inMemoryDb.bookings.get(review.booking_id);
    if (!booking || booking.booking_status !== 'Completed') {
      throw new Error('Reviews can only be submitted for completed service bookings.');
    }
    inMemoryDb.reviews.set(review.id, review);

    // Recalculate provider rating
    const providerReviews = Array.from(inMemoryDb.reviews.values()).filter(
      (r) => r.provider_id === review.provider_id
    );
    const avg =
      providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
    const provider = await this.findProviderById(review.provider_id);
    if (provider) {
      provider.rating = parseFloat(avg.toFixed(1));
    }
    return review;
  },

  async listReviewsByProvider(providerId: string) {
    return Array.from(inMemoryDb.reviews.values()).filter(
      (r) => r.provider_id === providerId
    );
  },

  async listAllReviews() {
    return Array.from(inMemoryDb.reviews.values());
  },

  // Complaints
  async createComplaint(complaint: Complaint) {
    inMemoryDb.complaints.set(complaint.id, complaint);
    return complaint;
  },

  async listComplaints() {
    return Array.from(inMemoryDb.complaints.values());
  },

  async updateComplaint(
    id: string,
    status: ComplaintStatus,
    adminNotes?: string
  ) {
    const comp = inMemoryDb.complaints.get(id);
    if (!comp) return null;
    comp.complaint_status = status;
    if (adminNotes) comp.admin_notes = adminNotes;
    comp.updated_at = new Date().toISOString();
    return comp;
  },

  async updateAccountStatus(id: string, status: 'active' | 'deactivated' | 'suspended') {
    for (const record of inMemoryDb.customers.values()) {
      if (record.data.id === id) {
        record.data.account_status = status;
        return record.data;
      }
    }
    for (const record of inMemoryDb.providers.values()) {
      if (record.data.id === id) {
        record.data.account_status = status;
        return record.data;
      }
    }
    return null;
  },
};
