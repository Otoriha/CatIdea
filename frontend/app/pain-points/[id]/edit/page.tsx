'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import ProtectedRoute from '@/components/ProtectedRoute'
import DetailedPainPointForm from '@/components/DetailedPainPointForm'

interface PainPoint {
  id: number
  title: string
  description: string
  importance: number
  tags: Array<{ id: number; name: string }>
  created_at: string
  updated_at: string
}

interface PainPointFormData {
  title: string
  situation: string
  inconvenience: string
  impact_scope: string
  tags: string[]
  importance: number
  urgency: number
}

export default function EditPainPointPage() {
  const [painPoint, setPainPoint] = useState<PainPoint | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  // ペインポイントデータの取得
  useEffect(() => {
    const fetchPainPoint = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pain_points/${id}`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setPainPoint(data.pain_point)
        } else {
          setMessage({ type: 'error', text: 'ペインポイントの取得に失敗しました' })
        }
      } catch (error) {
        console.error('Error fetching pain point:', error)
        setMessage({ type: 'error', text: 'ネットワークエラーが発生しました' })
      } finally {
        setIsLoadingData(false)
      }
    }

    if (id) {
      fetchPainPoint()
    }
  }, [id])

  // descriptionからフィールドを分解する関数
  const parseDescription = (description: string) => {
    const sections = description.split('\n\n')
    let situation = ''
    let inconvenience = ''
    let impact_scope = ''

    sections.forEach(section => {
      if (section.startsWith('## 状況\n')) {
        situation = section.replace('## 状況\n', '')
      } else if (section.startsWith('## 感じた不便さ\n')) {
        inconvenience = section.replace('## 感じた不便さ\n', '')
      } else if (section.startsWith('## 影響範囲\n')) {
        impact_scope = section.replace('## 影響範囲\n', '')
      }
    })

    return { situation, inconvenience, impact_scope }
  }

  const getInitialFormData = (): Partial<PainPointFormData> => {
    if (!painPoint) return {}

    const { situation, inconvenience, impact_scope } = parseDescription(painPoint.description)

    return {
      title: painPoint.title,
      situation,
      inconvenience,
      impact_scope,
      tags: painPoint.tags.map(tag => tag.name),
      importance: painPoint.importance,
      urgency: 3 // デフォルト値（既存データにはurgencyがないため）
    }
  }

  const handleSubmit = async (formData: PainPointFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pain_points/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          pain_point: {
            title: formData.title,
            description: `## 状況\n${formData.situation}\n\n## 感じた不便さ\n${formData.inconvenience}${formData.impact_scope ? `\n\n## 影響範囲\n${formData.impact_scope}` : ''}`,
            importance: formData.importance
          },
          tags: formData.tags
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: 'ペインポイントを更新しました' })
        
        // 成功時は詳細ページへリダイレクト
        setTimeout(() => {
          router.push(`/pain-points/${id}`)
        }, 1500)
        
        return { success: true }
      } else {
        const errorData = await response.json()
        setMessage({ 
          type: 'error', 
          text: errorData.message || 'ペインポイントの更新に失敗しました' 
        })
        return { success: false, message: errorData.message }
      }
    } catch (error) {
      console.error('Error updating pain point:', error)
      setMessage({ 
        type: 'error', 
        text: 'ネットワークエラーが発生しました' 
      })
      return { success: false, message: 'ネットワークエラーが発生しました' }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!painPoint) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ペインポイントが見つかりません
              </h1>
              <button
                onClick={() => router.push('/pain-points')}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                一覧に戻る
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ペインポイント編集
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ペインポイントの内容を更新してください。
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <DetailedPainPointForm 
              initialData={getInitialFormData()}
              onSubmit={handleSubmit}
              isEditing={true}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}