import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models';
import { registerSchema } from '@/lib/validations';
import { generateTokens } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const { name, email, phone, password, role, address } = validationResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return errorResponse('Email already registered', 400);
      }
      return errorResponse('Phone number already registered', 400);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      address,
      isVerified: false, // Would be true after OTP verification
      isActive: true,
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Return response (exclude password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      isVerified: user.isVerified,
    };

    return successResponse(
      {
        user: userResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Registration successful',
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return errorResponse(`${field} already exists`, 400);
    }

    return errorResponse('Registration failed', 500);
  }
}
