import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import Product from '../models/Product.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { sendEmail, orderConfirmHtml } from '../utils/sendEmail.js';

// POST /api/orders
export const createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod, paymentResult } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart?.items?.length) return next(new AppError('Cart is empty', 400));

  const orderItems = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product) return next(new AppError(`Product not found: ${item.name}`, 404));
    if (product.stock < item.quantity) return next(new AppError(`Insufficient stock: ${product.name}`, 400));
    orderItems.push({ product: item.product, name: item.name, image: item.image, price: item.price, quantity: item.quantity });
  }

  const itemsPrice    = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxPrice      = Math.round(itemsPrice * 0.18);
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const totalPrice    = itemsPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id, orderItems, shippingAddress, paymentMethod,
    paymentResult: paymentResult || {},
    itemsPrice, taxPrice, shippingPrice, totalPrice,
    isPaid:  paymentMethod !== 'cod',
    paidAt:  paymentMethod !== 'cod' ? new Date() : undefined,
  });

  // Decrement stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  // Send email (non-blocking)
  sendEmail({ to: req.user.email, subject: `Order Confirmed #${String(order._id).slice(-8).toUpperCase()}`, html: orderConfirmHtml(order) }).catch(() => {});

  res.status(201).json({ success: true, order });
});

// GET /api/orders/my
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, orders });
});

// GET /api/orders/:id
export const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return next(new AppError('Order not found', 404));
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return next(new AppError('Not authorized', 403));
  res.json({ success: true, order });
});

// PUT /api/orders/:id/cancel
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));
  if (!['pending', 'processing'].includes(order.orderStatus))
    return next(new AppError('Cannot cancel at this stage', 400));
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
  order.orderStatus = 'cancelled';
  await order.save();
  res.json({ success: true, order });
});

// GET /api/admin/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders     = await Order.find().populate('user', 'name email').sort('-createdAt');
  const totalSales = orders.filter(o => o.isPaid).reduce((s, o) => s + o.totalPrice, 0);
  res.json({ success: true, orders, totalSales });
});

// PUT /api/admin/orders/:id
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));
  if (order.orderStatus === 'delivered') return next(new AppError('Already delivered', 400));
  order.orderStatus = req.body.orderStatus;
  if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
  if (req.body.orderStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'cod') { order.isPaid = true; order.paidAt = new Date(); }
  }
  await order.save();
  res.json({ success: true, order });
});
