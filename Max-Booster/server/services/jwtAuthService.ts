import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { storage } from '../storage';
import type { InsertJWTToken, InsertRefreshToken } from '@shared/schema';

// Use SESSION_SECRET for JWT signing to consolidate secret management
let JWT_SECRET = process.env.SESSION_SECRET || '';

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable is required in production');
  }
  
  console.warn('⚠️  SESSION_SECRET not set - using development fallback. Set SESSION_SECRET for production!');
  JWT_SECRET = 'dev-secret-' + crypto.createHash('sha256').update('maxbooster-dev').digest('hex');
}

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // 30 days

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenId: string;
  refreshTokenId: string;
  expiresAt: Date;
}

export class JWTAuthService {
  async issueTokens(userId: string, role: string = 'user'): Promise<TokenPair> {
    const accessTokenId = crypto.randomUUID();
    const refreshTokenId = crypto.randomUUID();
    const refreshTokenValue = crypto.randomBytes(32).toString('hex');

    const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const accessToken = jwt.sign(
      {
        sub: userId,
        jti: accessTokenId,
        role,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const jwtTokenData: InsertJWTToken = {
      userId,
      accessToken,
      expiresAt: accessTokenExpiresAt,
      revoked: false,
    };

    const refreshTokenData: InsertRefreshToken = {
      userId,
      token: refreshTokenValue,
      expiresAt: refreshTokenExpiresAt,
      revoked: false,
    };

    const [jwtTokenRecord, refreshTokenRecord] = await Promise.all([
      storage.createJWTToken(jwtTokenData),
      storage.createRefreshToken(refreshTokenData),
    ]);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      accessTokenId: jwtTokenRecord.id,
      refreshTokenId: refreshTokenRecord.id,
      expiresAt: accessTokenExpiresAt,
    };
  }

  async verifyAccessToken(token: string): Promise<{ userId: string; role: string; jti: string } | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; jti: string; role: string };

      const isValid = await storage.verifyJWTToken(decoded.jti);
      if (!isValid) {
        return null;
      }

      return {
        userId: decoded.sub,
        role: decoded.role,
        jti: decoded.jti,
      };
    } catch (error) {
      return null;
    }
  }

  async refreshAccessToken(refreshTokenValue: string): Promise<{ accessToken: string; accessTokenId: string; expiresAt: Date } | null> {
    const refreshToken = await storage.getRefreshToken(refreshTokenValue);
    
    if (!refreshToken || refreshToken.revoked) {
      return null;
    }

    const now = new Date();
    if (refreshToken.expiresAt < now) {
      return null;
    }

    const user = await storage.getUser(refreshToken.userId);
    if (!user) {
      return null;
    }

    const accessTokenId = crypto.randomUUID();
    const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const accessToken = jwt.sign(
      {
        sub: user.id,
        jti: accessTokenId,
        role: user.role || 'user',
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const jwtTokenData: InsertJWTToken = {
      userId: user.id,
      accessToken,
      expiresAt: accessTokenExpiresAt,
      revoked: false,
    };

    const jwtTokenRecord = await storage.createJWTToken(jwtTokenData);

    return {
      accessToken,
      accessTokenId: jwtTokenRecord.id,
      expiresAt: accessTokenExpiresAt,
    };
  }

  async revokeAllUserTokens(userId: string, reason: string = 'User logout'): Promise<void> {
    await Promise.all([
      storage.revokeAllJWTTokensForUser(userId, reason),
      storage.revokeAllRefreshTokensForUser(userId, reason),
    ]);
  }

  async revokeToken(tokenId: string, reason: string): Promise<void> {
    await storage.revokeJWTToken(tokenId, reason);
  }
}

export const jwtAuthService = new JWTAuthService();
