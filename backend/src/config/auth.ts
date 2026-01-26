import dotenv from 'dotenv';
import type { SignOptions } from 'jsonwebtoken';

dotenv.config();

const jwtExpiry: SignOptions['expiresIn'] = process.env.JWT_EXPIRY
  ? (process.env.JWT_EXPIRY as SignOptions['expiresIn'])
  : '24h';

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtExpiry,
  saltRounds: 12,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};
