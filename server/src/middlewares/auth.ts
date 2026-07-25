import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { CustomError } from '../utils/CustomError';

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('Authorization header missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new CustomError('Access token missing', 401);
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new CustomError('Invalid or expired access token', 401));
  }
};
