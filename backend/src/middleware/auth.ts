import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing authorization token'));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
