import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Hospital } from '@/models';
import { withAuth, successResponse, errorResponse } from '@/lib/middleware';

// GET /api/admin/hospitals - Get all hospitals for admin
async function getHospitalsForAdmin(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status'); // pending, approved, all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = { isActive: true };

    if (status === 'pending') {
      query.isApproved = false;
    } else if (status === 'approved') {
      query.isApproved = true;
    }

    const skip = (page - 1) * limit;

    const hospitals = await Hospital.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Hospital.countDocuments(query);

    return successResponse({
      hospitals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get hospitals for admin error:', error);
    return errorResponse('Failed to get hospitals', 500);
  }
}

export const GET = withAuth(
  async (req: NextRequest) => {
    await connectDB();
    return getHospitalsForAdmin(req);
  },
  ['admin']
);
