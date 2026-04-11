# KindCare Connect — System Documentation
### Gertrude's Children's Hospital Digital Pediatric Care Platform

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Project Structure](#3-project-structure)
4. [Environment & Configuration](#4-environment--configuration)
5. [Database Schema](#5-database-schema)
6. [Module 1 — Authentication](#6-module-1--authentication)
7. [Module 2 — User & Doctor Management](#7-module-2--user--doctor-management)
8. [Module 3 — Child Profiles](#8-module-3--child-profiles)
9. [Module 4 — Appointments](#9-module-4--appointments)
10. [Module 5 — Queue Management](#10-module-5--queue-management)
11. [Module 6 — Medical Records](#11-module-6--medical-records)
12. [Module 7 — Telemedicine](#12-module-7--telemedicine)
13. [Module 8 — Notifications](#13-module-8--notifications)
14. [Module 9 — Billing & Payments](#14-module-9--billing--payments)
15. [Module 10 — Admin & Analytics](#15-module-10--admin--analytics)
16. [Frontend — Pages & Navigation](#16-frontend--pages--navigation)
17. [Role-Based Access Control](#17-role-based-access-control)
18. [API Reference](#18-api-reference)
19. [Running the System](#19-running-the-system)
20. [Seeded Test Data](#20-seeded-test-data)

---

## 1. System Overview

KindCare Connect is a full-stack digital health platform built for Gertrude's Children's Hospital (GCH). It enables parents to manage their children's healthcare, doctors to manage their patients and schedules, and administrators to oversee the entire platform.

**Key capabilities:**
- Parent self-service: child registration, doctor discovery, appointment booking, billing
- Doctor portal: appointment management, patient history, schedule overview
- Admin portal: platform-wide oversight, audit trails, revenue analytics
- Mock payment flow with M-Pesa, Card, Cash, and Insurance options
- Real-time notifications system
- Telemedicine session management with in-session messaging

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                           │
│  Vite + React 18 + TypeScript + TailwindCSS + shadcn/ui          │
│  Port: 8080                                                       │
│  Location: ~/Documents/Gertrudes_Projects/kindcare-connect        │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP/JSON (Axios)
                             │ JWT Bearer tokens
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express.js)                       │
│  Node.js + Express 4 + Sequelize 6 ORM                           │
│  Port: 3000                                                       │
│  Location: ~/Documents/Gertrudes_Projects/Gertrudes               │
└────────────────────────────┬─────────────────────────────────────┘
                             │ SQL (mysql2 driver)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                               │
│  Database: gertrudes_pediatric                                    │
│  User: root / no password                                        │
│  Managed via phpMyAdmin                                           │
└──────────────────────────────────────────────────────────────────┘
```

**Backend Middleware Stack (in order):**
1. `helmet` — HTTP security headers
2. `cors` — Cross-origin requests from `http://localhost:8080`
3. `express-rate-limit` — 1000 req/15 min global; 10 req/15 min on auth endpoints
4. `compression` — gzip responses
5. `express.json` — JSON body parsing (10 MB limit)
6. `morgan` — HTTP request logging via Winston
7. `authenticate` — JWT verification middleware (on protected routes)
8. `authorize` — Role-based access control (on role-restricted routes)
9. `errorHandler` — Centralized error responses

---

## 3. Project Structure

### Backend (`~/Gertrudes/`)

```
server.js                    ← Entry point (starts Express + DB)
src/
  app.js                     ← Express app, middleware, route mounting
  config/
    database.js              ← Sequelize MySQL config
  models/
    index.js                 ← Sequelize instance + all associations
    User.js
    Doctor.js
    Parent.js
    Child.js
    Appointment.js
    MedicalRecord.js
    TelemedicineSession.js
    Message.js
    Queue.js
    Notification.js
    AuditLog.js
    Invoice.js
    Payment.js
  controllers/               ← Business logic, one file per module
  routes/                    ← Express router definitions
  middleware/
    auth.js                  ← authenticate() — JWT verification
    rbac.js                  ← authorize(...roles) — role guard
    validation.js            ← express-validator error handler
    upload.js                ← multer file upload config
    errorHandler.js          ← notFound + errorHandler middleware
  services/
    notificationService.js   ← Creates DB notification records
  utils/
    logger.js                ← Winston logger with daily rotation
    auditLogger.js           ← Writes to audit_logs table
    pagination.js            ← paginate() + paginatedResponse() helpers
    helpers.js               ← isTimeSlotAvailable() and others
migrations/                  ← Sequelize CLI migration files (7 files)
seeders/                     ← Seed data files
uploads/                     ← File upload storage directory
.env                         ← Environment variables
```

### Frontend (`~/kindcare-connect/`)

```
public/
  GCH-Logo.png               ← Hospital logo used in navbar
src/
  App.tsx                    ← Root component, React Router routes
  main.tsx                   ← React entry point
  index.css                  ← Design tokens (CSS vars), print styles
  lib/
    api.ts                   ← Axios instance + all API namespaces + TypeScript types
    utils.ts                 ← Tailwind class utility
  contexts/
    AuthContext.tsx           ← JWT auth state, login/logout, session restore
  types/
    index.ts                 ← Frontend User type, UserRole enum
  components/
    Layout.tsx               ← Header + nav + mobile bottom bar wrapper
    ProtectedRoute.tsx       ← Role-based route guard
    StatusBadge.tsx          ← Colored badge for appointment/payment status
    NavLink.tsx              ← Styled navigation link
    ui/                      ← shadcn/ui component library
  pages/
    Login.tsx
    Register.tsx
    ParentDashboard.tsx
    ChildProfiles.tsx
    DoctorDiscovery.tsx
    BookAppointment.tsx
    Appointments.tsx
    Telemedicine.tsx
    Notifications.tsx
    DoctorDashboard.tsx
    AdminDashboard.tsx
    Billing.tsx
    AdminBilling.tsx
    Unauthorized.tsx
    NotFound.tsx
```

---

## 4. Environment & Configuration

### Backend `.env`

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gertrudes_pediatric
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=gch_super_secret_jwt_key_2024_kindcare
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=gch_refresh_secret_key_2024_kindcare
JWT_REFRESH_EXPIRES_IN=30d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000

# CORS
FRONTEND_URL=http://localhost:8080

# Email (optional — Nodemailer/SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
MAX_FILE_SIZE=10485760     # 10 MB
UPLOAD_PATH=./uploads
```

### Frontend environment

The frontend reads `VITE_API_URL` from `.env`. Default fallback:
```
http://localhost:3000/api
```

### API Response Envelope

Every API response follows this shape:

```json
{ "success": true, "data": <T> }
```

Paginated list responses:
```json
{
  "success": true,
  "data": [ ...items ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

Error responses:
```json
{ "success": false, "message": "Human-readable error" }
```

---

## 5. Database Schema

The database `gertrudes_pediatric` has 13 tables, created by 7 sequential migrations.

### Entity Relationship Summary

```
users (1) ──→ (1) doctors
users (1) ──→ (1) parents
parents (1) ──→ (N) children
children (1) ──→ (N) appointments ←── (N) doctors
appointments (1) ──→ (1) medical_records
appointments (1) ──→ (1) telemedicine_sessions
appointments (1) ──→ (1) queues
appointments (1) ──→ (1) invoices
invoices (1) ──→ (N) payments
telemedicine_sessions (1) ──→ (N) messages
users (1) ──→ (N) notifications
users (1) ──→ (N) audit_logs
```

### Table Descriptions

| Table | Key Fields | Purpose |
|---|---|---|
| `users` | id, firstName, lastName, email, role, isActive | Base account for all user types |
| `doctors` | userId, licenseNumber, specialty, consultationFee, availabilitySchedule (JSON) | Doctor profile linked to user |
| `parents` | userId, relationship, address, insuranceProvider | Parent profile linked to user |
| `children` | parentId, firstName, dateOfBirth, bloodType, allergies (JSON), vaccinationHistory (JSON) | Child health record |
| `appointments` | doctorId, childId, bookedById, appointmentDate, appointmentTime, status, type | Appointment booking |
| `medical_records` | childId, doctorId, appointmentId, diagnoses (JSON), prescriptions (JSON), labResults (JSON) | Clinical visit record |
| `telemedicine_sessions` | appointmentId, roomUrl, status, startedAt, endedAt | Virtual consultation session |
| `messages` | sessionId, senderId, content, messageType | In-session chat messages |
| `queues` | appointmentId, queueNumber, status | Physical clinic queue tracking |
| `notifications` | userId, type, title, body, isRead, channel | In-app user notifications |
| `audit_logs` | userId, action, resource, resourceId, ipAddress | Security audit trail |
| `invoices` | appointmentId, parentId, doctorId, childId, lineItems (JSON), totalAmount, status | Billing invoices |
| `payments` | invoiceId, parentId, amount, method, status, mpesaCode, cardLast4 | Payment records |

### JSON Fields (MySQL Storage Note)

MySQL stores `DataTypes.JSON` columns as serialised strings when inserted via `queryInterface.bulkInsert()`. All affected models include a `get()` getter using the `safeArray` helper to auto-parse the value:

```js
const safeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
  return val ?? [];
};
```

Affected fields: `allergies`, `chronicConditions`, `currentMedications`, `vaccinationHistory` (Child), `symptoms` (Appointment), `availabilitySchedule` (Doctor), `diagnoses`, `prescriptions`, `labResults`, `attachments` (MedicalRecord), `lineItems` (Invoice).

---

## 6. Module 1 — Authentication

Handles user registration, login, token refresh, and session management.

### Backend Routes — `POST /api/auth/*`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create new account (parent/doctor/admin) |
| POST | `/auth/login` | Public | Login, returns JWT + refresh token |
| POST | `/auth/refresh` | Public | Exchange refresh token for new access token |
| POST | `/auth/logout` | Required | Invalidate refresh token |
| GET | `/auth/me` | Required | Get current user profile |
| PATCH | `/auth/change-password` | Required | Change own password |

### Registration Payload

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "SecurePass1!",
  "role": "parent",
  "phone": "+254712345678",

  // Doctor-only fields:
  "licenseNumber": "KMC-010001",
  "specialty": "general_pediatrics"
}
```

### Login Response

```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "firstName": "Jane", "role": "parent", ... },
    "token": "<JWT access token — 7 day expiry>",
    "refreshToken": "<refresh token — 30 day expiry>"
  }
}
```

### JWT Strategy

- Access tokens: signed with `JWT_SECRET`, expire in 7 days
- Refresh tokens: signed with `JWT_REFRESH_SECRET`, expire in 30 days, stored in `users.refreshToken` column
- Tokens carry `{ id, role, email }` payload
- The `authenticate` middleware reads `Authorization: Bearer <token>` header
- On 401 response, frontend Axios interceptor clears localStorage and redirects to `/login`

### Rate Limiting

Auth endpoints (`/login`, `/register`) are limited to **10 requests per 15 minutes** per IP. All other API routes: **1000 requests per 15 minutes**.

### Frontend — Login & Register

- [Login.tsx](src/pages/Login.tsx) — Email/password form, stores token in `localStorage`
- [Register.tsx](src/pages/Register.tsx) — Registration form with role selector
- [AuthContext.tsx](src/contexts/AuthContext.tsx) — Manages auth state, session restore on page reload
- After login, `RootRedirect` in [App.tsx](src/App.tsx) routes to the correct dashboard by role

---

## 7. Module 2 — User & Doctor Management

Manages user accounts and doctor profiles.

### Backend Routes — `/api/users/*`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/users` | Required | admin | List all users with filters |
| GET | `/users/:id` | Required | admin | Get user detail with profiles |
| PATCH | `/users/:id` | Required | admin or self | Update user (name, phone, picture) |
| DELETE | `/users/:id` | Required | admin | Soft-deactivate user |
| GET | `/users/doctors` | Required | any | List doctors with filters |
| GET | `/users/doctors/:id` | Required | any | Get single doctor profile |
| PATCH | `/users/doctors/:id` | Required | admin, doctor | Update doctor profile |

### Doctor Query Filters

```
GET /api/users/doctors?specialty=general_pediatrics&location=Nairobi&isAvailable=true&page=1&limit=20
```

### Doctor Specialties (ENUM)

`general_pediatrics`, `neonatology`, `pediatric_cardiology`, `pediatric_neurology`, `pediatric_oncology`, `pediatric_surgery`, `pediatric_orthopedics`, `pediatric_dermatology`, `pediatric_endocrinology`, `pediatric_gastroenterology`, `pediatric_pulmonology`, `pediatric_nephrology`, `child_psychiatry`, `other`

### Frontend

- [DoctorDiscovery.tsx](src/pages/DoctorDiscovery.tsx) — Search/filter doctors list (parent view)
- [AdminDashboard.tsx](src/pages/AdminDashboard.tsx) — Admin Doctors tab: clickable doctor cards that open a full detail modal showing specialty, rating, location, clinic, contact, experience, fee, schedule, bio, and license

---

## 8. Module 3 — Child Profiles

Manages health records for children registered under a parent.

### Backend Routes — `/api/children/*`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/children` | Required | admin, parent, doctor | List children (role-filtered) |
| GET | `/children/:id` | Required | any | Get single child record |
| POST | `/children` | Required | admin, parent | Create child profile |
| PATCH | `/children/:id` | Required | admin, parent | Update child record |
| DELETE | `/children/:id` | Required | admin, parent | Soft-delete child |

**Role filtering:** Parents only see their own children. Doctors see children with appointments linked to them. Admins see all.

### Child Data Model

```json
{
  "firstName": "Emma",
  "lastName": "Kamau",
  "dateOfBirth": "2020-03-15",
  "gender": "female",
  "bloodType": "O+",
  "weight": 18.5,
  "height": 105.0,
  "allergies": ["Penicillin", "Peanuts"],
  "chronicConditions": ["Asthma"],
  "currentMedications": ["Salbutamol inhaler"],
  "vaccinationHistory": [
    { "vaccine": "BCG", "date": "2020-03-20", "administered": true },
    { "vaccine": "OPV", "date": "2020-05-15", "administered": true }
  ],
  "notes": "Premature birth at 34 weeks"
}
```

### Frontend

- [ChildProfiles.tsx](src/pages/ChildProfiles.tsx) — Parent's child list and per-child detail view
- [AdminDashboard.tsx](src/pages/AdminDashboard.tsx) — Admin Patients tab: clickable patient cards that open a detail modal with blood type, allergies (red badges), conditions, medications, vaccinations grid, and parent contact info
- [DoctorDashboard.tsx](src/pages/DoctorDashboard.tsx) — Doctor's Patients tab: unique patient list from appointments with a patient detail modal showing full medical profile and visit history

---

## 9. Module 4 — Appointments

Core scheduling module for booking and managing consultations.

### Backend Routes — `/api/appointments/*`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/appointments` | Required | any | List appointments (role-filtered) |
| GET | `/appointments/:id` | Required | any | Get single appointment |
| GET | `/appointments/availability/:doctorId` | Required | any | Get available time slots for a date |
| POST | `/appointments` | Required | admin, parent | Book a new appointment |
| PATCH | `/appointments/:id/status` | Required | any | Update status (confirm/complete/cancel) |
| DELETE | `/appointments/:id` | Required | admin, parent, doctor | Cancel appointment |

### Role-Based Filtering

- **Parent:** Only sees appointments they booked (`bookedById`)
- **Doctor:** Only sees their own appointments (`doctorId`)
- **Admin:** Sees all appointments

### Status Filter (supports comma-separated values)

```
GET /api/appointments?status=pending,confirmed&limit=5
```

### Appointment Statuses

`pending` → `confirmed` → `completed`  
Any status → `cancelled` | `no_show`

### Booking Payload

```json
{
  "doctorId": 3,
  "childId": 7,
  "appointmentDate": "2026-05-15",
  "appointmentTime": "10:00",
  "type": "physical",
  "reason": "Routine check-up",
  "symptoms": ["fever", "cough"]
}
```

Booking validates that the time slot is not already taken for the doctor on that date.

### Frontend

- [BookAppointment.tsx](src/pages/BookAppointment.tsx) — Step-by-step booking: select child → select doctor → pick date & time → submit
- [Appointments.tsx](src/pages/Appointments.tsx) — Parent's appointment list with status badges and cancellation
- [ParentDashboard.tsx](src/pages/ParentDashboard.tsx) — Shows upcoming `pending`/`confirmed` appointments
- [DoctorDashboard.tsx](src/pages/DoctorDashboard.tsx) — 4 tabs: Pending (with Accept/Decline), Upcoming (confirmed), Patients (unique), History (completed)
- [AdminDashboard.tsx](src/pages/AdminDashboard.tsx) — Admin Visits tab: all appointments with patient/doctor info and a detail modal

---

## 10. Module 5 — Queue Management

Tracks the physical waiting room queue for in-clinic appointments.

### Backend Routes — `/api/queue/*`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/queue` | Required | admin, doctor | List current queue |
| GET | `/queue/position/:appointmentId` | Required | any | Get queue position for an appointment |
| PATCH | `/queue/:id/status` | Required | admin, doctor | Update queue entry status |

### Queue Entry Statuses

`waiting` → `called` → `in_progress` → `done`  
Any → `skipped`

### Queue Data

Each queue entry tracks:
- `queueNumber` — sequential number in today's queue
- `estimatedWaitMinutes` — calculated wait time
- `calledAt`, `startedAt`, `completedAt` — timestamps

### Frontend

Integrated into the [DoctorDashboard.tsx](src/pages/DoctorDashboard.tsx) as part of the appointment management flow.

---

## 11. Module 6 — Medical Records

Clinical records created by doctors after appointments.

### Backend Routes — `/api/medical-records/*`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/medical-records` | Required | any | List records (role-filtered) |
| GET | `/medical-records/:id` | Required | any | Get single record |
| POST | `/medical-records` | Required | admin, doctor | Create new record |
| PATCH | `/medical-records/:id` | Required | admin, doctor | Update record |
| POST | `/medical-records/:id/attachments` | Required | admin, doctor | Upload lab result file |

### Medical Record Fields

```json
{
  "childId": 5,
  "doctorId": 3,
  "appointmentId": 12,
  "visitDate": "2026-04-11",
  "chiefComplaint": "High fever for 3 days",
  "temperature": 38.9,
  "heartRate": 110,
  "respiratoryRate": 24,
  "bloodPressure": "90/60",
  "oxygenSaturation": 97.5,
  "weight": 18.5,
  "height": 105.0,
  "diagnoses": [
    { "code": "J06.9", "description": "Acute upper respiratory infection" }
  ],
  "prescriptions": [
    { "drug": "Amoxicillin", "dose": "250mg", "duration": "7 days" }
  ],
  "labResults": [
    { "test": "CBC", "result": "Normal", "date": "2026-04-11" }
  ],
  "visitNotes": "Patient responding well to treatment",
  "followUpDate": "2026-04-25",
  "followUpInstructions": "Return if fever persists",
  "isConfidential": false
}
```

File attachments (lab results) are uploaded via multipart/form-data and stored in `./uploads/`.

---

## 12. Module 7 — Telemedicine

Manages virtual consultation sessions with in-session messaging.

### Backend Routes — `/api/telemedicine/*`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/telemedicine/sessions/:appointmentId/start` | Required | admin, doctor | Start a telemedicine session |
| POST | `/telemedicine/sessions/:appointmentId/end` | Required | admin, doctor | End a session |
| GET | `/telemedicine/sessions/:appointmentId` | Required | any | Get session details |
| POST | `/telemedicine/sessions/:sessionId/messages` | Required | any | Send a chat message |
| GET | `/telemedicine/sessions/:sessionId/messages` | Required | any | Get session messages |
| POST | `/telemedicine/sessions/:sessionId/upload` | Required | any | Upload a file in-session |

### Session Lifecycle

1. Doctor starts session → status: `active`, `startedAt` recorded
2. Patient/Doctor exchange messages within the session
3. Doctor ends session → status: `ended`, `endedAt` recorded
4. Medical record can be created after session

### Message Types

`text` | `image` | `file` | `system`

### Frontend

- [Telemedicine.tsx](src/pages/Telemedicine.tsx) — Parent's virtual consultation interface

---

## 13. Module 8 — Notifications

In-app notification system for appointment reminders and alerts.

### Backend Routes — `/api/notifications/*`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Required | List own notifications (paginated) |
| PATCH | `/notifications/read-all` | Required | Mark all as read |
| PATCH | `/notifications/:id/read` | Required | Mark single notification as read |
| DELETE | `/notifications/:id` | Required | Delete a notification |

### Notification Types

Created automatically by `notificationService.js` when:
- An appointment is booked (`appointment_reminder`)
- An appointment status changes (`appointment_confirmed`, `appointment_cancelled`)
- A prescription is issued (`prescription_issued`)

### Notification Channels

`in_app` | `email` | `sms`

### Frontend

- [Notifications.tsx](src/pages/Notifications.tsx) — Bell icon badge with unread count, full notification list with mark-read and delete
- Unread count shown on the parent dashboard stats and nav bell icon

---

## 14. Module 9 — Billing & Payments

Generates invoices from appointments and processes mock payments.

### Backend Routes — `/api/billing/*`

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/billing/invoices` | Required | admin, parent | List invoices (role-filtered) |
| GET | `/billing/invoices/:id` | Required | admin, parent, doctor | Get invoice with line items |
| POST | `/billing/invoices/generate` | Required | admin, doctor | Generate invoice from appointment |
| GET | `/billing/payments` | Required | admin, parent | List payments |
| POST | `/billing/payments` | Required | parent, admin | Initiate payment |
| GET | `/billing/payments/:id/status` | Required | admin, parent, doctor | Poll payment status |
| GET | `/billing/summary` | Required | admin | Revenue summary statistics |

### Invoice Generation

Invoices are auto-generated per appointment. Line items are built from:
- Consultation fee (from doctor's profile)
- Telemedicine surcharge (+KES 500, if virtual appointment)
- Optional lab tests and medications

Invoice number format: `GCH-YYMM-XXXX` (e.g. `GCH-2604-0001`)

### Invoice Statuses

`draft` → `issued` → `paid`  
`issued` → `overdue` (if past due date)  
Any → `cancelled` | `waived`

### Payment Methods

| Method | Fields |
|---|---|
| M-Pesa | `phoneNumber` (e.g. +254712345678) |
| Card | `cardLast4` (last 4 digits) |
| Cash | No additional fields |
| Insurance | `insuranceProvider`, `insurancePolicyNumber` |
| Bank Transfer | No additional fields |

### Mock Payment Flow

1. Parent clicks "Pay Now" on an invoice
2. Frontend sends `POST /billing/payments` with method and details
3. Backend creates payment with status `processing`, starts a `setTimeout` (2–5 seconds)
4. After delay: 95% chance of success → status becomes `completed`, invoice marked `paid`
5. Frontend polls `GET /billing/payments/:id/status` every 2 seconds
6. On `completed`: shows success screen with reference code
7. On `failed`: shows failure reason

### Invoice Structure

```json
{
  "invoiceNumber": "GCH-2604-0001",
  "issueDate": "2026-04-11",
  "dueDate": "2026-04-25",
  "currency": "KES",
  "lineItems": [
    { "description": "Consultation Fee", "quantity": 1, "unitPrice": 3500.00, "total": 3500.00 },
    { "description": "Telemedicine Platform Fee", "quantity": 1, "unitPrice": 500.00, "total": 500.00 }
  ],
  "subtotal": 4000.00,
  "taxRate": 0.16,
  "taxAmount": 640.00,
  "totalAmount": 4640.00,
  "status": "issued"
}
```

### Print/PDF Invoice

The [Billing.tsx](src/pages/Billing.tsx) page includes an `InvoicePrintView` component that renders a full HTML invoice (line items, totals, VAT, payment history) hidden off-screen. Clicking "Save as PDF" calls `window.print()`, which uses a CSS `@media print` rule to isolate only the invoice:

```css
@media print {
  body > *:not(#invoice-print) { display: none !important; }
  #invoice-print { display: block !important; }
}
```

### Frontend

- [Billing.tsx](src/pages/Billing.tsx) — Parent billing page: invoice list, invoice detail modal, payment modal with method selection and polling, "Save as PDF" button
- [AdminBilling.tsx](src/pages/AdminBilling.tsx) — Admin billing dashboard: revenue stats cards, collection rate progress bar, Invoices/Payments/Audit Logs tabs

---

## 15. Module 10 — Admin & Analytics

Platform-wide oversight for administrators.

### Backend Routes — `/api/admin/*` (admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard` | Aggregate stats + billing KPIs |
| GET | `/admin/reports/appointments-per-day` | Appointment volume by date |
| GET | `/admin/reports/doctor-workload` | Per-doctor appointment counts |
| GET | `/admin/audit-logs` | Full audit trail (paginated) |
| PATCH | `/admin/users/:id/toggle-active` | Activate / deactivate a user account |

### Dashboard Stats Response

```json
{
  "totalUsers": 101,
  "totalDoctors": 50,
  "totalChildren": 50,
  "totalAppointments": 50,
  "todayAppointments": 3,
  "monthAppointments": 20,
  "pendingAppointments": 8,
  "totalRevenue": 96223.16,
  "monthRevenue": 18318.72,
  "totalInvoices": 31,
  "paidInvoices": 21,
  "unpaidInvoices": 10
}
```

### Analytics Routes — `/api/analytics/*`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/summary` | Platform-wide KPI summary |

### Audit Logging

Every mutating operation (CREATE, UPDATE, DELETE, LOGIN, LOGOUT) writes a row to `audit_logs` via the `audit()` helper in `utils/auditLogger.js`. Fields: `userId`, `action`, `resource`, `resourceId`, `details`, `ipAddress`.

### Frontend

- [AdminDashboard.tsx](src/pages/AdminDashboard.tsx):
  - Stats cards: Total Doctors, Total Patients, Total Appointments, Platform Activity
  - Revenue mini-cards: Total Revenue, This Month
  - Search bar (filters across active tab)
  - **Doctors tab:** Clickable doctor cards → Doctor detail modal (specialty, rating, location, clinic, contact info, experience, consultation fee, availability, bio, education, license number)
  - **Patients tab:** Clickable patient cards → Child detail modal (vitals, allergies, conditions, medications, vaccinations, parent info)
  - **Visits tab:** Clickable appointment cards → Appointment detail modal (patient, doctor, date/time, type, reason, symptoms)
- [AdminBilling.tsx](src/pages/AdminBilling.tsx):
  - Revenue stats (Total Revenue, This Month, Outstanding, Overdue)
  - Collection rate progress bar (paid/total invoices)
  - Invoices tab, Payments tab, Audit Logs tab

---

## 16. Frontend — Pages & Navigation

### Route Map

| Path | Component | Roles | Description |
|---|---|---|---|
| `/` | RootRedirect | any | Redirects to role dashboard |
| `/login` | Login | public | Login form |
| `/register` | Register | public | Registration form |
| `/unauthorized` | Unauthorized | public | Access denied page |
| `/parent` | ParentDashboard | parent | Dashboard with children, upcoming appointments |
| `/children` | ChildProfiles | parent | Child profile list and management |
| `/children/:childId` | ChildProfiles | parent | Single child detail |
| `/doctors` | DoctorDiscovery | parent | Search and filter doctors |
| `/book/:doctorId` | BookAppointment | parent | Book an appointment with a doctor |
| `/appointments` | Appointments | parent | Full appointment history |
| `/telemedicine` | Telemedicine | parent | Virtual consultations |
| `/billing` | Billing | parent | Invoices and payment |
| `/notifications` | Notifications | any | Notification centre |
| `/doctor` | DoctorDashboard | doctor | Doctor's main dashboard |
| `/doctor/schedule` | DoctorDashboard | doctor | Doctor schedule (same page) |
| `/admin` | AdminDashboard | admin | Admin platform overview |
| `/admin/doctors` | AdminDashboard | admin | Admin doctors tab |
| `/admin/patients` | AdminDashboard | admin | Admin patients tab |
| `/admin/appointments` | AdminDashboard | admin | Admin appointments tab |
| `/admin/billing` | AdminBilling | admin | Billing dashboard |

### Navigation

**Parent nav:** Home · Doctors · Visits · Billing · Alerts  
**Doctor nav:** Home · Schedule · Alerts  
**Admin nav:** Dashboard · Doctors · Patients · Billing

Navigation is rendered in the sticky top header (desktop) and a fixed bottom tab bar (mobile). The active route is highlighted. The layout wraps all authenticated pages via [Layout.tsx](src/components/Layout.tsx).

### Design System

- Brand primary: `#0096D6` (GCH blue), defined as `hsl(198 100% 42%)` CSS variable
- Font: System sans-serif with `font-display` (semibold headings)
- Components: shadcn/ui (Radix UI primitives + TailwindCSS)
- Motion: `framer-motion` for page transitions and card animations
- Toasts: `sonner` library
- Logo: `public/GCH-Logo.png` shown in the top-left of every page

---

## 17. Role-Based Access Control

### Three Roles

| Role | Access Level |
|---|---|
| `admin` | Full platform access — all users, records, billing, audit logs |
| `doctor` | Own appointments, own patients, medical records they created |
| `parent` | Own children, own appointments, own invoices/payments |

### Backend Enforcement

Two middleware functions applied per route:

```js
// Verifies JWT and attaches req.user
authenticate

// Checks req.user.role against allowed roles
authorize('admin', 'doctor')
```

If the role check fails, the backend returns `403 Forbidden`.

Data-level filtering is done inside each controller:
```js
if (req.user.role === 'parent') {
  where.bookedById = parentProfile.id; // only see own bookings
}
```

### Frontend Enforcement

The `ProtectedRoute` component:
```tsx
<ProtectedRoute allowedRoles={['parent']}>
  <Layout><Billing /></Layout>
</ProtectedRoute>
```

If `user.role` is not in `allowedRoles`, it redirects to `/unauthorized`. If not logged in at all, redirects to `/login`.

---

## 18. API Reference

### Quick Reference Table

| Module | Base Path | Key Endpoints |
|---|---|---|
| Auth | `/api/auth` | `POST /login`, `POST /register`, `GET /me` |
| Users | `/api/users` | `GET /`, `GET /doctors`, `PATCH /:id` |
| Children | `/api/children` | `GET /`, `POST /`, `PATCH /:id` |
| Appointments | `/api/appointments` | `GET /`, `POST /`, `PATCH /:id/status`, `GET /availability/:docId` |
| Queue | `/api/queue` | `GET /`, `GET /position/:aptId`, `PATCH /:id/status` |
| Medical Records | `/api/medical-records` | `GET /`, `POST /`, `POST /:id/attachments` |
| Telemedicine | `/api/telemedicine` | `POST /sessions/:aptId/start`, `GET /sessions/:id/messages` |
| Notifications | `/api/notifications` | `GET /`, `PATCH /read-all`, `DELETE /:id` |
| Billing | `/api/billing` | `GET /invoices`, `POST /payments`, `GET /summary` |
| Admin | `/api/admin` | `GET /dashboard`, `GET /audit-logs`, `PATCH /users/:id/toggle-active` |
| Analytics | `/api/analytics` | `GET /summary` |

### Pagination Parameters

All list endpoints accept:
```
?page=1&limit=20
```

### Common Filter Parameters

| Endpoint | Filters |
|---|---|
| `/users` | `role`, `isActive`, `search` |
| `/users/doctors` | `specialty`, `location`, `isAvailable` |
| `/children` | — |
| `/appointments` | `status` (comma-separated), `type`, `date`, `doctorId` |
| `/medical-records` | `childId`, `doctorId` |
| `/notifications` | `isRead` |
| `/billing/invoices` | `status`, `parentId`, `doctorId` |
| `/billing/payments` | `invoiceId`, `method`, `status` |
| `/admin/audit-logs` | `userId`, `action`, `resource` |

---

## 19. Running the System

### Prerequisites

- Node.js >= 18
- MySQL running (phpMyAdmin on `localhost:3306`)
- Database `gertrudes_pediatric` created

### First-time Setup

```bash
# 1. Create the MySQL database
# In phpMyAdmin: New → gertrudes_pediatric → Create

# 2. Backend setup
cd ~/Documents/Gertrudes_Projects/Gertrudes
npm install
npx sequelize-cli db:migrate      # Creates all 13 tables
npx sequelize-cli db:seed:all     # Seeds 50+ records per module

# 3. Frontend setup
cd ~/Documents/Gertrudes_Projects/kindcare-connect
npm install
```

### Running

```bash
# Backend (Terminal 1)
cd ~/Documents/Gertrudes_Projects/Gertrudes
node server.js
# Starts on http://localhost:3000

# Frontend (Terminal 2)
cd ~/Documents/Gertrudes_Projects/kindcare-connect
npm run dev
# Starts on http://localhost:8080
```

### Re-seeding

```bash
cd ~/Documents/Gertrudes_Projects/Gertrudes
npx sequelize-cli db:seed:undo:all
npx sequelize-cli db:seed:all
```

### NPM Scripts

**Backend:**
```bash
npm start          # node server.js
npm run dev        # nodemon server.js (auto-restart)
npm run migrate    # npx sequelize-cli db:migrate
npm run seed       # npx sequelize-cli db:seed:all
```

**Frontend:**
```bash
npm run dev        # Vite dev server on :8080
npm run build      # Production build
npm run test       # Vitest unit tests
npx tsc --noEmit   # TypeScript type check
```

---

## 20. Seeded Test Data

The database is pre-seeded with realistic data for testing every feature.

### Seeded Records

| Table | Count |
|---|---|
| Users | 101 (1 admin + 50 doctors + 50 parents) |
| Doctor profiles | 50 |
| Parent profiles | 50 |
| Children | 50 |
| Appointments | 50 (mix of pending/confirmed/completed/cancelled) |
| Medical Records | 50 |
| Telemedicine Sessions | ~20 |
| Queue Entries | ~30 |
| Notifications | ~150 |
| Audit Logs | 121 |
| Invoices | 31 |
| Payments | 21 |

### Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gertrudes.com` | `Admin@1234` |
| Doctor | `doctor1@gertrudes.com` | `Doctor@1234` |
| Doctor | `doctor2@gertrudes.com` | `Doctor@1234` |
| Parent | `parent1@gertrudes.com` | `Parent@1234` |
| Parent | `parent2@gertrudes.com` | `Parent@1234` |

Doctors follow the pattern `doctor1@gertrudes.com` through `doctor50@gertrudes.com`.  
Parents follow the pattern `parent1@gertrudes.com` through `parent50@gertrudes.com`.

### Billing Test Data

- Total Revenue: **KES 96,223**
- This Month: **KES 18,319**
- Invoice statuses: 21 paid, 7 issued, 3 overdue
- Payment methods seeded: M-Pesa, Card, Cash, Insurance, Bank Transfer

### What to Test Per Role

**As Admin (`admin@gertrudes.com`):**
- Dashboard stats (users, appointments, revenue)
- Doctors tab → click any doctor → see full profile modal
- Patients tab → click any patient → see medical details with allergies
- Visits tab → click any appointment → see full detail modal
- Billing page → revenue cards, invoices list, payments list, audit trail

**As Doctor (`doctor1@gertrudes.com`):**
- Pending tab → click Accept or Decline on pending appointments
- Upcoming tab → view confirmed appointments, click for patient details
- Patients tab → unique patient list → click to see full medical profile, allergies, vaccination history, previous visits
- History tab → completed appointment records

**As Parent (`parent1@gertrudes.com`):**
- Dashboard → see own children and upcoming appointments
- Children → full child profile management
- Doctors → search by specialty, location, availability
- Book appointment → select child → select doctor → pick date/time
- Visits → appointment history with cancellation option
- Billing → view invoices, click "Pay Now" → choose payment method → watch mock payment flow → get reference code → save PDF invoice

---

*Documentation generated: April 2026*  
*System version: 1.0.0*
