import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  description:   { type: String, required: true },
  price:         { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, default: 0 },
  category:      { type: String, required: true, enum: ['Electronics','Clothing','Books','Home & Kitchen','Sports','Beauty','Toys','Other'] },
  brand:         { type: String, required: true },
  stock:         { type: Number, required: true, default: 0, min: 0 },
  images:        [{ url: String, publicId: String }],
  ratings:       { type: Number, default: 0 },
  numReviews:    { type: Number, default: 0 },
  reviews:       [reviewSchema],
  isFeatured:    { type: Boolean, default: false },
  seller:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', brand: 'text' });

export default mongoose.model('Product', productSchema);
