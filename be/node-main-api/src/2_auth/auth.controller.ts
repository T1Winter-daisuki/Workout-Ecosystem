import { Request, Response } from 'express';
import * as authService from './auth.service';
import { AuthRequest } from './auth.middleware';

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
    res.status(200).json(result);
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
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 401).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.logoutUser(refreshToken);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  res.status(200).json({ user: req.user });
};