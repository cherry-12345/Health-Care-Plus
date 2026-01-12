import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Hospital } from '@/models';
import { withAuth, successResponse, errorResponse } from '@/lib/middleware';

// PUT /api/admin/hospitals/[id]/approve - Approve/Reject hospital
async function approveHospital(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { action, reason } = body;

    if (!['approve', 'reject'].includes(action)) {
      return errorResponse('Invalid action. Use "approve" or "reject"', 400);
    }

    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return errorResponse('Hospital not found', 404);
    }

    if (action === 'approve') {
      hospital.isApproved = true;
      await hospital.save();

      // TODO: Send approval email to hospital

      return successResponse(
        { hospitalId: id, isApproved: true },
        'Hospital approved successfully'
      );
    } else {
      // Reject - deactivate the hospital
      hospital.isActive = false;
      await hospital.save();

      // TODO: Send rejection email to hospital with reason

      return successResponse(
        { hospitalId: id, isApproved: false, reason },
        'Hospital rejected'
      );
    }
  } catch (error) {
    console.error('Approve hospital error:', error);
    return errorResponse('Failed to process approval', 500);
  }
}

export const PUT = withAuth(
  async (req: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    await connectDB();
    const params = await context?.params;
    return approveHospital(req, { params: Promise.resolve({ id: params?.id || '' }) });
  },
  ['admin']
);
