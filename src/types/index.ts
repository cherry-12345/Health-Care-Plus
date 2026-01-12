// Type definitions for the application

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'hospital' | 'admin';
  profilePicture?: string;
  address: {
    street?: string;
    city: string;
    state: string;
    pincode: string;
  };
  isVerified: boolean;
  createdAt: string;
}

export interface BedCount {
  total: number;
  occupied: number;
  available: number;
}

export interface BloodStock {
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  units: number;
  expiryDate?: string;
  lastUpdated: string;
}

export interface Hospital {
  _id: string;
  name: string;
  registrationNumber: string;
  type: 'government' | 'private' | 'multispecialty' | 'trauma' | 'maternity';
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  contact: {
    phone: string;
    emergency: string;
    email: string;
  };
  beds: {
    general: BedCount;
    icu: BedCount;
    oxygen: BedCount;
    ventilator: BedCount;
  };
  bloodBank: BloodStock[];
  facilities: string[];
  images: string[];
  rating: {
    overall: number;
    cleanliness: number;
    staff: number;
    facilities: number;
    emergencyResponse: number;
    totalReviews: number;
  };
  isOpen24x7: boolean;
  hasEmergencyServices: boolean;
  isApproved: boolean;
  isActive: boolean;
  lastBedUpdate: string;
  lastBloodUpdate: string;
  distance?: number;
  isDataStale?: boolean;
  hoursSinceUpdate?: number;
}

export interface Doctor {
  _id: string;
  hospitalId: string | Hospital;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  registrationNumber: string;
  experience: number;
  profilePicture?: string;
  availability: {
    day: string;
    isAvailable: boolean;
    startTime: string;
    endTime: string;
  }[];
  consultationFee: number;
  rating: {
    overall: number;
    totalReviews: number;
  };
  isActive: boolean;
}

export interface Appointment {
  _id: string;
  userId: string | User;
  hospitalId: string | Hospital;
  doctorId: string | Doctor;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  patientPhone: string;
  reasonForVisit: string;
  appointmentDate: string;
  timeSlot: {
    start: string;
    end: string;
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  cancelledBy?: 'user' | 'hospital';
  cancellationReason?: string;
  bookingId: string;
  notes?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  userId: string | User;
  hospitalId: string;
  appointmentId?: string;
  rating: {
    overall: number;
    cleanliness: number;
    staff: number;
    facilities: number;
    emergencyResponse: number;
  };
  review: string;
  isVerified: boolean;
  helpfulCount: number;
  hospitalResponse?: {
    message: string;
    respondedAt: string;
  };
  createdAt: string;
}

export interface SearchParams {
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  bedType?: 'general' | 'icu' | 'oxygen' | 'ventilator';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  minBloodUnits?: number;
  hospitalType?: string;
  minRating?: number;
  isOpen24x7?: boolean;
  hasEmergency?: boolean;
  sortBy?: 'distance' | 'rating' | 'beds' | 'updated';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type Specialization =
  | 'Cardiology'
  | 'Orthopedics'
  | 'Neurology'
  | 'General Medicine'
  | 'Pediatrics'
  | 'Dermatology'
  | 'ENT'
  | 'Ophthalmology'
  | 'Gynecology'
  | 'Urology'
  | 'Psychiatry'
  | 'Oncology'
  | 'Nephrology'
  | 'Pulmonology'
  | 'Gastroenterology'
  | 'Endocrinology'
  | 'Rheumatology'
  | 'Emergency Medicine'
  | 'Anesthesiology'
  | 'Radiology'
  | 'Pathology'
  | 'Other';
