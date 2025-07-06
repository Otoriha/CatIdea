'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import ProtectedRoute from '@/components/ProtectedRoute'
import DetailedPainPointForm from '@/components/DetailedPainPointForm'

interface PainPointFormData {
  title: string
  situation: string
  inconvenience: string
  impact_scope: string
  tags: string[]
  importance: number
  urgency: number
}

export default function NewPainPointPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (formData: PainPointFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pain_points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          pain_point: {
            title: formData.title,
            description: `## 状況\n${formData.situation}\n\n## 感じた不便さ\n${formData.inconvenience}${formData.impact_scope ? `\n\n## 影響範囲\n${formData.impact_scope}` : ''}`,
            importance: formData.importance,
            urgency: formData.urgency
          },
          tags: formData.tags
        }),
      })

      if (response.ok) {
        await response.json()
        setMessage({ type: 'success', text: 'ペインポイントを保存しました' })
        
        // 成功時は一覧ページへリダイレクト
        setTimeout(() => {
          router.push('/pain-points')
        }, 1500)
        
        return { success: true }
      } else {
        const errorData = await response.json()
        setMessage({ 
          type: 'error', 
          text: errorData.message || 'ペインポイントの保存に失敗しました' 
        })
        return { success: false, message: errorData.message }
      }
    } catch (error) {
      console.error('Error creating pain point:', error)
      setMessage({ 
        type: 'error', 
        text: 'ネットワークエラーが発生しました' 
      })
      return { success: false, message: 'ネットワークエラーが発生しました' }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              ペインポイント詳細登録
            </h1>
            <p className="text-muted-foreground">
              感じた課題や不便さを詳しく記録して、後でアイデアに発展させましょう。
            </p>
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800'
            }`}>
              <div className={`text-sm ${
                message.type === 'success' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {message.text}
              </div>
            </div>
          )}

          {/* フォーム */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <DetailedPainPointForm 
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}