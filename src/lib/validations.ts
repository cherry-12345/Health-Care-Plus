import { z } from 'zod';

// User Validation Schemas
export const registerSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must include uppercase, lowercase, number, and special character'
    ),
  role: z.enum(['user', 'hospital']).default('user'),
  address: z.object({
    street: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().regex(/^\d{6}$/).optional(),
    })
    .optional(),
});

// Hospital Validation Schemas
export const hospitalSchema = z.object({
  name: z.string().min(1, 'Hospital name is required').max(100),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  type: z.enum(['government', 'private', 'multispecialty', 'trauma', 'maternity']),
  description: z.string().max(1000).optional(),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  }),
  location: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  contact: z.object({
    phone: z.string().regex(/^[6-9]\d{9}$/),
    emergency: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().email(),
  }),
  facilities: z.array(z.string()).optional(),
  isOpen24x7: z.boolean().optional(),
  hasEmergencyServices: z.boolean().optional(),
});

export const bedUpdateSchema = z.object({
  general: z.object({
    total: z.number().min(0),
    occupied: z.number().min(0),
  }).optional(),
  icu: z.object({
    total: z.number().min(0),
    occupied: z.number().min(0),
  }).optional(),
  oxygen: z.object({
    total: z.number().min(0),
    occupied: z.number().min(0),
  }).optional(),
  ventilator: z.object({
    total: z.number().min(0),
    occupied: z.number().min(0),
  }).optional(),
});

export const bloodUpdateSchema = z.object({
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  units: z.number().min(0),
  expiryDate: z.string().datetime().optional(),
});

// Doctor Validation Schema
export const doctorSchema = z.object({
  name: z.string().min(1, 'Doctor name is required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  qualification: z.string().min(1, 'Qualification is required'),
  specialization: z.enum([
    'Cardiology', 'Orthopedics', 'Neurology', 'General Medicine',
    'Pediatrics', 'Dermatology', 'ENT', 'Ophthalmology', 'Gynecology',
    'Urology', 'Psychiatry', 'Oncology', 'Nephrology', 'Pulmonology',
    'Gastroenterology', 'Endocrinology', 'Rheumatology', 'Emergency Medicine',
    'Anesthesiology', 'Radiology', 'Pathology', 'Other',
  ]),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  experience: z.number().min(0),
  consultationFee: z.number().min(0),
  availability: z.array(z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    isAvailable: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
});

// Appointment Validation Schema
export const appointmentSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  patientAge: z.number().min(0).max(150),
  patientGender: z.enum(['male', 'female', 'other']),
  patientPhone: z.string().regex(/^[6-9]\d{9}$/),
  reasonForVisit: z.string().min(1).max(500),
  appointmentDate: z.string().datetime(),
  timeSlot: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

// Review Validation Schema
export const reviewSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  rating: z.object({
    overall: z.number().min(1).max(5),
    cleanliness: z.number().min(1).max(5),
    staff: z.number().min(1).max(5),
    facilities: z.number().min(1).max(5),
    emergencyResponse: z.number().min(1).max(5),
  }),
  review: z.string().min(20, 'Review must be at least 20 characters').max(500),
});

// Search Validation Schema
export const searchSchema = z.object({
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().min(1).max(100).optional(), // in km
  bedType: z.enum(['general', 'icu', 'oxygen', 'ventilator']).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  minBloodUnits: z.number().min(1).optional(),
  hospitalType: z.enum(['government', 'private', 'multispecialty', 'trauma', 'maternity']).optional(),
  minRating: z.number().min(1).max(5).optional(),
  isOpen24x7: z.boolean().optional(),
  hasEmergency: z.boolean().optional(),
  sortBy: z.enum(['distance', 'rating', 'beds', 'updated']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(50).optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type HospitalInput = z.infer<typeof hospitalSchema>;
export type BedUpdateInput = z.infer<typeof bedUpdateSchema>;
export type BloodUpdateInput = z.infer<typeof bloodUpdateSchema>;
export type DoctorInput = z.infer<typeof doctorSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
