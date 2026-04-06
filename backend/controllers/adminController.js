import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { AppError } from '../middleware/errorMiddleware.js';

// GET /api/admin/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalProducts, orders] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments(),
    Order.find(),
  ]);

  const totalOrders  = orders.length;
  const totalRevenue = orders.filter(o => o.isPaid).reduce((s, o) => s + o.totalPrice, 0);
  const pending      = orders.filter(o => o.orderStatus === 'pending').length;

  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSales = await Order.aggregate([
    { $match: { createdAt: { $gte: since7 }, isPaid: true } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sales: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const topProducts = await Order.aggregate([
    { $unwind: '$orderItems' },
    { $group: { _id: '$orderItems.product', name: { $first: '$orderItems.name' }, totalSold: { $sum: '$orderItems.quantity' } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  res.json({ success: true, stats: { totalUsers, totalProducts, totalOrders, totalRevenue, pending }, recentSales, topProducts });
});

// GET /api/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, users });
});

// PUT /api/admin/users/:id
export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role, isActive: req.body.isActive }, { new: true });
  if (!user) return next(new AppError('User not found', 404));
  res.json({ success: true, user });
});

// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  if (user.role === 'admin') return next(new AppError('Cannot delete admin', 400));
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});
