'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import Header from '@/components/Header'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { FAB } from '@/components/ui/fab'
import { CatLoading } from '@/components/ui/cat-loading'

interface Tag {
  id: number
  name: string
}

interface PainPoint {
  id: number
  title: string
  description?: string
  importance: number
  urgency: number
  tags: Tag[]
  created_at: string
  updated_at: string
}

interface PaginationInfo {
  current_page: number
  per_page: number
  total_count: number
  total_pages: number
}

export default function PainPointsPage() {
  const router = useRouter()
  const [painPoints, setPainPoints] = useState<PainPoint[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    per_page: 10,
    total_count: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [importanceFilter, setImportanceFilter] = useState<string>('')
  const [urgencyFilter, setUrgencyFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState('created_at_desc')

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const fetchPainPoints = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        sort: sortBy
      }

      if (debouncedSearchQuery) params.q = debouncedSearchQuery
      if (selectedTags.length > 0) params.tag_ids = selectedTags.join(',')
      if (importanceFilter && importanceFilter !== 'all') params.importance = importanceFilter
      if (urgencyFilter && urgencyFilter !== 'all') params.urgency = urgencyFilter

      const response = await apiClient.get('/pain_points', { params })
      setPainPoints(response.data.pain_points)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to fetch pain points:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.current_page, pagination.per_page, sortBy, debouncedSearchQuery, importanceFilter, urgencyFilter])


  useEffect(() => {
    fetchPainPoints()
  }, [fetchPainPoints])


  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, current_page: newPage }))
  }

  const getImportanceColor = (importance: number) => {
    if (importance >= 4) return 'destructive'
    if (importance >= 3) return 'warning'
    return 'secondary'
  }

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 4) return 'destructive'
    if (urgency >= 3) return 'warning'
    return 'secondary'
  }

  if (loading && painPoints.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center min-h-[60vh]">
              <CatLoading />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ペインポイント一覧</h1>
        <Link href="/pain-points/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新規作成
          </Button>
        </Link>
      </div>

      {/* 検索・フィルタセクション */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="キーワードで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at_desc">作成日（新しい順）</SelectItem>
              <SelectItem value="created_at_asc">作成日（古い順）</SelectItem>
              <SelectItem value="importance_desc">重要度（高い順）</SelectItem>
              <SelectItem value="importance_asc">重要度（低い順）</SelectItem>
              <SelectItem value="urgency_desc">緊急度（高い順）</SelectItem>
              <SelectItem value="urgency_asc">緊急度（低い順）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Filter className="text-gray-400 w-4 h-4 hidden sm:block" />
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Select value={importanceFilter} onValueChange={setImportanceFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="重要度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="5">非常に高い</SelectItem>
                <SelectItem value="4">高い</SelectItem>
                <SelectItem value="3">中</SelectItem>
                <SelectItem value="2">低い</SelectItem>
                <SelectItem value="1">非常に低い</SelectItem>
              </SelectContent>
            </Select>

            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="緊急度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="5">非常に高い</SelectItem>
                <SelectItem value="4">高い</SelectItem>
                <SelectItem value="3">中</SelectItem>
                <SelectItem value="2">低い</SelectItem>
                <SelectItem value="1">非常に低い</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ペインポイント一覧 */}
      <div className="space-y-4 mb-8">
        {painPoints.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">ペインポイントが見つかりませんでした</p>
            </CardContent>
          </Card>
        ) : (
          painPoints.map((painPoint) => (
            <Card
              key={painPoint.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/pain-points/${painPoint.id}`)}
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <CardTitle className="text-lg sm:text-xl">{painPoint.title}</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={getImportanceColor(painPoint.importance)}>
                      重要度: {painPoint.importance}
                    </Badge>
                    <Badge variant={getUrgencyColor(painPoint.urgency)}>
                      緊急度: {painPoint.urgency}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {painPoint.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{painPoint.description}</p>
                )}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <div className="flex gap-2 flex-wrap">
                    {painPoint.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {new Date(painPoint.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ページネーション */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            前へ
          </Button>
          <span className="text-sm text-gray-600">
            {pagination.current_page} / {pagination.total_pages} ページ
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.total_pages}
          >
            次へ
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
        </div>
        
        {/* FAB for creating new pain point */}
        <FAB 
          onClick={() => router.push('/pain-points/new')}
          aria-label="新規ペインポイント作成"
        >
          <Plus className="h-6 w-6" />
        </FAB>
      </div>
    </ProtectedRoute>
  )
}