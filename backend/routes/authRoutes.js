// routes/authRoutes.js
import { Router } from 'express';
import {
  register, login, logout, refreshToken, getProfile, updateProfile,
  changePassword, forgotPassword, resetPassword, addAddress, updateAddress, deleteAddress,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();

router.post('/register',         register);
router.post('/login',            login);
router.post('/logout',           protect, logout);
router.post('/refresh',          refreshToken);
router.get('/profile',           protect, getProfile);
router.put('/profile',           protect, upload.single('avatar'), updateProfile);
router.put('/change-password',   protect, changePassword);
router.post('/forgot-password',  forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/address',          protect, addAddress);
router.put('/address/:id',       protect, updateAddress);
router.delete('/address/:id',    protect, deleteAddress);

export default router;
