import { Router } from 'express';
import express from 'express';
import {
  getRazorpayKey, createRazorpayOrder, verifyRazorpay,
  createStripeIntent, stripeWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.use(protect);
router.get('/razorpay/key',      getRazorpayKey);
router.post('/razorpay/order',   createRazorpayOrder);
router.post('/razorpay/verify',  verifyRazorpay);
router.post('/stripe/intent',    createStripeIntent);
export default router;
