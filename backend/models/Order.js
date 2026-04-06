import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:     { type: String, required: true },
    image:    { type: String, required: true },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone:    { type: String, required: true },
    line1:    { type: String, required: true },
    line2:    String,
    city:     { type: String, required: true },
    state:    { type: String, required: true },
    pincode:  { type: String, required: true },
    country:  { type: String, default: 'India' },
  },
  paymentMethod: { type: String, enum: ['razorpay', 'stripe', 'cod'], required: true },
  paymentResult: {
    id:                 String,
    status:             String,
    updateTime:         String,
    razorpayOrderId:    String,
    razorpayPaymentId:  String,
    razorpaySignature:  String,
  },
  itemsPrice:    { type: Number, required: true, default: 0 },
  taxPrice:      { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalPrice:    { type: Number, required: true, default: 0 },
  isPaid:        { type: Boolean, default: false },
  paidAt:        Date,
  orderStatus:   { type: String, enum: ['pending','processing','shipped','delivered','cancelled'], default: 'pending' },
  isDelivered:   { type: Boolean, default: false },
  deliveredAt:   Date,
  trackingNumber: String,
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
