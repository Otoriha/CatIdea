'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ideasApi, type Idea, type UpdateIdeaInput } from '@/lib/api/ideas'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

export default function EditIdeaPage() {
  const params = useParams()
  const router = useRouter()
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    feasibility: 3,
    impact: 3,
    status: 'draft' as 'draft' | 'validated' | 'in_progress' | 'completed',
  })

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login')
    }
  }, [authLoading, isLoggedIn, router])

  useEffect(() => {
    if (isLoggedIn && params.id) {
      fetchIdea()
    }
  }, [isLoggedIn, params.id])

  const fetchIdea = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await ideasApi.getIdea(Number(params.id))
      setIdea(response.idea)
      setFormData({
        title: response.idea.title,
        description: response.idea.description,
        feasibility: response.idea.feasibility,
        impact: response.idea.impact,
        status: response.idea.status,
      })
    } catch (err) {
      setError('アイディアの取得に失敗しました')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const updateData: UpdateIdeaInput = {
        title: formData.title,
        description: formData.description,
        feasibility: formData.feasibility,
        impact: formData.impact,
        status: formData.status,
      }
      
      await ideasApi.updateIdea(Number(params.id), updateData)
      router.push(`/ideas/${params.id}`)
    } catch (err) {
      setError('アイディアの更新に失敗しました')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-8 w-1/3"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!idea) return null

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href={`/ideas/${params.id}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            ← アイディア詳細に戻る
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            アイディアを編集
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="アイディアのタイトル"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                説明 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="アイディアの詳細な説明"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="feasibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  実現可能性 ({formData.feasibility}/5)
                </label>
                <input
                  type="range"
                  id="feasibility"
                  min="1"
                  max="5"
                  value={formData.feasibility}
                  onChange={(e) => setFormData({ ...formData, feasibility: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>低い</span>
                  <span>高い</span>
                </div>
              </div>

              <div>
                <label htmlFor="impact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  インパクト ({formData.impact}/5)
                </label>
                <input
                  type="range"
                  id="impact"
                  min="1"
                  max="5"
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>小さい</span>
                  <span>大きい</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ステータス
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="draft">草案</option>
                <option value="validated">検証済み</option>
                <option value="in_progress">実装中</option>
                <option value="completed">完了</option>
              </select>
            </div>

            <div className="pt-4 border-t">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  元のペインポイント
                </h3>
                <Link
                  href={`/pain-points/${idea.pain_point.id}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  {idea.pain_point.title} →
                </Link>
              </div>

              <div className="flex gap-4 justify-end">
                <Link
                  href={`/ideas/${params.id}`}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}