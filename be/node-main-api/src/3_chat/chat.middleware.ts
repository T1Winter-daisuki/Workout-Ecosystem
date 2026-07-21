import Joi from 'joi';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { sendMessageSchema } from './chat.dto';

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

export const validSendMessage = validate(sendMessageSchema);

// PDF / Word / Excel / ảnh, tối đa 10MB, giữ trong memory để đẩy thẳng lên Supabase
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const chatFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      return cb(new Error('Chỉ chấp nhận file PDF, Word, Excel hoặc ảnh'));
    }
    cb(null, true);
  },
}).single('file');
