import Joi from 'joi';
import escape from 'escape-html';

export const registerSchema = Joi.object({
  username: Joi.string()
    .custom((v) => escape(v))
    .required()
    .trim()
    .min(3)
    .messages({
      'string.empty': 'Username không được để trống',
      'string.min': 'Username phải có ít nhất 3 ký tự',
      'any.required': 'Vui lòng nhập username',
    }),
  temporaryPassword: Joi.string().required().min(6).messages({
    'string.empty': 'Mật khẩu tạm không được để trống',
    'string.min': 'Mật khẩu tạm phải có ít nhất 6 ký tự',
    'any.required': 'Vui lòng nhập mật khẩu tạm',
  }),
});

export const updateNameSchema = Joi.object({
  name: Joi.string()
    .custom((v) => escape(v))
    .required()
    .trim()
    .min(1)
    .max(50)
    .messages({
      'string.empty': 'Tên không được để trống',
      'string.max': 'Tên không được quá 50 ký tự',
      'any.required': 'Vui lòng nhập tên',
    }),
});

export const loginSchema = Joi.object({
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

export const requestActivateOtpSchema = Joi.object({
  username: Joi.string().required().trim().messages({
    'string.empty': 'Username không được để trống',
    'any.required': 'Vui lòng nhập username',
  }),
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Vui lòng nhập email',
  }),
  temporaryPassword: Joi.string().required().messages({
    'string.empty': 'Mật khẩu không được để trống',
    'any.required': 'Vui lòng nhập mật khẩu',
  }),
});

export const activateSchema = Joi.object({
  username: Joi.string().required().trim().messages({
    'string.empty': 'Username không được để trống',
    'any.required': 'Vui lòng nhập username',
  }),
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Vui lòng nhập email',
  }),
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

export const resetPasswordSchema = Joi.object({
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

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Vui lòng nhập email',
  }),
});

export const resendOtpSchema = Joi.object({
  identifier: Joi.string().required().trim().messages({
    'string.empty': 'Identifier không được để trống',
    'any.required': 'Vui lòng nhập identifier',
  }),
  type: Joi.string().valid('activate', 'reset').required().messages({
    'any.only': 'Type phải là activate hoặc reset',
    'any.required': 'Vui lòng nhập type',
  }),
  email: Joi.string()
    .email()
    .trim()
    .when('type', {
      is: 'activate',
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Vui lòng nhập email để nhận OTP kích hoạt',
  }),
  temporaryPassword: Joi.string()
    .when('type', {
      is: 'activate',
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      'string.empty': 'Vui lòng nhập mật khẩu',
      'any.required': 'Vui lòng nhập mật khẩu',
  }),
});
