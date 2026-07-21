import { Response } from 'express';
import * as chatService from './chat.service';
import { AuthRequest } from '../2_auth/auth.middleware';

export const listConversations = async (req: AuthRequest, res: Response) => {
  try {
    const result = await chatService.listConversations(req.user!.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const result = await chatService.searchUsers(req.user!.userId, q);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const result = await chatService.getMessages(
      req.user!.userId,
      req.params.username as string,
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const result = await chatService.sendMessage(
      req.user!.userId,
      req.params.username as string,
      req.body.content,
    );
    res.status(201).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

export const sendFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file' });
    }
    const result = await chatService.sendFileMessage(
      req.user!.userId,
      req.params.username as string,
      req.file,
    );
    res.status(201).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};
