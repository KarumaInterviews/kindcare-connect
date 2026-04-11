import { User, Child, Doctor, Appointment, Notification } from '@/types';

export const mockUsers: User[] = [
  { id: 'p1', name: 'Sarah Johnson', email: 'parent@demo.com', role: 'parent', avatar: '' },
  { id: 'd1', name: 'Dr. Emily Chen', email: 'doctor@demo.com', role: 'doctor', avatar: '' },
  { id: 'a1', name: 'Admin User', email: 'admin@demo.com', role: 'admin', avatar: '' },
];

export const mockChildren: Child[] = [
  {
    id: 'c1', parentId: 'p1', name: 'Liam Johnson', dateOfBirth: '2019-05-12',
    gender: 'male', medicalHistory: 'Mild asthma diagnosed at age 2. Regular checkups recommended.',
    allergies: ['Peanuts', 'Dust'], bloodType: 'A+',
  },
  {
    id: 'c2', parentId: 'p1', name: 'Emma Johnson', dateOfBirth: '2021-09-03',
    gender: 'female', medicalHistory: 'No significant medical history.',
    allergies: [], bloodType: 'O+',
  },
];

export const mockDoctors: Doctor[] = [
  {
    id: 'd1', name: 'Dr. Emily Chen', email: 'emily@clinic.com', specialty: 'General Pediatrics',
    location: 'Downtown Children\'s Clinic', rating: 4.9, reviewCount: 128, experience: 12,
    bio: 'Board-certified pediatrician with 12 years of experience in children\'s healthcare.',
    consultationFee: 75, acceptsVirtual: true,
    availability: [
      { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00'] },
      { day: 'Friday', slots: ['10:00', '11:00', '14:00', '15:00', '16:00'] },
    ],
    avatar: '',
  },
  {
    id: 'd2', name: 'Dr. Michael Rodriguez', email: 'michael@clinic.com', specialty: 'Pediatric Cardiology',
    location: 'Heart Care Center', rating: 4.8, reviewCount: 95, experience: 15,
    bio: 'Specialist in pediatric cardiology with expertise in congenital heart defects.',
    consultationFee: 120, acceptsVirtual: true,
    availability: [
      { day: 'Tuesday', slots: ['09:00', '10:00', '11:00'] },
      { day: 'Thursday', slots: ['09:00', '10:00', '14:00', '15:00'] },
    ],
    avatar: '',
  },
  {
    id: 'd3', name: 'Dr. Aisha Patel', email: 'aisha@clinic.com', specialty: 'Pediatric Neurology',
    location: 'Neuro Kids Clinic', rating: 4.7, reviewCount: 72, experience: 10,
    bio: 'Focused on developmental neurology and neurological disorders in children.',
    consultationFee: 110, acceptsVirtual: false,
    availability: [
      { day: 'Monday', slots: ['10:00', '11:00', '14:00'] },
      { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Friday', slots: ['09:00', '10:00'] },
    ],
    avatar: '',
  },
  {
    id: 'd4', name: 'Dr. James Wilson', email: 'james@clinic.com', specialty: 'Pediatric Dermatology',
    location: 'SkinCare Kids', rating: 4.6, reviewCount: 58, experience: 8,
    bio: 'Expert in childhood skin conditions, eczema, and allergic reactions.',
    consultationFee: 90, acceptsVirtual: true,
    availability: [
      { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
      { day: 'Thursday', slots: ['10:00', '11:00', '14:00'] },
    ],
    avatar: '',
  },
  {
    id: 'd5', name: 'Dr. Lisa Nakamura', email: 'lisa@clinic.com', specialty: 'General Pediatrics',
    location: 'Sunshine Pediatrics', rating: 4.9, reviewCount: 210, experience: 18,
    bio: 'Compassionate pediatrician with nearly two decades of experience in family-centered care.',
    consultationFee: 80, acceptsVirtual: true,
    availability: [
      { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Tuesday', slots: ['09:00', '10:00', '11:00'] },
      { day: 'Wednesday', slots: ['14:00', '15:00', '16:00'] },
      { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '14:00'] },
      { day: 'Friday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    ],
    avatar: '',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'a1', parentId: 'p1', childId: 'c1', childName: 'Liam Johnson',
    doctorId: 'd1', doctorName: 'Dr. Emily Chen', doctorSpecialty: 'General Pediatrics',
    date: '2026-04-15', time: '10:00', type: 'physical', status: 'confirmed',
    location: 'Downtown Children\'s Clinic',
  },
  {
    id: 'a2', parentId: 'p1', childId: 'c2', childName: 'Emma Johnson',
    doctorId: 'd5', doctorName: 'Dr. Lisa Nakamura', doctorSpecialty: 'General Pediatrics',
    date: '2026-04-18', time: '14:00', type: 'virtual', status: 'pending',
  },
  {
    id: 'a3', parentId: 'p1', childId: 'c1', childName: 'Liam Johnson',
    doctorId: 'd2', doctorName: 'Dr. Michael Rodriguez', doctorSpecialty: 'Pediatric Cardiology',
    date: '2026-03-20', time: '09:00', type: 'physical', status: 'completed',
    location: 'Heart Care Center', notes: 'Routine checkup. All clear.',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1', userId: 'p1', title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. Emily Chen on Apr 15 at 10:00 AM is confirmed.',
    type: 'appointment', read: false, createdAt: '2026-04-11T08:00:00Z',
  },
  {
    id: 'n2', userId: 'p1', title: 'Reminder: Upcoming Visit',
    message: 'Liam has a checkup with Dr. Chen in 4 days. Don\'t forget!',
    type: 'reminder', read: false, createdAt: '2026-04-11T07:00:00Z',
  },
  {
    id: 'n3', userId: 'p1', title: 'Lab Results Available',
    message: 'Liam\'s latest lab results are now available for review.',
    type: 'system', read: true, createdAt: '2026-04-10T14:00:00Z',
  },
  {
    id: 'n4', userId: 'd1', title: 'New Appointment Request',
    message: 'Sarah Johnson has requested an appointment for Emma on Apr 18.',
    type: 'appointment', read: false, createdAt: '2026-04-11T09:00:00Z',
  },
];
