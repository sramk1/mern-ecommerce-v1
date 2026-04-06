import asyncHandler from 'express-async-handler';
import { Cart } from '../models/Cart.js';
import Product from '../models/Product.js';
import { AppError } from '../middleware/errorMiddleware.js';

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name stock images');
  if (!cart) return res.json({ success: true, cart: { items: [], totalPrice: 0, totalItems: 0 } });
  res.json({ success: true, cart });
});

// POST /api/cart
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found', 404));
  if (product.stock < quantity) return next(new AppError(`Only ${product.stock} in stock`, 400));

  const price = product.discountPrice || product.price;
  const image = product.images[0]?.url || '';

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [{ product: productId, name: product.name, image, price, quantity }] });
  } else {
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) {
      const newQty = cart.items[idx].quantity + quantity;
      if (newQty > product.stock) return next(new AppError(`Only ${product.stock} in stock`, 400));
      cart.items[idx].quantity = newQty;
    } else {
      cart.items.push({ product: productId, name: product.name, image, price, quantity });
    }
    await cart.save();
  }
  res.status(201).json({ success: true, cart });
});

// PUT /api/cart/:itemId
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('Cart not found', 404));
  const item = cart.items.id(req.params.itemId);
  if (!item) return next(new AppError('Item not in cart', 404));
  const product = await Product.findById(item.product);
  if (quantity > product.stock) return next(new AppError(`Only ${product.stock} in stock`, 400));
  item.quantity = quantity;
  await cart.save();
  res.json({ success: true, cart });
});

// DELETE /api/cart/:itemId
export const removeCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('Cart not found', 404));
  cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.json({ success: true, cart });
});

// DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, cart: { items: [], totalPrice: 0, totalItems: 0 } });
});
