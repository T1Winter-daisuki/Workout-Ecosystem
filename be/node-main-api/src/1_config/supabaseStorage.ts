import 'dotenv/config';
import ws from 'ws';
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.SUPABASE_URL ?? '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');

// Node 20 chưa có WebSocket global — supabase-js cần truyền transport thủ công,
// nếu không sẽ throw ngay khi createClient() và làm sập cả server lúc import.
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws as any } },
);

export const AVATAR_BUCKET = 'avatars';

export const uploadAvatar = async (
  userId: string,
  file: Express.Multer.File,
): Promise<string> => {
  const ext = file.originalname.split('.').pop() || 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(AVATAR_BUCKET)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) throw new Error(`Upload avatar thất bại: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
};

export const CHAT_BUCKET = 'chat-files';

// Tên file giữ nguyên để hiển thị, nhưng path trên bucket thêm timestamp
// tránh 2 file trùng tên ghi đè nhau
export const uploadChatFile = async (
  userId: string,
  file: Express.Multer.File,
): Promise<{ url: string; name: string; size: number }> => {
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${Date.now()}_${safeName}`;

  const { error } = await supabaseAdmin.storage
    .from(CHAT_BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error(`Upload file thất bại: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(CHAT_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, name: file.originalname, size: file.size };
};
