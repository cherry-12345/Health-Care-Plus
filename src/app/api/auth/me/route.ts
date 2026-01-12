import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models';
import { withAuth, successResponse, errorResponse, getUserFromRequest } from '@/lib/middleware';
import { updateProfileSchema } from '@/lib/validations';

// GET /api/auth/me - Get current user profile
async function getProfile(req: NextRequest) {
  try {
    const { userId } = getUserFromRequest(req);

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse('Failed to get profile', 500);
  }
}

// PUT /api/auth/me - Update user profile
async function updateProfile(req: NextRequest) {
  try {
    const { userId } = getUserFromRequest(req);
    const body = await req.json();

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const updateData = validationResult.data;

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
    }, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('Failed to update profile', 500);
  }
}

export const GET = withAuth(async (req: NextRequest) => {
  await connectDB();
  return getProfile(req);
});

export const PUT = withAuth(async (req: NextRequest) => {
  await connectDB();
  return updateProfile(req);
});
