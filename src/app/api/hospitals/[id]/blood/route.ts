import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Hospital } from '@/models';
import { withAuth, successResponse, errorResponse, getUserFromRequest } from '@/lib/middleware';
import { bloodUpdateSchema } from '@/lib/validations';

// PUT /api/hospitals/[id]/blood - Update blood stock
async function updateBloodStock(
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
    const validationResult = bloodUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const { bloodGroup, units, expiryDate } = validationResult.data;

    // Update blood stock for specific blood group
    const bloodBankIndex = hospital.bloodBank.findIndex(
      (b) => b.bloodGroup === bloodGroup
    );

    if (bloodBankIndex === -1) {
      // Add new blood group entry
      hospital.bloodBank.push({
        bloodGroup,
        units,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        lastUpdated: new Date(),
      });
    } else {
      // Update existing entry
      hospital.bloodBank[bloodBankIndex].units = units;
      hospital.bloodBank[bloodBankIndex].lastUpdated = new Date();
      if (expiryDate) {
        hospital.bloodBank[bloodBankIndex].expiryDate = new Date(expiryDate);
      }
    }

    hospital.lastBloodUpdate = new Date();
    await hospital.save();

    // Check for low stock alerts
    const lowStockAlerts = hospital.bloodBank
      .filter((b) => b.units < 5)
      .map((b) => ({ bloodGroup: b.bloodGroup, units: b.units }));

    return successResponse(
      {
        bloodBank: hospital.bloodBank,
        lastBloodUpdate: hospital.lastBloodUpdate,
        lowStockAlerts,
      },
      'Blood stock updated successfully'
    );
  } catch (error) {
    console.error('Update blood stock error:', error);
    return errorResponse('Failed to update blood stock', 500);
  }
}

// PUT - Update single blood group
export const PUT = withAuth(
  async (req: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    await connectDB();
    const params = await context?.params;
    return updateBloodStock(req, { params: Promise.resolve({ id: params?.id || '' }) });
  },
  ['hospital', 'admin']
);

// PATCH - Bulk update all blood groups
async function bulkUpdateBloodStock(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, role } = getUserFromRequest(req);
    const { id } = await params;

    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return errorResponse('Hospital not found', 404);
    }

    if (hospital.userId.toString() !== userId && role !== 'admin') {
      return errorResponse('Not authorized to update this hospital', 403);
    }

    const body = await req.json();

    if (!Array.isArray(body.bloodBank)) {
      return errorResponse('bloodBank array is required', 400);
    }

    // Update all blood groups
    for (const item of body.bloodBank) {
      const validation = bloodUpdateSchema.safeParse(item);
      if (!validation.success) {
        return errorResponse(`Invalid data for ${item.bloodGroup}: ${validation.error.issues[0].message}`, 400);
      }

      const index = hospital.bloodBank.findIndex(
        (b) => b.bloodGroup === item.bloodGroup
      );

      if (index !== -1) {
        hospital.bloodBank[index].units = item.units;
        hospital.bloodBank[index].lastUpdated = new Date();
        if (item.expiryDate) {
          hospital.bloodBank[index].expiryDate = new Date(item.expiryDate);
        }
      }
    }

    hospital.lastBloodUpdate = new Date();
    await hospital.save();

    const lowStockAlerts = hospital.bloodBank
      .filter((b) => b.units < 5)
      .map((b) => ({ bloodGroup: b.bloodGroup, units: b.units }));

    return successResponse(
      {
        bloodBank: hospital.bloodBank,
        lastBloodUpdate: hospital.lastBloodUpdate,
        lowStockAlerts,
      },
      'Blood stock bulk updated successfully'
    );
  } catch (error) {
    console.error('Bulk update blood stock error:', error);
    return errorResponse('Failed to bulk update blood stock', 500);
  }
}

export const PATCH = withAuth(
  async (req: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    await connectDB();
    const params = await context?.params;
    return bulkUpdateBloodStock(req, { params: Promise.resolve({ id: params?.id || '' }) });
  },
  ['hospital', 'admin']
);
