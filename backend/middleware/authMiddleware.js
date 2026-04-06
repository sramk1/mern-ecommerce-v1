// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { AppError } from './errorMiddleware.js';

export const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return next(new AppError('Not authorized', 401));

  const token   = auth.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user    = await User.findById(decoded.id).select('-password');

  if (!user)          return next(new AppError('User not found', 401));
  if (!user.isActive) return next(new AppError('Account deactivated', 403));

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return next(new AppError('Forbidden: insufficient permissions', 403));
  next();
};
