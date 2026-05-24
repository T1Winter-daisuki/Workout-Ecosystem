import { Router } from 'express';
import * as authController from './auth.controller';
import {
  validLogin,
  validActivate,
  validResetPassword,
  loginRateLimit,
  otpRateLimit,
  verifyToken,
} from './auth.middleware';

const router = Router();

// Admin tạo tài khoản
router.post('/register', authController.register);

// User nhập email để nhận OTP kích hoạt
router.post('/request-activate-otp', otpRateLimit, authController.requestActivateOTP)

// Kích hoạt tài khoản lần đầu
router.post('/activate', validActivate, authController.activateAccount);

// Đăng nhập
router.post('/login', loginRateLimit, validLogin, authController.login);

// Quên mật khẩu
router.post('/forgot-password', otpRateLimit, authController.forgotPassword);

// Đặt lại mật khẩu
router.post(
  '/reset-password',
  validResetPassword,
  authController.resetPassword,
);

// Gửi lại OTP
router.post('/resend-otp', otpRateLimit, authController.resendOTP);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// Đăng xuất
router.post('/logout', authController.logout);

// Lấy thông tin user đang đăng nhập (cần token)
router.get('/me', verifyToken, authController.getMe);

export default router;
