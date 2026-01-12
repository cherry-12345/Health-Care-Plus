import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, DecodedToken } from './auth';
import connectDB from './db';

export interface AuthenticatedRequest extends NextRequest {
  user?: DecodedToken;
}

type RouteHandler = (
  req: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

// Error response helper
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

// Success response helper
export function successResponse(data: any, message: string = 'Success', status: number = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

// Authentication middleware
export function withAuth(handler: RouteHandler, allowedRoles?: ('user' | 'hospital' | 'admin')[]) {
  return async (req: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    try {
      // Connect to database
      await connectDB();

      // Get token from header
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse('Authorization token required', 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);

      if (!decoded) {
        return errorResponse('Invalid or expired token', 401);
      }

      // Check role permissions
      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return errorResponse('Insufficient permissions', 403);
      }

      // Add user info to request headers for downstream use
      const headers = new Headers(req.headers);
      headers.set('x-user-id', decoded.userId);
      headers.set('x-user-email', decoded.email);
      headers.set('x-user-role', decoded.role);

      // Create new request with modified headers
      const modifiedReq = new NextRequest(req.url, {
        method: req.method,
        headers,
        body: req.body,
      });

      return handler(modifiedReq, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return errorResponse('Authentication failed', 500);
    }
  };
}

// Rate limiting helper (simple in-memory)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Get user info from request headers (after auth middleware)
export function getUserFromRequest(req: NextRequest) {
  return {
    userId: req.headers.get('x-user-id'),
    email: req.headers.get('x-user-email'),
    role: req.headers.get('x-user-role') as 'user' | 'hospital' | 'admin' | null,
  };
}
