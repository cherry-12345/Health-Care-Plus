import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAppointment extends Document {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  hospitalId: Types.ObjectId;
  doctorId?: Types.ObjectId;
  appointmentDate: Date;
  timeSlot: string;
  type: 'general' | 'specialist' | 'emergency' | 'follow-up';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  reason: string;
  notes?: string;
  symptoms?: string[];
  priority: 'normal' | 'urgent' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['general', 'specialist', 'emergency', 'follow-up'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'pending',
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    notes: String,
    symptoms: [String],
    priority: {
      type: String,
      enum: ['normal', 'urgent', 'critical'],
      default: 'normal',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
AppointmentSchema.index({ patientId: 1, appointmentDate: -1 });
AppointmentSchema.index({ hospitalId: 1, appointmentDate: -1 });
AppointmentSchema.index({ doctorId: 1, appointmentDate: -1 });
AppointmentSchema.index({ status: 1, appointmentDate: 1 });

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
