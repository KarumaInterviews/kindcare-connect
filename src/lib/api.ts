import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ── axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// handle 401 globally — clear storage and redirect to login
api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── generic request helper ────────────────────────────────────────────────────
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await api.request<{ success: boolean; data: T; message?: string }>(config);
  return res.data.data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: { user: User; token: string; refreshToken: string } }>(
      '/auth/login', { email, password }
    ).then(r => r.data.data),

  register: (payload: RegisterPayload) =>
    api.post<{ success: boolean; data: { user: User; token: string; refreshToken: string } }>(
      '/auth/register', payload
    ).then(r => r.data.data),

  me: () => request<User>({ method: 'GET', url: '/auth/me' }),

  logout: () => api.post('/auth/logout').catch(() => {}),
};

// ── Children ──────────────────────────────────────────────────────────────────
export const childrenApi = {
  list: (params?: Record<string, unknown>) =>
    request<PaginatedResponse<Child>>({ method: 'GET', url: '/children', params }),

  get: (id: number) => request<Child>({ method: 'GET', url: `/children/${id}` }),

  create: (data: Partial<Child>) =>
    request<Child>({ method: 'POST', url: '/children', data }),

  update: (id: number, data: Partial<Child>) =>
    request<Child>({ method: 'PATCH', url: `/children/${id}`, data }),

  remove: (id: number) =>
    request<void>({ method: 'DELETE', url: `/children/${id}` }),
};

// ── Appointments ──────────────────────────────────────────────────────────────
export const appointmentsApi = {
  list: (params?: Record<string, unknown>) =>
    request<PaginatedResponse<Appointment>>({ method: 'GET', url: '/appointments', params }),

  get: (id: number) => request<Appointment>({ method: 'GET', url: `/appointments/${id}` }),

  create: (data: Partial<Appointment>) =>
    request<Appointment>({ method: 'POST', url: '/appointments', data }),

  updateStatus: (id: number, status: string, reason?: string) =>
    request<Appointment>({ method: 'PATCH', url: `/appointments/${id}/status`, data: { status, cancellationReason: reason } }),

  availability: (doctorId: number, date: string) =>
    request<string[]>({ method: 'GET', url: `/appointments/availability/${doctorId}`, params: { date } }),
};

// ── Doctors ───────────────────────────────────────────────────────────────────
export const doctorsApi = {
  list: (params?: Record<string, unknown>) =>
    request<PaginatedResponse<Doctor>>({ method: 'GET', url: '/users/doctors', params }),

  get: (id: number) => request<Doctor>({ method: 'GET', url: `/users/doctors/${id}` }),

  update: (id: number, data: Partial<Doctor>) =>
    request<Doctor>({ method: 'PATCH', url: `/users/doctors/${id}`, data }),
};

// ── Medical Records ───────────────────────────────────────────────────────────
export const medicalRecordsApi = {
  list: (params?: Record<string, unknown>) =>
    request<PaginatedResponse<MedicalRecord>>({ method: 'GET', url: '/medical-records', params }),

  get: (id: number) => request<MedicalRecord>({ method: 'GET', url: `/medical-records/${id}` }),

  create: (data: Partial<MedicalRecord>) =>
    request<MedicalRecord>({ method: 'POST', url: '/medical-records', data }),

  update: (id: number, data: Partial<MedicalRecord>) =>
    request<MedicalRecord>({ method: 'PATCH', url: `/medical-records/${id}`, data }),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (params?: Record<string, unknown>) =>
    request<PaginatedResponse<Notification>>({ method: 'GET', url: '/notifications', params }),

  markRead: (id: number) =>
    request<void>({ method: 'PATCH', url: `/notifications/${id}/read` }),

  markAllRead: () =>
    request<void>({ method: 'PATCH', url: '/notifications/read-all' }),

  remove: (id: number) =>
    request<void>({ method: 'DELETE', url: `/notifications/${id}` }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  dashboard: () => request<AdminDashboard>({ method: 'GET', url: '/admin/dashboard' }),

  users: (params?: Record<string, unknown>) =>
    request<PaginatedResponse<User>>({ method: 'GET', url: '/users', params }),

  toggleUser: (id: number) =>
    request<User>({ method: 'PATCH', url: `/admin/users/${id}/toggle-active` }),

  auditLogs: (params?: Record<string, unknown>) =>
    request<PaginatedResponse<AuditLog>>({ method: 'GET', url: '/admin/audit-logs', params }),

  analytics: () => request<Analytics>({ method: 'GET', url: '/analytics/summary' }),
};

// ── Billing ───────────────────────────────────────────────────────────────────
export const billingApi = {
  // Invoices
  listInvoices: (params?: Record<string, unknown>) =>
    request<PaginatedResponse<Invoice>>({ method: 'GET', url: '/billing/invoices', params }),

  getInvoice: (id: number) =>
    request<Invoice>({ method: 'GET', url: `/billing/invoices/${id}` }),

  generateInvoice: (appointmentId: number) =>
    request<Invoice>({ method: 'POST', url: '/billing/invoices/generate', data: { appointmentId } }),

  // Payments
  listPayments: (params?: Record<string, unknown>) =>
    request<PaginatedResponse<Payment>>({ method: 'GET', url: '/billing/payments', params }),

  createPayment: (data: CreatePaymentPayload) =>
    request<PaymentInitResponse>({ method: 'POST', url: '/billing/payments', data }),

  getPaymentStatus: (paymentId: number) =>
    request<Payment>({ method: 'GET', url: `/billing/payments/${paymentId}/status` }),

  // Admin
  summary: () =>
    request<BillingSummary>({ method: 'GET', url: '/billing/summary' }),
};

// ── Queue ─────────────────────────────────────────────────────────────────────
export const queueApi = {
  list: (params?: Record<string, unknown>) =>
    request<PaginatedResponse<Queue>>({ method: 'GET', url: '/queue', params }),

  position: (appointmentId: number) =>
    request<Queue>({ method: 'GET', url: `/queue/position/${appointmentId}` }),

  updateStatus: (id: number, status: string) =>
    request<Queue>({ method: 'PATCH', url: `/queue/${id}/status`, data: { status } }),
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'doctor' | 'parent';
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  profilePicture?: string;
  createdAt: string;
  doctorProfile?: Doctor;
  parentProfile?: Parent;
}

export interface Doctor {
  id: number;
  userId: number;
  licenseNumber: string;
  specialty: string;
  bio?: string;
  yearsOfExperience: number;
  education?: string;
  consultationFee: number;
  availabilitySchedule: AvailabilitySlot[];
  location?: string;
  clinicName?: string;
  isAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  user?: User;
}

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface Parent {
  id: number;
  userId: number;
  relationship: string;
  address?: string;
  city?: string;
  nationalId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  user?: User;
  children?: Child[];
}

export interface Child {
  id: number;
  parentId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  weight?: number;
  height?: number;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  vaccinationHistory: VaccinationEntry[];
  notes?: string;
  isActive: boolean;
  parent?: Parent;
}

export interface VaccinationEntry {
  vaccine: string;
  date: string;
  administered: boolean;
}

export interface Appointment {
  id: number;
  doctorId: number;
  childId: number;
  bookedById: number;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  type: 'physical' | 'virtual';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  reason?: string;
  symptoms: string[];
  notes?: string;
  cancellationReason?: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  doctor?: Doctor;
  child?: Child;
  bookedBy?: Parent;
}

export interface MedicalRecord {
  id: number;
  childId: number;
  doctorId: number;
  appointmentId?: number;
  visitDate: string;
  chiefComplaint?: string;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  bloodPressure?: string;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  diagnoses: { code: string; description: string }[];
  prescriptions: { drug: string; dose: string; duration: string }[];
  labResults: { test: string; result: string; date: string }[];
  visitNotes?: string;
  followUpDate?: string;
  followUpInstructions?: string;
  isConfidential: boolean;
  child?: Child;
  doctor?: Doctor;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  channel: string;
  isRead: boolean;
  isSent: boolean;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface Queue {
  id: number;
  appointmentId: number;
  queueNumber: number;
  status: 'waiting' | 'called' | 'in_progress' | 'done' | 'skipped';
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedWaitMinutes?: number;
  appointment?: Appointment;
}

export interface AuditLog {
  id: number;
  userId?: number;
  action: string;
  resource: string;
  resourceId?: number;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  user?: User;
}

export interface AdminDashboard {
  totalUsers: number;
  totalDoctors: number;
  totalParents: number;
  totalChildren: number;
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  recentAppointments?: Appointment[];
  totalRevenue?: number;
  monthRevenue?: number;
  totalInvoices?: number;
  paidInvoices?: number;
  unpaidInvoices?: number;
}

export interface Analytics {
  totalUsers: number;
  totalAppointments: number;
  completionRate: number;
  popularSpecialties: { specialty: string; count: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: 'parent' | 'doctor' | 'admin';
  licenseNumber?: string;
  specialty?: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  appointmentId: number;
  childId: number;
  parentId: number;
  doctorId: number;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled' | 'waived';
  notes?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  doctor?: Doctor;
  child?: Child;
  parent?: Parent;
  appointment?: Appointment;
  payments?: Payment[];
}

export interface Payment {
  id: number;
  invoiceId: number;
  parentId: number;
  amount: number;
  currency: string;
  method: 'mpesa' | 'card' | 'cash' | 'insurance' | 'bank_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  mpesaCode?: string;
  phoneNumber?: string;
  cardLast4?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  processingFee: number;
  notes?: string;
  paidAt?: string;
  failureReason?: string;
  createdAt: string;
  invoice?: Invoice;
}

export interface PaymentInitResponse {
  paymentId: number;
  reference: string;
  mpesaCode?: string;
  status: string;
  willComplete: boolean;
}

export interface CreatePaymentPayload {
  invoiceId: number;
  method: 'mpesa' | 'card' | 'cash' | 'insurance' | 'bank_transfer';
  phoneNumber?: string;
  cardLast4?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

export interface BillingSummary {
  totalRevenue: number;
  monthRevenue: number;
  pendingAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  unpaidInvoices: number;
}

export default api;
