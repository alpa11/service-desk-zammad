import dotenv from 'dotenv';
import type { SignOptions, Secret } from 'jsonwebtoken';

dotenv.config();

const jwtSecret = (process.env.JWT_SECRET || 'default-secret-change-me') as Secret;
const jwtExpiry = (process.env.JWT_EXPIRY || '24h') as SignOptions['expiresIn'];

export const authConfig = {
  jwtSecret,
  jwtExpiry,
  saltRounds: 12,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};
