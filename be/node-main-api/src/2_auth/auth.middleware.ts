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
      'string.empty': 'Account cannot be empty',
      'any.required': 'Please enter your account',
    }),
  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty',
    'any.required': 'Please enter your password',
  }),
});

const activateSchema = Joi.object({
  username: Joi.string().required().trim().messages({
    'string.empty': 'Username cannot be empty',
    'any.required': 'Please enter your username',
  }),
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Please enter your email',
  }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'Please enter the OTP',
    }),
  newPassword: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'))
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers',
      'any.required': 'Please enter a new password',
    }),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'Please enter the OTP',
    }),
  newPassword: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'))
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers',
      'any.required': 'Please enter a new password',
    }),
});

export const validLogin = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ message: error.details.map((d) => d.message).join('. ') });
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
      .json({ message: error.details.map((d) => d.message).join('. ') });
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
      .json({ message: error.details.map((d) => d.message).join('. ') });
  }
  req.body = value;
  next();
};

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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Please log in to use this feature' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: 'Token is invalid or has expired' });
    }
    req.user = decoded as JwtPayload;
    next();
  });
};
