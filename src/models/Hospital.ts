import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBedCount {
  total: number;
  occupied: number;
  available: number;
}

export interface IBloodStock {
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  units: number;
  expiryDate?: Date;
  lastUpdated: Date;
}

export interface IHospital extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
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
    coordinates: [number, number]; // [longitude, latitude]
  };
  contact: {
    phone: string;
    emergency: string;
    email: string;
  };
  beds: {
    general: IBedCount;
    icu: IBedCount;
    oxygen: IBedCount;
    ventilator: IBedCount;
  };
  bloodBank: IBloodStock[];
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
  lastBedUpdate: Date;
  lastBloodUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bloodStockSchema = new Schema({
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
  },
  units: {
    type: Number,
    default: 0,
    min: 0,
  },
  expiryDate: Date,
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const bedCountSchema = new Schema({
  total: { type: Number, default: 0, min: 0 },
  occupied: { type: Number, default: 0, min: 0 },
  available: { type: Number, default: 0, min: 0 },
}, { _id: false });

const hospitalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
    },
    type: {
      type: String,
      enum: ['government', 'private', 'multispecialty', 'trauma', 'maternity'],
      required: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { 
        type: String, 
        required: true,
        match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode'],
      },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    contact: {
      phone: { type: String, required: true },
      emergency: { type: String, required: true },
      email: { type: String, required: true },
    },
    beds: {
      general: { type: bedCountSchema, default: () => ({}) },
      icu: { type: bedCountSchema, default: () => ({}) },
      oxygen: { type: bedCountSchema, default: () => ({}) },
      ventilator: { type: bedCountSchema, default: () => ({}) },
    },
    bloodBank: {
      type: [bloodStockSchema],
      default: () => [
        { bloodGroup: 'A+', units: 0 },
        { bloodGroup: 'A-', units: 0 },
        { bloodGroup: 'B+', units: 0 },
        { bloodGroup: 'B-', units: 0 },
        { bloodGroup: 'AB+', units: 0 },
        { bloodGroup: 'AB-', units: 0 },
        { bloodGroup: 'O+', units: 0 },
        { bloodGroup: 'O-', units: 0 },
      ],
    },
    facilities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    rating: {
      overall: { type: Number, default: 0, min: 0, max: 5 },
      cleanliness: { type: Number, default: 0, min: 0, max: 5 },
      staff: { type: Number, default: 0, min: 0, max: 5 },
      facilities: { type: Number, default: 0, min: 0, max: 5 },
      emergencyResponse: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
    },
    isOpen24x7: { type: Boolean, default: false },
    hasEmergencyServices: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastBedUpdate: { type: Date, default: Date.now },
    lastBloodUpdate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ 'address.city': 1 });
hospitalSchema.index({ 'address.state': 1 });
hospitalSchema.index({ type: 1 });
hospitalSchema.index({ isApproved: 1, isActive: 1 });
hospitalSchema.index({ 'beds.general.available': 1 });
hospitalSchema.index({ 'beds.icu.available': 1 });
hospitalSchema.index({ 'beds.oxygen.available': 1 });
hospitalSchema.index({ 'beds.ventilator.available': 1 });
hospitalSchema.index({ 'bloodBank.bloodGroup': 1, 'bloodBank.units': 1 });
hospitalSchema.index({ 'rating.overall': -1 });

// Pre-save middleware to calculate available beds
hospitalSchema.pre('save', async function () {
  const beds = this.beds as any;
  if (beds) {
    beds.general.available = Math.max(0, beds.general.total - beds.general.occupied);
    beds.icu.available = Math.max(0, beds.icu.total - beds.icu.occupied);
    beds.oxygen.available = Math.max(0, beds.oxygen.total - beds.oxygen.occupied);
    beds.ventilator.available = Math.max(0, beds.ventilator.total - beds.ventilator.occupied);
  }
});

const Hospital: Model<IHospital> = mongoose.models.Hospital || mongoose.model<IHospital>('Hospital', hospitalSchema);

export default Hospital;
