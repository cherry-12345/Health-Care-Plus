import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAvailability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isAvailable: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

export interface IDoctor extends Document {
  _id: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  registrationNumber: string;
  experience: number; // years
  profilePicture?: string;
  availability: IAvailability[];
  consultationFee: number;
  rating: {
    overall: number;
    totalReviews: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySchema = new Schema<IAvailability>({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true,
  },
  isAvailable: { type: Boolean, default: false },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' },
}, { _id: false });

const doctorSchema = new Schema<IDoctor>(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'],
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      enum: [
        'Cardiology',
        'Orthopedics',
        'Neurology',
        'General Medicine',
        'Pediatrics',
        'Dermatology',
        'ENT',
        'Ophthalmology',
        'Gynecology',
        'Urology',
        'Psychiatry',
        'Oncology',
        'Nephrology',
        'Pulmonology',
        'Gastroenterology',
        'Endocrinology',
        'Rheumatology',
        'Emergency Medicine',
        'Anesthesiology',
        'Radiology',
        'Pathology',
        'Other',
      ],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
    },
    experience: {
      type: Number,
      required: [true, 'Experience is required'],
      min: [0, 'Experience cannot be negative'],
    },
    profilePicture: {
      type: String,
      default: '',
    },
    availability: {
      type: [availabilitySchema],
      default: () => [
        { day: 'monday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
        { day: 'tuesday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
        { day: 'wednesday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
        { day: 'thursday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
        { day: 'friday', isAvailable: true, startTime: '09:00', endTime: '17:00' },
        { day: 'saturday', isAvailable: false, startTime: '10:00', endTime: '13:00' },
        { day: 'sunday', isAvailable: false, startTime: '10:00', endTime: '13:00' },
      ],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Fee cannot be negative'],
    },
    rating: {
      overall: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
doctorSchema.index({ hospitalId: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ registrationNumber: 1 }, { unique: true });
doctorSchema.index({ 'rating.overall': -1 });
doctorSchema.index({ isActive: 1 });

const Doctor: Model<IDoctor> = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', doctorSchema);

export default Doctor;
