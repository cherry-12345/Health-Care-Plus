import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models';
import { verifyRefreshToken, generateTokens } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse('Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return errorResponse('Invalid or expired refresh token', 401);
    }

    // Find user and validate refresh token
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse('Invalid refresh token', 401);
    }

    if (!user.isActive) {
      return errorResponse('Account is deactivated', 403);
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save new refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return successResponse(
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Token refreshed successfully'
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse('Token refresh failed', 500);
  }
}
