-- =========================================================================
-- NammaServices: Seed Data
-- Database: nammaservices_db
-- Migration: 001_seed_data.sql
-- Description: Seeds verified sample customers, approved/pending providers,
--              services, bookings, genuine reviews, and complaints.
-- Password Hashes: bcrypt salt 10 (e.g. Priya@123, Rajesh@123, Admin@123)
-- =========================================================================

-- 1. Customers
INSERT INTO customers (id, full_name, email, phone_number, password_hash, account_status, avatar_url, address)
VALUES
('cust_seed_1', 'Priya Sharma', 'customer@nammaservices.in', '+91 98401 11223', '$2b$10$w82U8g9.k8H1B1qK0U.6yOq2Z06.q1R9W3m2V8p8N4z6C3e7T0u1O', 'active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Flat 4A, Green Meadows Apartments, T. Nagar, Chennai')
ON CONFLICT (email) DO NOTHING;

-- 2. Admins (Protected)
INSERT INTO admins (id, full_name, email, password_hash, department, account_status)
VALUES
('admin_seed_1', 'Dr. Anand Raman', 'admin@nammaservices.in', '$2b$10$1y4Y3n1.X8V2K1qK0U.6yOq2Z06.q1R9W3m2V8p8N4z6C3e7T0u1A', 'NammaServices Platform Governance & Audit', 'active')
ON CONFLICT (email) DO NOTHING;

-- 3. Providers (Approved & Pending)
INSERT INTO providers (id, full_name, business_name, email, phone_number, service_category, service_description, service_area, experience_years, verification_status, verification_notes, account_status, avatar_url, hourly_rate)
VALUES
(
    'prov_seed_1',
    'Rajesh Kumar',
    'SparkWave Electrical Works',
    'rajesh.spark@nammaservices.in',
    '+91 98402 33445',
    'Electrician',
    'Specialist in domestic wiring, switchboards, MCB repair, ceiling fan installation, and safety earthing tests.',
    'T. Nagar & Central Chennai',
    8,
    'approved',
    'Government Wireman Competency License TN-8902 verified by Admin.',
    'active',
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    349.00
),
(
    'prov_seed_2',
    'Selvam M.',
    'Namma Cauvery Plumbing Services',
    'selvam.plumbing@nammaservices.in',
    '+91 98403 44556',
    'Plumber',
    'Expert in water tank cleaning, pipe leakage troubleshooting, tap and sanitary fittings, geyser connections.',
    'Velachery & Adyar',
    6,
    'approved',
    'ITI Certified Plumbing Craftsman credential audited and confirmed.',
    'active',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    399.00
),
(
    'prov_seed_3',
    'Deepa R.',
    'Thiru Deep Cleaners & Housekeeping',
    'deepa.clean@nammaservices.in',
    '+91 98404 55667',
    'Home Cleaning',
    'Eco-friendly deep residential cleaning, kitchen degreasing, bathroom descaling, balcony wash, and sofa shampooing.',
    'Anna Nagar & Kilpauk',
    5,
    'approved',
    'Aadhaar business identity and police verification clear.',
    'active',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    499.00
),
(
    'prov_seed_4',
    'Manoj Kumar',
    'Chennai ByteFix Computer Clinic',
    'manoj.tech@nammaservices.in',
    '+91 98405 66778',
    'Laptop and Computer Repair',
    'On-site chip-level diagnostics, RAM/SSD upgrades, screen and keyboard replacement, OS restore, and thermal servicing.',
    'OMR, Thoraipakkam & Perungudi',
    7,
    'approved',
    'Hardware Engineering Diploma and commercial registration verified.',
    'active',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    499.00
),
(
    'prov_seed_5',
    'Karthik Raja',
    'QuickFix Washing Machine & Appliance Hub',
    'karthik.appliances@nammaservices.in',
    '+91 98406 77889',
    'Washing Machine and Appliance Repair',
    'Front-load and top-load washing machine repairs, refrigerator cooling diagnostics, microwave oven element service.',
    'Tambaram & Chromepet',
    4,
    'pending',
    'Newly registered provider. Awaiting trade certificate upload verification by Administrator.',
    'active',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    450.00
)
ON CONFLICT (email) DO NOTHING;

-- 4. Services Offered by Providers
INSERT INTO services (id, provider_id, service_name, category, description, indicative_price, is_active)
VALUES
('srv_1', 'prov_seed_1', 'Ceiling Fan & Light Fixture Installation', 'Electrician', 'Installation or replacement of fans, LED panel fixtures, chandeliers, and decorative lights.', 299.00, true),
('srv_2', 'prov_seed_1', 'Switchboard Repair & Rewiring', 'Electrician', 'Diagnosis of burned switches, tripping breakers, socket repairs, and concealed wiring testing.', 349.00, true),
('srv_3', 'prov_seed_2', 'Tap & Shower Mixer Repair', 'Plumber', 'Replacing leaking spindle valves, shower heads, tap washouts, and angle valves.', 249.00, true),
('srv_4', 'prov_seed_2', 'Overhead Water Tank Cleaning', 'Plumber', 'Complete high-pressure wash, sediment clearance, and chlorine sanitization of tank up to 1000L.', 799.00, true),
('srv_5', 'prov_seed_3', 'Full 2BHK Deep Home Cleaning', 'Home Cleaning', 'Full house floor scrubbing, cobweb removal, doors, windows, and disinfection.', 1499.00, true),
('srv_6', 'prov_seed_3', 'Kitchen Chimney & Counter Degreasing', 'Home Cleaning', 'Heavy grease filter cleaning, tile scrub, and exhaust vent wash.', 599.00, true),
('srv_7', 'prov_seed_4', 'Laptop Diagnosis & Thermal Servicing', 'Laptop and Computer Repair', 'Dust removal, heatsink thermal paste re-application, fan servicing, and full benchmark inspection.', 499.00, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Bookings
INSERT INTO bookings (id, customer_id, provider_id, service_id, service_description, service_location, preferred_date, preferred_time, booking_status, customer_notes, provider_response)
VALUES
(
    'bk_seed_1',
    'cust_seed_1',
    'prov_seed_1',
    'srv_2',
    'Switchboard Repair & Rewiring in Master Bedroom',
    'Flat 4A, Green Meadows Apartments, T. Nagar, Chennai',
    CURRENT_DATE + INTERVAL '1 day',
    '10:30 AM',
    'Accepted',
    'The 16A AC socket has spark sounds when switched on. Please bring replacement switches.',
    'Request accepted. I will arrive with genuine Anchor/Legrand modular switches.'
),
(
    'bk_seed_2',
    'cust_seed_1',
    'prov_seed_3',
    'srv_6',
    'Kitchen Chimney & Counter Degreasing',
    'Flat 4A, Green Meadows Apartments, T. Nagar, Chennai',
    CURRENT_DATE - INTERVAL '3 days',
    '02:00 PM',
    'Completed',
    'Kitchen exhaust filter needs deep steam cleaning.',
    'Service completed. Customer signed off with satisfaction.'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Reviews (Genuine completed reviews)
INSERT INTO reviews (id, booking_id, customer_id, provider_id, rating, review_text)
VALUES
(
    'rev_seed_1',
    'bk_seed_2',
    'cust_seed_1',
    'prov_seed_3',
    5,
    'Deepa did an extraordinary job! The kitchen tiles and chimney look sparkling clean like brand new. On time, polite, and very professional.'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Complaints
INSERT INTO complaints (id, booking_id, customer_id, provider_id, complaint_description, complaint_status, admin_notes)
VALUES
(
    'comp_seed_1',
    'bk_seed_2',
    'cust_seed_1',
    'prov_seed_3',
    'Requesting digital tax receipt copy for housing society reimbursement.',
    'Resolved',
    'Admin dispatched official PDF invoice copy to customer email.'
)
ON CONFLICT (id) DO NOTHING;
