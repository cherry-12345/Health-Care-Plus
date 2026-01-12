import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IReview extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  hospitalId: Types.ObjectId;
  doctorId?: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  visitDate?: Date;
  wouldRecommend: boolean;
  isVerified: boolean;
  isActive: boolean;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: String,
    comment: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    visitDate: Date,
    wouldRecommend: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReviewSchema.index({ hospitalId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, hospitalId: 1 }, { unique: true });
ReviewSchema.index({ rating: 1 });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
