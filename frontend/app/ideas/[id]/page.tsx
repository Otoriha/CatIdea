'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ideasApi, type Idea } from '@/lib/api/ideas'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { CatLoading } from '@/components/ui/cat-loading'

export default function IdeaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
    } catch (err) {
      setError('アイディアの取得に失敗しました')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('本当にこのアイディアを削除しますか？')) return
    
    setIsDeleting(true)
    try {
      await ideasApi.deleteIdea(Number(params.id))
      router.push('/ideas')
    } catch (err) {
      setError('アイディアの削除に失敗しました')
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      validated: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
    }
    const labels = {
      draft: '草案',
      validated: '検証済み',
      in_progress: '実装中',
      completed: '完了',
    }
    return (
      <span className={`px-3 py-1 text-sm rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <CatLoading />
          </div>
        </div>
      </div>
    )
  }

  if (error && !idea) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
          <Link
            href="/ideas"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            アイディア一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  if (!idea) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/ideas"
            className="text-primary hover:text-primary/80"
          >
            ← アイディア一覧に戻る
          </Link>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-card-foreground mb-2">
                {idea.title}
              </h1>
              <div className="flex items-center gap-4">
                {getStatusBadge(idea.status)}
                <span className="text-muted-foreground">
                  作成日: {new Date(idea.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link
                href={`/ideas/${idea.id}/edit`}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                編集
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '削除'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-3">
              説明
            </h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {idea.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-3">
                評価指標
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">実現可能性</span>
                    <span className="font-medium">{idea.feasibility}/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(idea.feasibility / 5) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">インパクト</span>
                    <span className="font-medium">{idea.impact}/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${(idea.impact / 5) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">優先度スコア</span>
                    <span className="text-xl font-bold text-green-600">
                      {idea.priority_score}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-3">
                元のペインポイント
              </h3>
              <Link
                href={`/pain-points/${idea.pain_point.id}`}
                className="block bg-secondary rounded-lg p-4 hover:bg-secondary/80 transition-colors"
              >
                <h4 className="font-medium text-secondary-foreground mb-2">
                  {idea.pain_point.title}
                </h4>
                {idea.pain_point.description && (
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {idea.pain_point.description}
                  </p>
                )}
                <div className="mt-2 flex gap-4 text-sm">
                  {idea.pain_point.importance && (
                    <span className="text-muted-foreground">
                      重要度: {idea.pain_point.importance}/5
                    </span>
                  )}
                  {idea.pain_point.urgency && (
                    <span className="text-muted-foreground">
                      緊急度: {idea.pain_point.urgency}/5
                    </span>
                  )}
                </div>
              </Link>
              
              {idea.ai_conversation && (
                <div className="mt-4">
                  <Link
                    href={`/pain-points/${idea.pain_point.id}#ai-conversation`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm"
                  >
                    AI対話から生まれたアイディア →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>最終更新: {new Date(idea.updated_at).toLocaleDateString('ja-JP')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}