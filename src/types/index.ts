export type UserRole = 'parent' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  medicalHistory: string;
  allergies: string[];
  bloodType?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  location: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  experience: number;
  availability: DayAvailability[];
  bio: string;
  consultationFee: number;
  acceptsVirtual: boolean;
}

export interface DayAvailability {
  day: string;
  slots: string[];
}

export interface Appointment {
  id: string;
  parentId: string;
  childId: string;
  childName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  type: 'physical' | 'virtual';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'reminder' | 'system' | 'message';
  read: boolean;
  createdAt: string;
}
