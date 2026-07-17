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
