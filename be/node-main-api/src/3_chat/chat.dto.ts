import Joi from 'joi';

// tin nhắn chứa < > & hiển thị sai (double-escape)
export const sendMessageSchema = Joi.object({
  content: Joi.string().required().trim().min(1).max(2000).messages({
    'string.empty': 'Tin nhắn không được để trống',
    'string.max': 'Tin nhắn không được quá 2000 ký tự',
    'any.required': 'Vui lòng nhập tin nhắn',
  }),
});
