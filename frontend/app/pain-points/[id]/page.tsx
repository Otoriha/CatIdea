'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import Header from '@/components/Header'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Trash2, MessageSquare, X } from 'lucide-react'
import ChatContainer from '@/components/chat/ChatContainer'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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
  images: string[]
  created_at: string
  updated_at: string
}

export default function PainPointDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [painPoint, setPainPoint] = useState<PainPoint | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const resolvedParams = use(params)
  const id = resolvedParams.id

  useEffect(() => {
    fetchPainPoint()
  }, [id])

  const fetchPainPoint = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/pain_points/${id}`)
      setPainPoint(response.data.pain_point)
    } catch (error) {
      console.error('Failed to fetch pain point:', error)
      router.push('/pain-points')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/pain_points/${id}`)
      router.push('/pain-points')
    } catch (error) {
      console.error('Failed to delete pain point:', error)
    }
  }

  const handleStartConversation = async () => {
    try {
      const response = await apiClient.post(`/pain_points/${id}/ai_conversations`)
      setConversationId(response.data.id)
      setShowChat(true)
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }

  const getImportanceLabel = (importance: number) => {
    const labels = ['非常に低い', '低い', '中', '高い', '非常に高い']
    return labels[importance - 1] || '中'
  }

  const getUrgencyLabel = (urgency: number) => {
    const labels = ['非常に低い', '低い', '中', '高い', '非常に高い']
    return labels[urgency - 1] || '中'
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">読み込み中...</div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!painPoint) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/pain-points')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          一覧に戻る
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/pain-points/${id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            編集
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は元に戻せません。ペインポイントとそれに関連する会話履歴も削除されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{painPoint.title}</CardTitle>
            <div className="flex gap-2">
              <Badge variant={getImportanceColor(painPoint.importance)}>
                重要度: {getImportanceLabel(painPoint.importance)}
              </Badge>
              <Badge variant={getUrgencyColor(painPoint.urgency)}>
                緊急度: {getUrgencyLabel(painPoint.urgency)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {painPoint.description && (
            <div>
              <h3 className="font-semibold mb-2">説明</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{painPoint.description}</p>
            </div>
          )}

          {painPoint.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">タグ</h3>
              <div className="flex gap-2">
                {painPoint.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {painPoint.images.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">画像</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {painPoint.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Pain point image ${index + 1}`}
                    className="rounded-lg border"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between text-sm text-gray-500">
            <span>作成日: {new Date(painPoint.created_at).toLocaleString('ja-JP')}</span>
            <span>更新日: {new Date(painPoint.updated_at).toLocaleString('ja-JP')}</span>
          </div>
        </CardContent>
      </Card>

      {!showChat && (
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={handleStartConversation}>
            <MessageSquare className="w-5 h-5 mr-2" />
            AIと会話を開始
          </Button>
        </div>
      )}

      {showChat && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">AI アシスタント</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-[600px]">
            <ChatContainer
              painPointId={id}
              conversationId={conversationId || undefined}
            />
          </div>
        </div>
      )}
        </div>
      </div>
    </ProtectedRoute>
  )
}