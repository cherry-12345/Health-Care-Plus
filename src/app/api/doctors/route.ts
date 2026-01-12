import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Doctor, Hospital } from '@/models';
import { withAuth, successResponse, errorResponse, getUserFromRequest } from '@/lib/middleware';
import { doctorSchema } from '@/lib/validations';

// GET /api/doctors - Get doctors (with filters)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const hospitalId = searchParams.get('hospitalId');
    const specialization = searchParams.get('specialization');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query: any = { isActive: true };

    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    if (specialization) {
      query.specialization = specialization;
    }

    const skip = (page - 1) * limit;

    const doctors = await Doctor.find(query)
      .populate('hospitalId', 'name address contact')
      .sort({ 'rating.overall': -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Doctor.countDocuments(query);

    return successResponse({
      doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    return errorResponse('Failed to get doctors', 500);
  }
}

// POST /api/doctors - Create new doctor (Hospital Admin only)
async function createDoctor(req: NextRequest) {
  try {
    const { userId, role } = getUserFromRequest(req);
    const body = await req.json();

    // Validate input
    const validationResult = doctorSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const { hospitalId, ...doctorData } = body;

    // Verify hospital ownership
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return errorResponse('Hospital not found', 404);
    }

    if (hospital.userId.toString() !== userId && role !== 'admin') {
      return errorResponse('Not authorized to add doctors to this hospital', 403);
    }

    // Check for duplicate registration number
    const existingDoctor = await Doctor.findOne({
      registrationNumber: doctorData.registrationNumber,
    });

    if (existingDoctor) {
      return errorResponse('Doctor with this registration number already exists', 400);
    }

    // Create doctor
    const doctor = await Doctor.create({
      hospitalId,
      ...doctorData,
    });

    return successResponse(doctor, 'Doctor added successfully', 201);
  } catch (error: any) {
    console.error('Create doctor error:', error);

    if (error.code === 11000) {
      return errorResponse('Doctor with this registration number already exists', 400);
    }

    return errorResponse('Failed to add doctor', 500);
  }
}

export const POST = withAuth(
  async (req: NextRequest) => {
    await connectDB();
    return createDoctor(req);
  },
  ['hospital', 'admin']
);
