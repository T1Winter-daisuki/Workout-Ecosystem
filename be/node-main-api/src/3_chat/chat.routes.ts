import { Router } from 'express';
import * as chatController from './chat.controller';
import { verifyToken } from '../2_auth/auth.middleware';
import { validSendMessage, chatFileUpload } from './chat.middleware';

const router = Router();

// Toàn bộ chat đều cần đăng nhập
router.use(verifyToken);

// Danh sách hội thoại của user hiện tại (kèm tin cuối + unread)
router.get('/conversations', chatController.listConversations);

// Tìm user để bắt đầu chat (thanh tìm kiếm)
router.get('/users', chatController.searchUsers);

// Tin nhắn với 1 user cụ thể — chưa từng chat thì trả rỗng
router.get('/messages/:username', chatController.getMessages);

// Gửi tin nhắn — conversation tự tạo nếu chưa có
router.post('/messages/:username', validSendMessage, chatController.sendMessage);

// Gửi file đính kèm (PDF/Word/Excel, multipart field "file")
router.post('/messages/:username/file', chatFileUpload, chatController.sendFile);

export default router;
