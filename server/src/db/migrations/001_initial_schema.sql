-- =========================================================================
-- NammaServices: Local Services Booking Marketplace
-- Database: nammaservices_db
-- Migration: 001_initial_schema.sql
-- Description: Creates relational tables, check constraints, foreign keys,
--              and performance indexes for PostgreSQL & pgAdmin 4.
-- =========================================================================

-- Ensure UUID or crypt extensions if needed (optional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- 1. Customers Table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'deactivated', 'suspended')),
    avatar_url TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(account_status);

-- -------------------------------------------------------------
-- 2. Providers Table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS providers (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(30) NOT NULL,
    service_category VARCHAR(100) NOT NULL,
    service_description TEXT NOT NULL,
    service_area VARCHAR(200) NOT NULL,
    experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
    verification_status VARCHAR(30) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    verification_notes TEXT,
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'deactivated', 'suspended')),
    avatar_url TEXT,
    hourly_rate NUMERIC(10,2) DEFAULT 349.00 CHECK (hourly_rate >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_providers_email ON providers(email);
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(service_category);
CREATE INDEX IF NOT EXISTS idx_providers_area ON providers(service_area);
CREATE INDEX IF NOT EXISTS idx_providers_verification ON providers(verification_status);
CREATE INDEX IF NOT EXISTS idx_providers_account_status ON providers(account_status);

-- -------------------------------------------------------------
-- 3. Admins Table (Strict: No public registration)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(100) DEFAULT 'Campus & City Operations',
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'deactivated', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- -------------------------------------------------------------
-- 4. Services Table (Offered by Providers)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(64) PRIMARY KEY,
    provider_id VARCHAR(64) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    service_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    indicative_price NUMERIC(10,2) NOT NULL CHECK (indicative_price >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_price ON services(indicative_price);

-- -------------------------------------------------------------
-- 5. Bookings Table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
    provider_id VARCHAR(64) NOT NULL REFERENCES providers(id),
    service_id VARCHAR(64) REFERENCES services(id),
    service_description TEXT NOT NULL,
    service_location TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(50) NOT NULL,
    booking_status VARCHAR(30) DEFAULT 'Pending' CHECK (booking_status IN ('Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed', 'Cancelled')),
    customer_notes TEXT,
    provider_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(preferred_date);

-- -------------------------------------------------------------
-- 6. Reviews Table (Restricted to Completed Bookings)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64) NOT NULL REFERENCES bookings(id),
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
    provider_id VARCHAR(64) NOT NULL REFERENCES providers(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);

-- -------------------------------------------------------------
-- 7. Complaints Table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64) REFERENCES bookings(id),
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
    provider_id VARCHAR(64) NOT NULL REFERENCES providers(id),
    complaint_description TEXT NOT NULL,
    complaint_status VARCHAR(30) DEFAULT 'Open' CHECK (complaint_status IN ('Open', 'Under Review', 'Resolved', 'Dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(complaint_status);
CREATE INDEX IF NOT EXISTS idx_complaints_customer ON complaints(customer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_provider ON complaints(provider_id);

-- -------------------------------------------------------------
-- 8. Provider Availability Table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_availability (
    id VARCHAR(64) PRIMARY KEY,
    provider_id VARCHAR(64) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_availability_provider ON provider_availability(provider_id);
