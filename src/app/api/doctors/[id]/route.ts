import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Doctor, Hospital } from '@/models';
import { withAuth, successResponse, errorResponse, getUserFromRequest } from '@/lib/middleware';
import { doctorSchema } from '@/lib/validations';

// GET /api/doctors/[id] - Get doctor details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const doctor = await Doctor.findById(id)
      .populate('hospitalId', 'name address contact type')
      .select('-__v');

    if (!doctor) {
      return errorResponse('Doctor not found', 404);
    }

    return successResponse(doctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    return errorResponse('Failed to get doctor details', 500);
  }
}

// PUT /api/doctors/[id] - Update doctor
async function updateDoctor(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, role } = getUserFromRequest(req);
    const { id } = await params;
    const body = await req.json();

    // Get doctor
    const doctor = await Doctor.findById(id).populate('hospitalId', 'userId');

    if (!doctor) {
      return errorResponse('Doctor not found', 404);
    }

    // Verify ownership
    const hospital = doctor.hospitalId as any;
    if (hospital.userId.toString() !== userId && role !== 'admin') {
      return errorResponse('Not authorized to update this doctor', 403);
    }

    // Partial validation for updates
    const updateData = { ...body };
    delete updateData.hospitalId; // Can't change hospital
    delete updateData.registrationNumber; // Can't change registration number

    // Update doctor
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    return successResponse(updatedDoctor, 'Doctor updated successfully');
  } catch (error) {
    console.error('Update doctor error:', error);
    return errorResponse('Failed to update doctor', 500);
  }
}

// DELETE /api/doctors/[id] - Delete doctor
async function deleteDoctor(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, role } = getUserFromRequest(req);
    const { id } = await params;

    // Get doctor
    const doctor = await Doctor.findById(id).populate('hospitalId', 'userId');

    if (!doctor) {
      return errorResponse('Doctor not found', 404);
    }

    // Verify ownership
    const hospital = doctor.hospitalId as any;
    if (hospital.userId.toString() !== userId && role !== 'admin') {
      return errorResponse('Not authorized to delete this doctor', 403);
    }

    // Soft delete (set isActive to false)
    await Doctor.findByIdAndUpdate(id, { isActive: false });

    return successResponse(null, 'Doctor removed successfully');
  } catch (error) {
    console.error('Delete doctor error:', error);
    return errorResponse('Failed to delete doctor', 500);
  }
}

export const PUT = withAuth(
  async (req: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    await connectDB();
    const params = await context?.params;
    return updateDoctor(req, { params: Promise.resolve({ id: params?.id || '' }) });
  },
  ['hospital', 'admin']
);

export const DELETE = withAuth(
  async (req: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    await connectDB();
    const params = await context?.params;
    return deleteDoctor(req, { params: Promise.resolve({ id: params?.id || '' }) });
  },
  ['hospital', 'admin']
);
