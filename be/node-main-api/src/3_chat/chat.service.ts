import { prisma } from '../prismaClient';
import { uploadChatFile } from '../1_config/supabaseStorage';
import { BadRequestError, NotFoundError } from '../2_auth/auth.errors';
import {
  ChatUserPreview,
  ConversationPreview,
  ChatMessage,
} from './chat.model';

const userPreview = {
  id: true,
  username: true,
  name: true,
  avatar_url: true,
} as const;

// Luôn sort 2 id để mỗi cặp user chỉ có đúng 1 conversation (khớp @@unique trong schema)
const pairIds = (a: string, b: string): [string, string] =>
  a < b ? [a, b] : [b, a];

const findOtherUser = async (username: string) => {
  const user = await prisma.users.findUnique({
    where: { username },
    select: userPreview,
  });
  if (!user) throw new NotFoundError('Người dùng không tồn tại');
  return user;
};

const toChatMessage = (
  m: {
    id: string;
    content: string;
    sender_id: string;
    created_at: Date;
    file_url: string | null;
    file_name: string | null;
    file_size: number | null;
  },
  userId: string,
): ChatMessage => ({
  id: m.id,
  content: m.content,
  mine: m.sender_id === userId,
  createdAt: m.created_at,
  fileUrl: m.file_url,
  fileName: m.file_name,
  fileSize: m.file_size,
});

// Dùng chung cho gửi text lẫn gửi file — conversation tự tạo nếu chưa có
const getOrCreateConversation = async (
  userId: string,
  otherUsername: string,
) => {
  const other = await findOtherUser(otherUsername);
  if (other.id === userId)
    throw new BadRequestError('Không thể tự nhắn tin cho chính mình');

  const [user1_id, user2_id] = pairIds(userId, other.id);
  return prisma.conversations.upsert({
    where: { user1_id_user2_id: { user1_id, user2_id } },
    update: {},
    create: { user1_id, user2_id },
  });
};

export const listConversations = async (
  userId: string,
): Promise<ConversationPreview[]> => {
  const conversations = await prisma.conversations.findMany({
    where: { OR: [{ user1_id: userId }, { user2_id: userId }] },
    include: {
      user1: { select: userPreview },
      user2: { select: userPreview },
      messages: { orderBy: { created_at: 'desc' }, take: 1 },
    },
  });

  // Đếm tin chưa đọc (người kia gửi, read_at còn null) cho từng conversation
  const unreadCounts = await prisma.messages.groupBy({
    by: ['conversation_id'],
    where: {
      conversation_id: { in: conversations.map((c) => c.id) },
      sender_id: { not: userId },
      read_at: null,
    },
    _count: { id: true },
  });
  const unreadSet = new Set(unreadCounts.map((u) => u.conversation_id));

  return conversations
    .map((c) => {
      const other = c.user1_id === userId ? c.user2 : c.user1;
      const last = c.messages[0];
      return {
        username: other.username,
        name: other.name || other.username,
        avatar: other.avatar_url,
        lastMessage: last?.content ?? '',
        lastMessageAt: last?.created_at ?? c.created_at,
        unread: unreadSet.has(c.id),
      };
    })
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
};

export const searchUsers = async (
  userId: string,
  query: string,
): Promise<ChatUserPreview[]> => {
  const q = query.trim();
  if (!q) return [];
  const users = await prisma.users.findMany({
    where: {
      id: { not: userId },
      OR: [
        { username: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: userPreview,
    take: 10,
  });
  return users.map((u) => ({
    username: u.username,
    name: u.name || u.username,
    avatar: u.avatar_url,
  }));
};

export const getMessages = async (
  userId: string,
  otherUsername: string,
): Promise<{ partner: ChatUserPreview; messages: ChatMessage[] }> => {
  const other = await findOtherUser(otherUsername);
  if (other.id === userId)
    throw new BadRequestError('Không thể tự nhắn tin cho chính mình');

  const [user1_id, user2_id] = pairIds(userId, other.id);
  const conversation = await prisma.conversations.findUnique({
    where: { user1_id_user2_id: { user1_id, user2_id } },
  });

  const partner = {
    username: other.username,
    name: other.name || other.username,
    avatar: other.avatar_url,
  };
  if (!conversation) return { partner, messages: [] };

  // Mở hội thoại = đã đọc hết tin người kia gửi
  await prisma.messages.updateMany({
    where: {
      conversation_id: conversation.id,
      sender_id: other.id,
      read_at: null,
    },
    data: { read_at: new Date() },
  });

  const messages = await prisma.messages.findMany({
    where: { conversation_id: conversation.id },
    orderBy: { created_at: 'asc' },
  });

  return {
    partner,
    messages: messages.map((m) => toChatMessage(m, userId)),
  };
};

export const sendMessage = async (
  userId: string,
  otherUsername: string,
  content: string,
): Promise<ChatMessage> => {
  const conversation = await getOrCreateConversation(userId, otherUsername);

  const message = await prisma.messages.create({
    data: {
      conversation_id: conversation.id,
      sender_id: userId,
      content,
    },
  });

  return toChatMessage(message, userId);
};

export const sendFileMessage = async (
  userId: string,
  otherUsername: string,
  file: Express.Multer.File,
): Promise<ChatMessage> => {
  const conversation = await getOrCreateConversation(userId, otherUsername);
  const uploaded = await uploadChatFile(userId, file);

  // content = tên file để preview ở danh sách hội thoại có nội dung hiển thị
  const message = await prisma.messages.create({
    data: {
      conversation_id: conversation.id,
      sender_id: userId,
      content: uploaded.name,
      file_url: uploaded.url,
      file_name: uploaded.name,
      file_size: uploaded.size,
    },
  });

  return toChatMessage(message, userId);
};
