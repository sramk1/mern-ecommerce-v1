import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import Stripe from 'stripe';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { AppError } from '../middleware/errorMiddleware.js';

const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
const stripe   = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /api/payment/razorpay/key
export const getRazorpayKey = asyncHandler(async (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
});

// POST /api/payment/razorpay/order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const order = await razorpay.orders.create({
    amount:   Math.round(req.body.amount * 100),
    currency: 'INR',
    receipt:  `rcpt_${Date.now()}`,
  });
  res.json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID });
});

// POST /api/payment/razorpay/verify
export const verifyRazorpay = asyncHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  if (expected !== razorpay_signature) return next(new AppError('Payment verification failed', 400));
  res.json({
    success: true,
    paymentResult: {
      id: razorpay_payment_id, status: 'completed',
      updateTime: new Date().toISOString(),
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    },
  });
});

// POST /api/payment/stripe/intent
export const createStripeIntent = asyncHandler(async (req, res) => {
  const intent = await stripe.paymentIntents.create({
    amount:   Math.round(req.body.amount * 100),
    currency: 'inr',
    metadata: { userId: req.user._id.toString() },
  });
  res.json({ success: true, clientSecret: intent.client_secret });
});

// POST /api/payment/stripe/webhook  (raw body)
export const stripeWebhook = asyncHandler(async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    await Order.findOneAndUpdate(
      { 'paymentResult.id': intent.id },
      { isPaid: true, paidAt: new Date(), 'paymentResult.status': 'completed' }
    );
  }
  res.json({ received: true });
});
