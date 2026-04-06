import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendTokenResponse, generateAccessToken } from '../utils/generateToken.js';
import { sendEmail, resetPasswordHtml } from '../utils/sendEmail.js';
import { AppError } from '../middleware/errorMiddleware.js';
import cloudinary from '../config/cloudinary.js';

const uploadStream = (buffer, opts) =>
  new Promise((res, rej) =>
    cloudinary.uploader.upload_stream(opts, (err, r) => (err ? rej(err) : res(r))).end(buffer)
  );

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) return next(new AppError('Email already registered', 400));
  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res);
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Provide email and password', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) return next(new AppError('Invalid credentials', 401));
  sendTokenResponse(user, 200, res);
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out' });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return next(new AppError('No refresh token', 401));
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user    = await User.findById(decoded.id);
  if (!user) return next(new AppError('User not found', 401));
  res.json({ success: true, accessToken: generateAccessToken(user._id) });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.name)  user.name  = req.body.name;
  if (req.body.email) user.email = req.body.email;
  if (req.file) {
    if (user.avatar?.publicId) await cloudinary.uploader.destroy(user.avatar.publicId);
    const r = await uploadStream(req.file.buffer, { folder: 'ecommerce/avatars' });
    user.avatar = { url: r.secure_url, publicId: r.public_id };
  }
  await user.save();
  res.json({ success: true, user });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) return next(new AppError('Current password incorrect', 400));
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No account with that email', 404));
  const token  = user.getResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({ to: user.email, subject: 'Password Reset', html: resetPasswordHtml(user.name, url) });
    res.json({ success: true, message: 'Reset email sent' });
  } catch {
    user.resetPasswordToken = user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    next(new AppError('Email could not be sent', 500));
  }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user   = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
  if (!user) return next(new AppError('Invalid or expired token', 400));
  user.password = req.body.password;
  user.resetPasswordToken = user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res);
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach(a => (a.isDefault = false));
  if (!user.addresses.length) req.body.isDefault = true;
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

export const updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) return next(new AppError('Address not found', 404));
  if (req.body.isDefault) user.addresses.forEach(a => (a.isDefault = false));
  Object.assign(addr, req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});
