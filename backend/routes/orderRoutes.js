import { Router } from 'express';
import { createOrder, getMyOrders, getOrder, cancelOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.post('/',           createOrder);
router.get('/my',          getMyOrders);
router.get('/:id',         getOrder);
router.put('/:id/cancel',  cancelOrder);
export default router;
