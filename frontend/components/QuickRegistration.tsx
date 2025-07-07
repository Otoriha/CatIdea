'use client'

import { useState, FormEvent, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/contexts/ToastContext'

interface QuickRegistrationProps {
  onSuccess?: () => void
}

export default function QuickRegistration({ onSuccess }: QuickRegistrationProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()
    
    if (!content.trim()) return
    
    setIsLoading(true)
    setMessage(null)
    
    try {
      const response = await apiClient.post('/pain_points/quick', {
        content: content.trim()
      })
      
      setContent('')
      setMessage({ type: 'success', text: 'ペインポイントを登録しました' })
      onSuccess?.()
      
      // トースト通知を表示
      showToast('ペインポイントを登録しました！ペインポイント一覧で確認できます。', 'success')
      
      // 3秒後にペインポイント一覧へ誘導
      setTimeout(() => {
        router.push('/pain-points')
      }, 3000)
      
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: 'error', text: '登録に失敗しました' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="今感じている課題を入力してください..."
          className="w-full px-4 py-3 rounded-lg border border-border bg-card text-card-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-base md:text-sm"
          disabled={isLoading}
          autoComplete="off"
          enterKeyHint="send"
        />
      </form>
      
      {message && (
        <div className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'} animate-fade-in`}>
          {message.text}
        </div>
      )}
    </div>
  )
}