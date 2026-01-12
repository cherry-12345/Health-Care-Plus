import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Hospital } from '@/models';
import { withAuth, successResponse, errorResponse, getUserFromRequest } from '@/lib/middleware';
import { bedUpdateSchema } from '@/lib/validations';

// PUT /api/hospitals/[id]/beds - Update bed availability
async function updateBeds(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, role } = getUserFromRequest(req);
    const { id } = await params;

    // Get hospital and verify ownership
    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return errorResponse('Hospital not found', 404);
    }

    // Check if user owns this hospital or is admin
    if (hospital.userId.toString() !== userId && role !== 'admin') {
      return errorResponse('Not authorized to update this hospital', 403);
    }

    const body = await req.json();

    // Validate input
    const validationResult = bedUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const bedUpdates = validationResult.data;

    // Validate that occupied <= total for each bed type
    for (const [bedType, counts] of Object.entries(bedUpdates)) {
      if (counts && counts.occupied > counts.total) {
        return errorResponse(
          `${bedType}: occupied beds cannot exceed total capacity`,
          400
        );
      }
    }

    // Build update object
    const updateObj: any = {
      lastBedUpdate: new Date(),
    };

    if (bedUpdates.general) {
      updateObj['beds.general.total'] = bedUpdates.general.total;
      updateObj['beds.general.occupied'] = bedUpdates.general.occupied;
      updateObj['beds.general.available'] = bedUpdates.general.total - bedUpdates.general.occupied;
    }
    if (bedUpdates.icu) {
      updateObj['beds.icu.total'] = bedUpdates.icu.total;
      updateObj['beds.icu.occupied'] = bedUpdates.icu.occupied;
      updateObj['beds.icu.available'] = bedUpdates.icu.total - bedUpdates.icu.occupied;
    }
    if (bedUpdates.oxygen) {
      updateObj['beds.oxygen.total'] = bedUpdates.oxygen.total;
      updateObj['beds.oxygen.occupied'] = bedUpdates.oxygen.occupied;
      updateObj['beds.oxygen.available'] = bedUpdates.oxygen.total - bedUpdates.oxygen.occupied;
    }
    if (bedUpdates.ventilator) {
      updateObj['beds.ventilator.total'] = bedUpdates.ventilator.total;
      updateObj['beds.ventilator.occupied'] = bedUpdates.ventilator.occupied;
      updateObj['beds.ventilator.available'] = bedUpdates.ventilator.total - bedUpdates.ventilator.occupied;
    }

    // Update hospital
    const updatedHospital = await Hospital.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true }
    ).select('beds lastBedUpdate');

    return successResponse(
      {
        beds: updatedHospital?.beds,
        lastBedUpdate: updatedHospital?.lastBedUpdate,
      },
      'Bed availability updated successfully'
    );
  } catch (error) {
    console.error('Update beds error:', error);
    return errorResponse('Failed to update bed availability', 500);
  }
}

export const PUT = withAuth(
  async (req: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    await connectDB();
    const params = await context?.params;
    return updateBeds(req, { params: Promise.resolve({ id: params?.id || '' }) });
  },
  ['hospital', 'admin']
);
