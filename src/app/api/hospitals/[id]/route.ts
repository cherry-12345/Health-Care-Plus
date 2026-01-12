import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Hospital, Doctor, Review } from '@/models';
import { successResponse, errorResponse } from '@/lib/middleware';

// GET /api/hospitals/[id] - Get hospital details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Get hospital with populated data
    const hospital = await Hospital.findOne({
      _id: id,
      isApproved: true,
      isActive: true,
    }).select('-userId -__v');

    if (!hospital) {
      return errorResponse('Hospital not found', 404);
    }

    // Get doctors for this hospital
    const doctors = await Doctor.find({
      hospitalId: id,
      isActive: true,
    }).select('-__v');

    // Get recent reviews
    const reviews = await Review.find({
      hospitalId: id,
      isActive: true,
    })
      .populate('userId', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-__v');

    // Check if data is stale (> 12 hours)
    const now = new Date();
    const lastBedUpdate = new Date(hospital.lastBedUpdate);
    const hoursSinceUpdate = (now.getTime() - lastBedUpdate.getTime()) / (1000 * 60 * 60);
    const isDataStale = hoursSinceUpdate > 12;

    return successResponse({
      hospital: {
        ...hospital.toObject(),
        isDataStale,
        hoursSinceUpdate: Math.round(hoursSinceUpdate),
      },
      doctors,
      reviews,
    });
  } catch (error) {
    console.error('Get hospital error:', error);
    return errorResponse('Failed to get hospital details', 500);
  }
}
