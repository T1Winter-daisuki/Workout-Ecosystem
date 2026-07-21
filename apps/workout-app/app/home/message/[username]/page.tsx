'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { apiFetch } from '@/lib/apiClient'

interface Partner {
  username: string
  name: string
  avatar?: string | null
}

interface Message {
  id: string
  content: string
  mine: boolean
  createdAt: string
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
}

// Hôm nay: giờ (8:03 am) — khác ngày: dd/mm
function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  if (sameDay) {
    return d
      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      .toLowerCase()
  }
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Tách link http(s) ra khỏi nội dung để gạch chân riêng, phần chữ còn lại giữ nguyên
function renderWithLinks(text: string) {
  const parts = text.split(/(https?:\/\/\S+)/g)
  return parts.map((part, i) =>
    /^https?:\/\//i.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline break-all"
        style={{ color: 'inherit' }}
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function isImageFile(fileName: string) {
  return /\.(jpe?g|png|webp|gif)$/i.test(fileName)
}

export default function MessageThreadPage() {
  const router = useRouter()
  const { username } = useParams<{ username: string }>()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadMessages = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/chat/messages/${username}`)
      if (!res.ok) return
      const data = await res.json()
      setPartner(data.partner)
      setMessages(data.messages)
    } catch {}
  }, [username])

  // Lần đầu + polling 4s/lần để nhận tin mới
  useEffect(() => {
    loadMessages()
    const timer = setInterval(loadMessages, 4000)
    return () => clearInterval(timer)
  }, [loadMessages])

  // Có tin mới thì cuộn xuống đáy
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length])

  const handleSend = async () => {
    const content = input.trim()
    if (!content || sending) return
    setSending(true)
    try {
      const res = await apiFetch(`/api/chat/messages/${username}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages((prev) => [...prev, msg])
        setInput('')
      }
    } finally {
      setSending(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || uploading) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiFetch(`/api/chat/messages/${username}/file`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages((prev) => [...prev, msg])
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="m-3 flex flex-col rounded-2xl overflow-hidden"
      style={{ height: 'calc(100svh - 105px - 111px - 24px)' }}
    >
      {/* Sub header */}
      <div className="relative flex items-center justify-center px-4 py-3 flex-shrink-0" style={{ backgroundColor: '#f6c9cf' }}>
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#980422" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
            style={{ border: '2px solid #980422' }}
          >
            {partner?.avatar ? (
              <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#eec9cf' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#980422" strokeWidth="2"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#980422" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>
          <span className="font-bold" style={{ color: '#980422' }}>
            {partner?.name ?? username}
          </span>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid rgba(152,4,34,0.3)' }} />

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3"
        style={{
          backgroundColor: '#f6c9cf',
          scrollbarWidth: 'none',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex flex-col"
            style={{ alignItems: msg.mine ? 'flex-end' : 'flex-start' }}
          >
            <div
              className={msg.fileUrl && msg.fileName && isImageFile(msg.fileName) ? 'max-w-[75%]' : 'px-4 py-2 max-w-[75%] break-words'}
              style={{
                backgroundColor: msg.fileUrl && msg.fileName && isImageFile(msg.fileName) ? 'transparent' : msg.mine ? '#980422' : '#e39ba5',
                color: msg.mine ? '#ffffff' : '#0d294d',
                borderRadius: '16px',
              }}
            >
              {msg.fileUrl && msg.fileName && isImageFile(msg.fileName) ? (
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={msg.fileUrl}
                    alt={msg.fileName}
                    className="max-w-full max-h-64 object-cover"
                    style={{ borderRadius: '16px' }}
                    onLoad={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })}
                  />
                </a>
              ) : msg.fileUrl ? (
                <a
                  href={msg.fileUrl}
                  download={msg.fileName ?? true}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                  style={{ color: 'inherit' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{msg.fileName}</p>
                    {msg.fileSize != null && (
                      <p className="text-xs opacity-80">{formatSize(msg.fileSize)}</p>
                    )}
                  </div>
                </a>
              ) : (
                <p className="text-sm">{renderWithLinks(msg.content)}</p>
              )}
            </div>
            <span className="text-xs mt-1 px-1" style={{ color: '#0d294d' }}>
              {formatTime(msg.createdAt)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ borderBottom: '1px solid rgba(152,4,34,0.3)' }} />

      {/* Input bar */}
      <div className="flex items-center gap-2 px-3 py-3 flex-shrink-0" style={{ backgroundColor: '#f6c9cf' }}>
        <label
          className="cursor-pointer transition-opacity hover:opacity-70"
          style={{ opacity: uploading ? 0.4 : undefined }}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="#980422" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </label>

        <label
          className="cursor-pointer transition-opacity hover:opacity-70"
          style={{ opacity: uploading ? 0.4 : undefined }}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="#980422" strokeWidth="2"/>
            <circle cx="8.5" cy="9.5" r="1.5" stroke="#980422" strokeWidth="2"/>
            <path d="M21 16l-5.5-5.5a1 1 0 0 0-1.4 0L6 19" stroke="#980422" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </label>

        <input
          type="text"
          placeholder="Nhập..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2 italic outline-none"
          style={{
            backgroundColor: '#eaa8b1',
            borderRadius: '999px',
            color: '#5a1420',
          }}
        />

        <button
          onClick={handleSend}
          disabled={sending}
          className="transition-opacity hover:opacity-70 disabled:opacity-40"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#980422">
            <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
