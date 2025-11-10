import type { Request, Response, NextFunction } from 'express';
import { jwtAuthService } from './services/jwtAuthService';
import { storage } from './storage';

export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No JWT token provided' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = await jwtAuthService.verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or revoked token' });
    }
    
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      subscriptionType: user.subscriptionTier || null,
      subscriptionStatus: user.subscriptionStatus || null,
      stripeCustomerId: user.stripeCustomerId || null,
      subscriptionEndDate: user.subscriptionEndsAt || null,
      trialEndDate: user.trialEndsAt || null,
    };
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ message: 'Token verification failed' });
  }
};

export const requireAuthDual = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          subscriptionType: user.subscriptionTier || null,
          subscriptionStatus: user.subscriptionStatus || null,
          stripeCustomerId: user.stripeCustomerId || null,
          subscriptionEndDate: user.subscriptionEndsAt || null,
          trialEndDate: user.trialEndsAt || null,
        };
        return next();
      }
    } catch (error) {
      console.error('Session auth error:', error);
    }
  }
  
  return verifyJWT(req, res, next);
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const user = await storage.getUser(req.user.id);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// Alias for backwards compatibility
export const requireAuth = requireAuthDual;
