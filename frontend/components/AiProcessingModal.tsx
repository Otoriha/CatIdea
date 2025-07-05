'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Lightbulb, RefreshCw, X } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { CatLoading } from '@/components/ui/cat-loading'
import CreateIdeaModal from '@/components/CreateIdeaModal'

interface AiProcessingModalProps {
  isOpen: boolean
  onClose: () => void
  painPointId: number
  painPointTitle: string
  currentProcessCount: number
  onProcessComplete?: () => void
}

interface ProcessedContent {
  id: string
  content: string
  analysis: {
    problem_definition: string
    target_users: string
    solution_approach: string
    expected_impact: string
  }
  created_at: string
}

export default function AiProcessingModal({
  isOpen,
  onClose,
  painPointId,
  painPointTitle,
  currentProcessCount: propProcessCount,
  onProcessComplete
}: AiProcessingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreateIdeaModal, setShowCreateIdeaModal] = useState(false)
  const [localProcessCount, setLocalProcessCount] = useState(0)
  
  // localStorageから処理回数を読み込む
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = `ai_process_count_${painPointId}`
      const savedCount = localStorage.getItem(storageKey)
      const count = savedCount ? parseInt(savedCount, 10) : 0
      setLocalProcessCount(count)
    }
  }, [painPointId])
  
  const currentProcessCount = Math.max(propProcessCount, localProcessCount)
  const remainingProcesses = 3 - currentProcessCount
  const canProcess = remainingProcesses > 0

  const handleAiProcess = async () => {
    if (!canProcess) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // AI会話を作成
      const conversationResponse = await apiClient.post(`/pain_points/${painPointId}/ai_conversations`, {})
      const conversationId = conversationResponse.data.id
      
      // AI処理用のプロンプトを送信
      const prompt = `このペインポイントを分析して、以下の4つの観点で構造化してください：

1. 問題の定義：このペインポイントが示す本質的な問題は何か
2. 対象ユーザー：この問題に直面している具体的なユーザー層
3. 解決アプローチ：考えられる解決策やアプローチ
4. 期待される効果：解決によってもたらされる価値や効果

簡潔に、各項目2-3文でまとめてください。`

      const messageResponse = await apiClient.post(`/ai_conversations/${conversationId}/messages`, {
        content: prompt
      })
      
      // レスポンスを処理
      const aiResponse = messageResponse.data.message
      const analysisText = aiResponse.content
      
      // テキストを解析して構造化
      const sections = analysisText.split(/\d\.\s+/).filter(s => s.trim())
      const analysis = {
        problem_definition: sections[0]?.split('：')[1]?.trim() || sections[0]?.trim() || '',
        target_users: sections[1]?.split('：')[1]?.trim() || sections[1]?.trim() || '',
        solution_approach: sections[2]?.split('：')[1]?.trim() || sections[2]?.trim() || '',
        expected_impact: sections[3]?.split('：')[1]?.trim() || sections[3]?.trim() || ''
      }
      
      setProcessedContent({
        id: conversationId,
        content: analysisText,
        analysis,
        created_at: new Date().toISOString()
      })
      
      // 処理回数を更新
      const newCount = currentProcessCount + 1
      const storageKey = `ai_process_count_${painPointId}`
      localStorage.setItem(storageKey, newCount.toString())
      setLocalProcessCount(newCount)
      
      onProcessComplete?.()
    } catch (error: any) {
      console.error('AI processing error:', error)
      if (error.response?.status === 429) {
        setError('このペインポイントのAI処理回数が上限（3回）に達しました')
      } else {
        setError('AI処理中にエラーが発生しました')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateIdea = () => {
    setShowCreateIdeaModal(true)
  }

  const handleReprocess = () => {
    setProcessedContent(null)
    handleAiProcess()
  }

  useEffect(() => {
    if (isOpen && !processedContent && canProcess) {
      handleAiProcess()
    }
  }, [isOpen])

  if (!isOpen || showCreateIdeaModal) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-card-foreground">
                AI自動処理
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* 処理回数情報 */}
            <div className="bg-secondary/20 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                AI処理回数: <span className="font-semibold text-foreground">{currentProcessCount}/3回</span>
                {remainingProcesses > 0 && (
                  <span className="ml-2">（残り{remainingProcesses}回）</span>
                )}
              </p>
            </div>

            {isProcessing ? (
              <div className="py-8">
                <CatLoading />
                <p className="text-center mt-4 text-muted-foreground">
                  AIがペインポイントを分析しています...
                </p>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg">
                {error}
              </div>
            ) : processedContent ? (
              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="font-semibold text-card-foreground mb-3">AI分析結果</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        問題の定義
                      </h4>
                      <p className="text-foreground">
                        {processedContent.analysis.problem_definition}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        対象ユーザー
                      </h4>
                      <p className="text-foreground">
                        {processedContent.analysis.target_users}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        解決アプローチ
                      </h4>
                      <p className="text-foreground">
                        {processedContent.analysis.solution_approach}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        期待される効果
                      </h4>
                      <p className="text-foreground">
                        {processedContent.analysis.expected_impact}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-border text-secondary-foreground rounded-lg hover:bg-secondary hover:text-secondary-foreground transition-colors"
                  >
                    閉じる
                  </button>
                  
                  {canProcess && (
                    <button
                      onClick={handleReprocess}
                      className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      再処理
                    </button>
                  )}
                  
                  <button
                    onClick={handleCreateIdea}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    アイディアに昇華
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showCreateIdeaModal && (
        <CreateIdeaModal
          painPointId={painPointId}
          painPointTitle={painPointTitle}
          aiProcessedContent={processedContent}
          isOpen={showCreateIdeaModal}
          onClose={() => {
            setShowCreateIdeaModal(false)
            onClose()
          }}
        />
      )}
    </>
  )
}