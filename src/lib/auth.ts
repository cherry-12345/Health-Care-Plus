import jwt, { JwtPayload } from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'hospital' | 'admin';
}

export interface DecodedToken extends TokenPayload, JwtPayload {}

export function generateAccessToken(payload: TokenPayload): string {
  // @ts-expect-error - expiresIn types are stricter in newer versions
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

export function generateRefreshToken(payload: TokenPayload): string {
  // @ts-expect-error - expiresIn types are stricter in newer versions
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

export function verifyAccessToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

export function generateTokens(payload: TokenPayload) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return { accessToken, refreshToken };
}
