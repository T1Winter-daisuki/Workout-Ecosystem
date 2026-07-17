import { Router } from 'express';
import * as authController from './auth.controller';
import {
  validRegister,
  validLogin,
  validRequestActivateOtp,
  validActivate,
  validResetPassword,
  validForgotPassword,
  validResendOtp,
  validUpdateName,
  loginRateLimit,
  otpRateLimit,
  verifyToken,
  requireAdmin,
} from './auth.middleware';

const router = Router();

// Admin tạo tài khoản — cần đăng nhập + role admin
router.post(
  '/register',
  verifyToken,
  requireAdmin,
  validRegister,
  authController.register,
);

// User nhập email để nhận OTP kích hoạt
router.post(
  '/request-activate-otp',
  otpRateLimit,
  validRequestActivateOtp,
  authController.requestActivateOTP,
);

// Kích hoạt tài khoản lần đầu
router.post('/activate', validActivate, authController.activateAccount);

// Đăng nhập
router.post('/login', loginRateLimit, validLogin, authController.login);

// Quên mật khẩu
router.post(
  '/forgot-password',
  otpRateLimit,
  validForgotPassword,
  authController.forgotPassword,
);

// Đặt lại mật khẩu
router.post(
  '/reset-password',
  validResetPassword,
  authController.resetPassword,
);

// Gửi lại OTP
router.post(
  '/resend-otp',
  otpRateLimit,
  validResendOtp,
  authController.resendOTP,
);

// Refresh token — refreshToken lấy từ cookie httpOnly, không cần validate body
router.post('/refresh-token', authController.refreshToken);

// Đăng xuất — refreshToken lấy từ cookie httpOnly, không cần validate body
router.post('/logout', authController.logout);

// Lấy thông tin user đang đăng nhập (cần token)
router.get('/me', verifyToken, authController.getMe);

// Đổi tên hiển thị (username/password không đổi được ở đây)
router.patch('/name', verifyToken, validUpdateName, authController.updateName);

export default router;
