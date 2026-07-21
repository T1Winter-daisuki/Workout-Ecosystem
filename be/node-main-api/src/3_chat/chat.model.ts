// Thông tin rút gọn của 1 user hiển thị trong chat (kết quả tìm kiếm / người đang chat cùng)
export interface ChatUserPreview {
  username: string;
  name: string;
  avatar: string | null;
}

// 1 dòng trong danh sách hội thoại
export interface ConversationPreview extends ChatUserPreview {
  lastMessage: string;
  lastMessageAt: Date;
  unread: boolean;
}

// 1 tin nhắn trả về FE — mine để FE biết căn trái/phải
// Tin nhắn file: fileUrl/fileName/fileSize có giá trị, content = tên file (để preview danh sách)
export interface ChatMessage {
  id: string;
  content: string;
  mine: boolean;
  createdAt: Date;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
}
