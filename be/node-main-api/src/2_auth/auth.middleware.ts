import Joi from 'joi';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from './auth.model';
import {
  registerSchema,
  loginSchema,
  requestActivateOtpSchema,
  activateSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  resendOtpSchema,
  updateNameSchema,
} from './auth.dto';

// Extend Request để gắn user vào
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

const validate =
  (schema: Joi.Schema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res
        .status(400)
        .json({ message: error.details.map((d) => d.message).join(', ') });
    }
    req.body = value;
    next();
  };

export const validRegister = validate(registerSchema);
export const validLogin = validate(loginSchema);
export const validRequestActivateOtp = validate(requestActivateOtpSchema);
export const validActivate = validate(activateSchema);
export const validResetPassword = validate(resetPasswordSchema);
export const validForgotPassword = validate(forgotPasswordSchema);
export const validResendOtp = validate(resendOtpSchema);
export const validUpdateName = validate(updateNameSchema);

// Chống DDoS cơ bản
export const loginRateLimit = rateLimit({
  windowMs: 30 * 1000,
  max: 5,
  message: { message: 'Too many requests, please try again after 30 seconds' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many OTP requests, please try again after 1 hour' },
  standardHeaders: true,
  legacyHeaders: false,
});

// jwt
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Please log in to use this feature' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: jwt.VerifyErrors | null, decoded: any) => {
    if (err) {
      return res
        .status(403)
        .json({ message: 'Token is invalid or has expired' });
    }
    req.user = decoded as JwtPayload;
    next();
  });
};

// Chỉ cho phép role admin
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
  }
  next();
};
