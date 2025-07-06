'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ideasApi, type Idea } from '@/lib/api/ideas'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { CatLoading } from '@/components/ui/cat-loading'

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
      console.warn('🚨 Not logged in, redirecting to login page')
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
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      if (sortBy) params.sort = sortBy
      
      console.log('Fetching ideas with token:', localStorage.getItem('token'))
      const response = await ideasApi.getIdeas(params)
      console.log('Ideas response:', response)
      setIdeas(response.ideas)
    } catch (err: any) {
      console.error('Ideas fetch error:', err)
      console.error('Error response:', err.response)
      setError(`アイディアの取得に失敗しました: ${err.response?.status || 'Unknown error'}`)
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            アイディア一覧
          </h1>
          <p className="text-muted-foreground">
            ペインポイントから昇華されたアイディアを管理
          </p>
        </div>

        {/* フィルター */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-card-foreground"
          >
            <option value="">すべてのステータス</option>
            <option value="draft">草案</option>
            <option value="validated">検証済み</option>
            <option value="in_progress">実装中</option>
            <option value="completed">完了</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-card-foreground"
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
          <div className="bg-card rounded-lg shadow p-8 text-center border border-border">
            <p className="text-muted-foreground mb-4">
              アイディアがまだありません
            </p>
            <Link
              href="/pain-points"
              className="text-primary hover:text-primary/80"
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
                  className="block bg-card rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-border"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-card-foreground mb-2">
                        {idea.title}
                      </h2>
                      <p className="text-muted-foreground line-clamp-2">
                        {idea.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(idea.status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">元のペイン:</span>
                      <span className="text-card-foreground">
                        {idea.pain_point.title}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">実現可能性:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i <= idea.feasibility
                                  ? 'bg-blue-500'
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">インパクト:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i <= idea.impact
                                  ? 'bg-orange-500'
                                  : 'bg-muted'
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