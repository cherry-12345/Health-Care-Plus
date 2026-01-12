import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models';
import { loginSchema } from '@/lib/validations';
import { generateTokens } from '@/lib/auth';
import { errorResponse, successResponse, checkRateLimit } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`login:${clientIP}`, 10, 60000)) { // 10 attempts per minute
      return errorResponse('Too many login attempts. Please try again later.', 429);
    }

    await connectDB();

    const body = await req.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const { email, password } = validationResult.data;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    if (!user.isActive) {
      return errorResponse('Account is deactivated. Please contact support.', 403);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Return response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
    };

    return successResponse(
      {
        user: userResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Login failed', 500);
  }
}
