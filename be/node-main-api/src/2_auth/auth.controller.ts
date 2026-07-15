import { Request, Response } from 'express';
import * as authService from './auth.service';
import { AuthRequest } from './auth.middleware';

const isProd = process.env.NODE_ENV === 'production';

// httpOnly: token JS không đọc được (chống XSS đánh cắp token)
// sameSite 'none' + secure bắt buộc khi FE/BE khác domain (production); 'lax' đủ dùng khi cùng localhost lúc dev
const cookieOptions = (maxAge: number, httpOnly: boolean) => ({
  httpOnly,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  maxAge,
});

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const setAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  info: { role: string; emailVerified: boolean },
) => {
  res.cookie(
    'accessToken',
    tokens.accessToken,
    cookieOptions(ACCESS_TOKEN_MAX_AGE, true),
  );
  res.cookie(
    'refreshToken',
    tokens.refreshToken,
    cookieOptions(REFRESH_TOKEN_MAX_AGE, true),
  );
  res.cookie('role', info.role, cookieOptions(REFRESH_TOKEN_MAX_AGE, false));
  res.cookie(
    'emailVerified',
    String(info.emailVerified),
    cookieOptions(REFRESH_TOKEN_MAX_AGE, false),
  );
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken', cookieOptions(0, true));
  res.clearCookie('refreshToken', cookieOptions(0, true));
  res.clearCookie('role', cookieOptions(0, false));
  res.clearCookie('emailVerified', cookieOptions(0, false));
};

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const requestActivateOTP = async (req: Request, res: Response) => {
  try {
    const { username, email, temporaryPassword } = req.body
    const result = await authService.requestActivateOTP(username, email, temporaryPassword)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message })
  }
}

export const activateAccount = async (req: Request, res: Response) => {
  try {
    const { username, email, otp, newPassword } = req.body;
    const result = await authService.activateAccount(username, email, otp, newPassword);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUser(req.body);
    setAuthCookies(res, result, {
      role: result.role,
      emailVerified: result.emailVerified,
    });
    res
      .status(200)
      .json({ role: result.role, emailVerified: result.emailVerified });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { identifier, type, email, temporaryPassword } = req.body;
    const result = await authService.resendOTP(identifier, type, email, temporaryPassword);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
    }
    const { accessToken } = await authService.refreshAccessToken(refreshToken);
    res.cookie(
      'accessToken',
      accessToken,
      cookieOptions(ACCESS_TOKEN_MAX_AGE, true),
    );
    res.status(200).json({ message: 'Cấp thành công' });
  } catch (error: any) {
    res.status(error.statusCode || 401).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const result = refreshToken
      ? await authService.logoutUser(refreshToken)
      : { message: 'Logged out successfully' };
    clearAuthCookies(res);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  res.status(200).json({ user: req.user });
};