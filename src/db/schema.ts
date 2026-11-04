import { pgTable, serial, text, integer, boolean, numeric, timestamp } from 'drizzle-orm/pg-core';

// Users table (Customers, Admins, Firebase synced users)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(), // Firebase Auth UID
  role: text('role').notNull().default('customer'), // 'customer' | 'admin' | 'provider'
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  phoneNumber: text('phone_number'),
  passwordHash: text('password_hash'),
  accountStatus: text('account_status').notNull().default('active'),
  avatarUrl: text('avatar_url'),
  address: text('address'),
  department: text('department'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Service Providers table
export const providers = pgTable('providers', {
  id: serial('id').primaryKey(),
  providerId: text('provider_id').notNull().unique(),
  fullName: text('full_name').notNull(),
  businessName: text('business_name').notNull(),
  email: text('email').notNull().unique(),
  phoneNumber: text('phone_number').notNull(),
  serviceCategory: text('service_category').notNull(),
  serviceDescription: text('service_description'),
  serviceArea: text('service_area').notNull(),
  experienceYears: integer('experience_years').notNull().default(0),
  verificationStatus: text('verification_status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  verificationNotes: text('verification_notes'),
  accountStatus: text('account_status').notNull().default('active'),
  avatarUrl: text('avatar_url'),
  hourlyRate: integer('hourly_rate').notNull().default(300),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('5.00'),
  completedJobs: integer('completed_jobs').notNull().default(0),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Service Offerings table
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  serviceId: text('service_id').notNull().unique(),
  providerId: text('provider_id').notNull(),
  serviceName: text('service_name').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  indicativePrice: integer('indicative_price').notNull().default(350),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  bookingId: text('booking_id').notNull().unique(),
  customerId: text('customer_id').notNull(),
  providerId: text('provider_id').notNull(),
  serviceId: text('service_id'),
  serviceDescription: text('service_description').notNull(),
  serviceLocation: text('service_location').notNull(),
  preferredDate: text('preferred_date').notNull(),
  preferredTime: text('preferred_time').notNull(),
  bookingStatus: text('booking_status').notNull().default('Pending'),
  customerNotes: text('customer_notes'),
  providerResponse: text('provider_response'),
  indicativePrice: integer('indicative_price').notNull().default(350),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  providerName: text('provider_name'),
  providerBusinessName: text('provider_business_name'),
  providerPhone: text('provider_phone'),
  serviceCategory: text('service_category'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  reviewId: text('review_id').notNull().unique(),
  bookingId: text('booking_id').notNull(),
  customerId: text('customer_id').notNull(),
  providerId: text('provider_id').notNull(),
  rating: integer('rating').notNull(), // 1 to 5
  reviewText: text('review_text').notNull(),
  customerName: text('customer_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Complaints table
export const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  complaintId: text('complaint_id').notNull().unique(),
  bookingId: text('booking_id'),
  customerId: text('customer_id').notNull(),
  providerId: text('provider_id').notNull(),
  complaintDescription: text('complaint_description').notNull(),
  complaintStatus: text('complaint_status').notNull().default('Open'),
  adminNotes: text('admin_notes'),
  customerName: text('customer_name'),
  providerBusinessName: text('provider_business_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
