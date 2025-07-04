'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ideasApi, type Idea } from '@/lib/api/ideas'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

export default function IdeasPage() {
  const router = useRouter()
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'feasibility' | ''>('')

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login')
    }
  }, [authLoading, isLoggedIn, router])

  useEffect(() => {
    if (isLoggedIn) {
      fetchIdeas()
    }
  }, [isLoggedIn, statusFilter, sortBy])

  const fetchIdeas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: any = {}
      if (statusFilter) params.status = statusFilter
      if (sortBy) params.sort = sortBy
      
      const response = await ideasApi.getIdeas(params)
      setIdeas(response.ideas)
    } catch (err) {
      setError('アイディアの取得に失敗しました')
      console.error(err)
    } finally {
      setIsLoading(false)
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
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getImpactFeasibilityMatrix = (impact: number, feasibility: number) => {
    const score = impact * feasibility
    if (score >= 20) return { color: 'text-green-600', label: '最優先' }
    if (score >= 12) return { color: 'text-yellow-600', label: '優先' }
    return { color: 'text-gray-600', label: '検討' }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            アイディア一覧
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            ペインポイントから昇華されたアイディアを管理
          </p>
        </div>

        {/* フィルター */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">すべてのステータス</option>
            <option value="draft">草案</option>
            <option value="validated">検証済み</option>
            <option value="in_progress">実装中</option>
            <option value="completed">完了</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">作成日順</option>
            <option value="priority">優先度順</option>
            <option value="impact">インパクト順</option>
            <option value="feasibility">実現可能性順</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {ideas.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              アイディアがまだありません
            </p>
            <Link
              href="/pain-points"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              ペインポイント一覧へ移動して、アイディアに昇華してみましょう
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {ideas.map((idea) => {
              const matrix = getImpactFeasibilityMatrix(idea.impact, idea.feasibility)
              
              return (
                <Link
                  key={idea.id}
                  href={`/ideas/${idea.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {idea.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                        {idea.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(idea.status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">元のペイン:</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {idea.pain_point.title}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">実現可能性:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i <= idea.feasibility
                                  ? 'bg-blue-500'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">インパクト:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i <= idea.impact
                                  ? 'bg-orange-500'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className={`font-medium ${matrix.color}`}>
                        {matrix.label}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}