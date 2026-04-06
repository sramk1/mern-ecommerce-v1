import { Router } from 'express';
import { getDashboard, getUsers, updateUser, deleteUser } from '../controllers/adminController.js';
import { getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { getAdminProducts } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect, authorize('admin'));
router.get('/dashboard',    getDashboard);
router.get('/users',        getUsers);
router.put('/users/:id',    updateUser);
router.delete('/users/:id', deleteUser);
router.get('/products',     getAdminProducts);
router.get('/orders',       getAllOrders);
router.put('/orders/:id',   updateOrderStatus);
export default router;
