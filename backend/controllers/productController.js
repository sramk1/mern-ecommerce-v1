import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import ApiFeatures from '../utils/ApiFeatures.js';
import { AppError } from '../middleware/errorMiddleware.js';
import cloudinary from '../config/cloudinary.js';

const toCloud = (buffer, opts) =>
  new Promise((res, rej) =>
    cloudinary.uploader.upload_stream(opts, (err, r) => (err ? rej(err) : res(r))).end(buffer)
  );

// GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const perPage = Number(req.query.limit) || 12;
  const total   = await Product.countDocuments();
  const api     = new ApiFeatures(Product.find(), req.query).search().filter().sort().paginate(perPage);
  const products = await api.query;
  res.json({ success: true, total, perPage, products });
});

// GET /api/products/featured
export const getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8);
  res.json({ success: true, products });
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('seller', 'name');
  if (!product) return next(new AppError('Product not found', 404));
  res.json({ success: true, product });
});

// POST /api/products  [admin]
export const createProduct = asyncHandler(async (req, res) => {
  req.body.seller = req.user._id;
  let images = [];
  if (req.files?.length) {
    const uploads = await Promise.all(req.files.map(f => toCloud(f.buffer, { folder: 'ecommerce/products' })));
    images = uploads.map(r => ({ url: r.secure_url, publicId: r.public_id }));
  }
  const product = await Product.create({ ...req.body, images });
  res.status(201).json({ success: true, product });
});

// PUT /api/products/:id  [admin]
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));
  if (req.files?.length) {
    await Promise.all(product.images.filter(i => i.publicId).map(i => cloudinary.uploader.destroy(i.publicId)));
    const uploads = await Promise.all(req.files.map(f => toCloud(f.buffer, { folder: 'ecommerce/products' })));
    req.body.images = uploads.map(r => ({ url: r.secure_url, publicId: r.public_id }));
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, product });
});

// DELETE /api/products/:id  [admin]
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));
  await Promise.all(product.images.filter(i => i.publicId).map(i => cloudinary.uploader.destroy(i.publicId)));
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

// POST /api/products/:id/reviews  [user]
export const createReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));
  const existing = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (existing) {
    existing.rating  = Number(rating);
    existing.comment = comment;
  } else {
    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.numReviews = product.reviews.length;
  }
  product.ratings = product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ success: true, message: 'Review submitted' });
});

// DELETE /api/products/:id/reviews/:reviewId
export const deleteReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));
  product.reviews    = product.reviews.filter(r => r._id.toString() !== req.params.reviewId);
  product.numReviews = product.reviews.length;
  product.ratings    = product.reviews.length
    ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length : 0;
  await product.save();
  res.json({ success: true, message: 'Review deleted' });
});

// GET /api/admin/products  [admin]
export const getAdminProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort('-createdAt');
  res.json({ success: true, products });
});
