'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sparkles, Lightbulb, RefreshCw } from 'lucide-react'
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
  currentProcessCount,
  onProcessComplete
}: AiProcessingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreateIdeaModal, setShowCreateIdeaModal] = useState(false)
  
  const remainingProcesses = 3 - currentProcessCount
  const canProcess = remainingProcesses > 0

  const handleAiProcess = async () => {
    if (!canProcess) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await apiClient.post(`/pain_points/${painPointId}/ai_process`, {})
      setProcessedContent(response.data.processed_content)
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

  return (
    <>
      <Dialog open={isOpen && !showCreateIdeaModal} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-5 h-5 text-primary" />
              AI自動処理
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
        </DialogContent>
      </Dialog>

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