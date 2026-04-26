import express from 'express';
import { register, verifyRegistrationOTP, login, forgotPassword, resetPassword, logout, getPublicStats } from '../controllers/authController.js';
import { loginLimiter, registrationLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Apply rate limiting to sensitive endpoints
router.post('/registration', registrationLimiter, register);
router.post('/verify-registration-otp', verifyRegistrationOTP);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/forgetpassword', forgotPassword);
router.post('/resetpassword', resetPassword);

// Public stats endpoint (no auth required)
router.get('/public-stats', getPublicStats);

export default router;

