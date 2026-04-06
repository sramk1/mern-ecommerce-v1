import { Router } from 'express';
import {
  getProducts, getFeatured, getProduct,
  createProduct, updateProduct, deleteProduct,
  createReview, deleteReview,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/featured',                   getFeatured);
router.get('/',                           getProducts);
router.get('/:id',                        getProduct);
router.post('/',   protect, authorize('admin'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/reviews', protect, createReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

export default router;
