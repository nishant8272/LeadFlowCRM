import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/CustomError';
import { UserRole } from '../types/user.types';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new CustomError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new CustomError('Access denied: insufficient permissions', 403));
    }

    next();
  };
};
