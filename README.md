# NammaServices – Local Services Booking Marketplace

> **“Ungal Area, Ungal Services.”**  
> Hyperlocal marketplace connecting residents, families, hostel students, and small businesses with background-verified trade professionals across Tamil Nadu neighborhoods.

---

## 1. Project Abstract & Problem Statement

### Problem Statement
Finding skilled, punctual, and reliable local service technicians (electricians, plumbers, appliance mechanics, cleaners, and computer repairers) in urban localities is plagued by opaque pricing, lack of verified credentials, missed appointments, and zero grievance redressal.

### Proposed Solution
**NammaServices** provides a unified, mobile-responsive full-stack platform backed by a normalized **PostgreSQL** relational database. Customers search by locality and trade category, compare transparent indicative pricing, schedule appointments, track dispatch status, and submit genuine reviews. Every service provider undergoes an administrative document audit before being activated for public bookings.

---

## 2. Technology Stack

- **Frontend:** React 19, Vite, React Router DOM, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js (REST API architecture)
- **Database:** PostgreSQL (`nammaservices_db`), `pg` Node.js connection pooling, SQL migrations
- **Database Management:** pgAdmin 4
- **Security:** Salted bcrypt password hashing, role-based route guards, parameterized SQL queries, rate limiting, and expiring single-use reset tokens

---

## 3. System Architecture Diagram

```
+-------------------------------------------------------------------------------+
|                             CLIENT APPLICATION                                |
|  React 19 SPA + Vite + Tailwind CSS + Lucide Icons + React Router DOM        |
|                                                                               |
|  [ Customer Portal ]       [ Service Provider Portal ]     [ Admin Console ]  |
|  - Locality Search         - Profile & Trade Details       - Verification Q   |
|  - Booking Scheduler       - Accept/Decline Job Orders     - User Management  |
|  - Review & Grievances     - Live Dispatch Status          - pgAdmin 4 Guide  |
+---------------------------------------+---------------------------------------+
                                        |  REST API (JSON / Bearer Tokens)
                                        v
+-------------------------------------------------------------------------------+
|                             EXPRESS.JS BACKEND                                |
|  Port 3000 / Node.js Engine                                                   |
|                                                                               |
|  - /api/auth/*             : Customer, Provider, Admin Auth & Bcrypt Hashing  |
|  - /api/providers/*        : Locality Search & Category Filtering             |
|  - /api/bookings/*         : Order Lifecycle & Concurrency Protection         |
|  - /api/reviews/*          : Completion Verified Ratings (1 - 5 Stars)        |
|  - /api/complaints/*       : Grievance Desk Logging & Administrative Audit    |
|  - /api/admin/*            : Verification Pipeline & User Controls            |
|  - /api/db/status          : Connection Telemetry & pgAdmin Diagnostics       |
+---------------------------------------+---------------------------------------+
                                        |  `pg` Connection Pool / SQL
                                        v
+-------------------------------------------------------------------------------+
|                      POSTGRESQL DATABASE (nammaservices_db)                   |
|  pgAdmin 4 Managed Relational Engine on Port 5432                             |
|                                                                               |
|  [customers]             [providers]                [admins]                  |
|  [services]              [bookings]                 [reviews]                 |
|  [complaints]            [provider_availability]                              |
+-------------------------------------------------------------------------------+
```

---

## 4. Booking Workflow Diagram

```
[ Customer ]
     |
     | 1. Selects Locality (e.g., T. Nagar) & Trade (e.g., Electrician)
     v
[ NammaServices Discovery Engine ]
     |
     | 2. Filters & Displays Approved & Active Providers
     v
[ Provider Profile & Schedule ]
     |
     | 3. Chooses Date, Time Slot, Enters Location & Problem Scope
     | 4. Submits Request (Status: PENDING)
     v
[ Backend Concurrency Validation ]
     |
     | 5. Checks Slot Availability & Saves into PostgreSQL
     v
[ Provider Dashboard Alert ]
     |
     +-----> [ Reject ] ----> Customer Notified (Status: REJECTED)
     |
     +-----> [ Accept ] ----> (Status: ACCEPTED)
                  |
                  | 6. Provider Updates: "On the way / In Progress"
                  v
             [ In Progress ]
                  |
                  | 7. Job Finished: "Mark Completed"
                  v
             [ Completed ]
                  |
                  v
[ Genuine Review & Rating ] (1 to 5 Stars unlocked for Customer)
```

---

## 5. PostgreSQL Entity-Relationship (ER) Diagram

```
  +------------------+         +--------------------------+
  |    customers     |         |        providers         |
  +------------------+         +--------------------------+
  | PK id            |         | PK id                    |
  |    full_name     |         |    full_name             |
  |    email (UQ)    |         |    business_name         |
  |    phone_number  |         |    email (UQ)            |
  |    password_hash |         |    phone_number          |
  |    account_status|         |    service_category      |
  |    address       |         |    service_area          |
  |    created_at    |         |    experience_years      |
  |    updated_at    |         |    verification_status   |
  +--------+---------+         |    account_status        |
           |                   |    hourly_rate           |
           |                   |    created_at            |
           |                   +-------------+------------+
           | 1                               | 1
           |                                 |
           | N                               | N
  +--------v---------------------------------v------------+
  |                       bookings                        |
  +-------------------------------------------------------+
  | PK id                                                 |
  | FK customer_id  ------> customers.id                  |
  | FK provider_id  ------> providers.id                  |
  | FK service_id   ------> services.id                   |
  |    service_description                                |
  |    service_location                                   |
  |    preferred_date                                     |
  |    preferred_time                                     |
  |    booking_status (Pending, Accepted, In Progress...) |
  |    indicative_price                                   |
  |    created_at / updated_at                            |
  +---------------------------+---------------------------+
                              | 1
                              |
                              | 1..*
  +---------------------------v---------------------------+
  |                       reviews                         |
  +-------------------------------------------------------+
  | PK id                                                 |
  | FK booking_id   ------> bookings.id                   |
  | FK customer_id  ------> customers.id                  |
  | FK provider_id  ------> providers.id                  |
  |    rating (CHECK 1 <= rating <= 5)                    |
  |    review_text                                        |
  |    created_at                                         |
  +-------------------------------------------------------+
```

---

## 6. PostgreSQL & pgAdmin 4 Step-by-Step Setup Guide

Follow these exact steps to connect the Express backend to a real PostgreSQL database using pgAdmin 4:

### Step 1: Install PostgreSQL & pgAdmin 4
- Download from the official website: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
- Select your operating system (Windows, macOS, or Linux).
- During installation, leave the default port as **`5432`** and note your superuser (`postgres`) password.

### Step 2: Launch pgAdmin 4
- Open **pgAdmin 4** from your Start menu or Applications folder.
- Set a master password when prompted.

### Step 3: Register / Connect to Local Server
- In the left sidebar (*Object Explorer*), expand **Servers**.
- If no server is listed:
  - Right-click **Servers** → **Register** → **Server...**
  - Name: `PostgreSQL Local`
  - Connection tab: Host: `localhost`, Port: `5432`, Username: `postgres`, Password: `<your_password>`
  - Click **Save**.

### Step 4: Create the Database `nammaservices_db`
- In the Object Explorer, right-click **Databases** → **Create** → **Database...**
- Database name: **`nammaservices_db`**
- Encoding: `UTF8`
- Click **Save**.

### Step 5: Configure Dedicated Database User
- In pgAdmin 4, select **`nammaservices_db`**, then click **Tools** → **Query Tool**.
- Run the following SQL script to create a secure, dedicated app user:
```sql
CREATE USER namma_user WITH PASSWORD 'namma_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nammaservices_db TO namma_user;
GRANT ALL ON SCHEMA public TO namma_user;
```

### Step 6: Execute the SQL Schema Migration
- In the pgAdmin 4 Query Tool, click the **Open File** icon (folder).
- Select file: `server/src/db/migrations/001_initial_schema.sql`.
- Press **F5** (or the Play button) to execute the script.
- Verify that the 8 tables (`customers`, `providers`, `admins`, `services`, `bookings`, `reviews`, `complaints`, `provider_availability`) appear under **Schemas** → **public** → **Tables**.

### Step 7: Seed Initial Verified Records
- In the Query Tool, open `server/src/db/seeds/001_seed_data.sql`.
- Press **F5** to execute. This populates pre-verified providers (Rajesh Kumar, Selvam, Deepa, Manoj), seed customer Priya Sharma, and Administrator Dr. Anand Raman.

### Step 8: Configure Environment Variables
Create or update your `.env` file in the project root:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://namma_user:namma_secure_password@localhost:5432/nammaservices_db"
PGHOST="localhost"
PGPORT=5432
PGDATABASE="nammaservices_db"
PGUSER="namma_user"
PGPASSWORD="namma_secure_password"
```

### Step 9: Start the Application
Run the dev server:
```bash
npm run dev
```
The console will log:
```
[NammaServices] Successfully connected to PostgreSQL: nammaservices_db
[NammaServices] Marketplace server listening on http://0.0.0.0:3000
```

### Step 10: Inspect Live Records in pgAdmin 4
- Open pgAdmin 4 → `nammaservices_db` → `Tables`.
- Right-click `bookings` or `customers` → **View/Edit Data** → **All Rows**.
- When you register a new customer or book a technician on the website, refresh in pgAdmin 4 to observe real-time row insertion!

---

## 7. Pre-Configured Test Accounts (1-Click Buttons Available)

| Entity | Portal URL | Demo Email | Password | Role / Access Details |
|---|---|---|---|---|
| **Customer** | `/login/customer` | `customer@nammaservices.in` | `Priya@123` | Active customer profile (T. Nagar) |
| **Provider (Approved)** | `/login/provider` | `rajesh.spark@nammaservices.in` | `Rajesh@123` | SparkWave Electricals (Verified) |
| **Provider (Pending)** | `/login/provider` | `karthik.appliances@nammaservices.in` | `Karthik@123` | QuickFix Appliance Hub (Pending Audit) |
| **Admin** | `/login/admin` | `admin@nammaservices.in` | `Admin@123` | Dr. Anand Raman (Full Governance) |

---

## 8. Test Execution & Evidence

To run the automated test suite executing business logic, double-booking prevention, and constraint checks:

```bash
npm test
```

### Test Results:
```json
[
  {
    "name": "Double booking prevention blocks conflicting confirmed booking for same provider and time slot",
    "passed": true
  },
  {
    "name": "Newly registered providers remain pending until approved by platform administrator",
    "passed": true
  },
  {
    "name": "Reviews are strictly prohibited unless the service booking status is Completed",
    "passed": true
  },
  {
    "name": "Review ratings must adhere to check constraint (1 <= rating <= 5)",
    "passed": true
  },
  {
    "name": "Indicative price and experience years must not be negative",
    "passed": true
  }
]
```

---

## 9. Business Model & Future Growth

1. **Local Pilot Strategy:**
   - Launch in one dense urban cluster (e.g. T. Nagar & Velachery).
   - Onboard 15–20 certified technicians across 12 essential trades.
   - Run customer feedback cycles and verify on-time arrival metrics.

2. **Monetization Roadmap:**
   - **Optional Provider Subscription:** ₹99–₹199/month for featured locality placement.
   - **Post-Service Commission:** Proposed 5–10% on completed jobs upon provider agreement.
   - **Enterprise & Residential Society Partnerships:** Maintenance contracts for gated communities.

3. **Future Planned Features:**
   - Bi-lingual English & Tamil interface toggle.
   - GPS-grounded distance map routing.
   - Secure UPI in-app digital escrow payments.
