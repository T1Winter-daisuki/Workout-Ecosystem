import Joi from 'joi';
import escape from 'escape-html';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from './auth.model';

// Extend Request để gắn user vào
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Schema
const loginSchema = Joi.object({
  email: Joi.string()
    .custom((v) => escape(v))
    .required()
    .trim()
    .messages({
      'string.empty': 'Tài khoản không được để trống',
      'any.required': 'Vui lòng nhập tài khoản',
    }),
  password: Joi.string().required().messages({
    'string.empty': 'Mật khẩu không được để trống',
    'any.required': 'Vui lòng nhập mật khẩu',
  }),
});

const activateSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.length': 'OTP phải đúng 6 số',
      'string.pattern.base': 'OTP chỉ được chứa số',
      'any.required': 'Vui lòng nhập OTP',
    }),
  newPassword: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'))
    .min(8)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.pattern.base': 'Mật khẩu phải có chữ hoa, chữ thường và số',
      'any.required': 'Vui lòng nhập mật khẩu mới',
    }),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.length': 'OTP phải đúng 6 số',
      'string.pattern.base': 'OTP chỉ được chứa số',
      'any.required': 'Vui lòng nhập OTP',
    }),
  newPassword: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'))
    .min(8)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.pattern.base': 'Mật khẩu phải có chữ hoa, chữ thường và số',
      'any.required': 'Vui lòng nhập mật khẩu mới',
    }),
});

export const validLogin = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ message: error.details.map((d) => d.message).join(', ') });
  }
  req.body = value;
  next();
};

export const validActivate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error, value } = activateSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ message: error.details.map((d) => d.message).join(', ') });
  }
  req.body = value;
  next();
};

export const validResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error, value } = resetPasswordSchema.validate(req.body, {
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

// Chống DDoS cơ bản
export const loginRateLimit = rateLimit({
  windowMs: 30 * 1000,
  max: 5,
  message: { message: 'Quá nhiều yêu cầu, thử lại sau 30 giây' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Quá nhiều yêu cầu OTP, thử lại sau 1 giờ' },
  standardHeaders: true,
  legacyHeaders: false,
});

// jwt
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Hãy đăng nhập để sử dụng tính năng này' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    req.user = decoded as JwtPayload;
    next();
  });
};
