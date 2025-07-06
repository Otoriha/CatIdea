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
  painPointDescription?: string
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
  painPointDescription,
  currentProcessCount: propProcessCount,
  onProcessComplete
}: AiProcessingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreateIdeaModal, setShowCreateIdeaModal] = useState(false)
  const [localProcessCount, setLocalProcessCount] = useState(0)
  const [, forceUpdate] = useState(0)
  
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
      // AI会話を作成（自動処理用なので初期質問は不要）
      console.log('Creating AI conversation for pain point:', painPointId)
      const conversationResponse = await apiClient.post(`/pain_points/${painPointId}/ai_conversations`, {
        skip_initial_questions: true
      })
      console.log('Conversation response:', conversationResponse)
      console.log('Conversation data:', conversationResponse.data)
      
      // 既存の会話がある場合もあるので、statusを確認
      if (conversationResponse.status === 200) {
        console.log('Using existing conversation')
      } else if (conversationResponse.status === 201) {
        console.log('Created new conversation')
      }
      
      const conversationId = conversationResponse.data.id
      const conversationStatus = conversationResponse.data.status
      
      // 会話のステータスを確認
      if (conversationStatus && conversationStatus !== 'active') {
        console.warn('Conversation is not active:', conversationStatus)
        // エラーステータスの場合でも続行（バックエンドで処理される）
      }
      
      // 少し待ってからメッセージを送信（会話が初期化されるのを待つ）
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // AI処理用のプロンプトを送信（ペインポイントの内容を含める）
      const prompt = `以下のペインポイントを分析して、4つの観点で構造化してください：

【ペインポイント】
タイトル: ${painPointTitle}
${painPointDescription ? `説明: ${painPointDescription}` : ''}

【分析の観点】
1. 問題の定義：このペインポイントが示す本質的な問題は何か
2. 対象ユーザー：この問題に直面している具体的なユーザー層
3. 解決アプローチ：考えられる解決策やアプローチ
4. 期待される効果：解決によってもたらされる価値や効果

簡潔に、各項目2-3文でまとめてください。`

      console.log('Sending message to AI with prompt:', prompt)
      
      try {
        // メッセージを送信（messageパラメータにラップする）
        const messageResponse = await apiClient.post(`/ai_conversations/${conversationId}/messages`, {
          message: {
            content: prompt
          }
        })
        
        console.log('Message send response:', messageResponse.data)
      } catch (messageError: any) {
        console.error('Failed to send message:', messageError)
        console.error('Error response:', messageError.response?.data)
        console.error('Error status:', messageError.response?.status)
        
        // 会話がアクティブでない場合は、新しい会話を作成する必要がある
        if (messageError.response?.status === 422 && messageError.response?.data?.error?.includes('not active')) {
          throw new Error('会話がアクティブではありません。モーダルを閉じて再度開いてください。')
        }
        
        throw new Error('メッセージの送信に失敗しました: ' + (messageError.response?.data?.error || messageError.message))
      }
      
      // AIの応答をポーリングで確認（最大30秒）
      let analysisText = ''
      let aiMessage = null
      const maxRetries = 6
      const retryInterval = 5000 // 5秒ごと
      
      for (let i = 0; i < maxRetries; i++) {
        await new Promise(resolve => setTimeout(resolve, retryInterval))
        
        // 会話の詳細を取得してAIの応答を確認
        const conversationDetailResponse = await apiClient.get(`/ai_conversations/${conversationId}`)
        console.log(`Attempt ${i + 1}: Conversation detail response:`, conversationDetailResponse.data)
        
        // APIレスポンスの構造に従ってmessagesを取得
        const conversationData = conversationDetailResponse.data
        const messages = conversationData.messages || []
        
        console.log('Messages:', messages)
        console.log('Messages length:', messages.length)
        
        // デバッグ用：毎回の試行で詳細を確認
        console.log(`Attempt ${i + 1} - Full response:`, {
          status: conversationDetailResponse.status,
          data: conversationData,
          messagesLength: messages.length,
          messagesPreview: messages.map((m: any) => ({
            id: m.id,
            sender_type: m.sender_type,
            contentLength: m.content?.length || 0,
            contentPreview: m.content?.substring(0, 50) + '...'
          }))
        })
        
        // 最新のAIメッセージを探す（sender_typeで判定）
        const aiMessages = messages.filter((msg: any) => msg.sender_type === 'ai')
        console.log('AI messages found:', aiMessages.length)
        
        if (aiMessages.length > 0) {
          aiMessage = aiMessages[aiMessages.length - 1] // 最後のAIメッセージを取得
          analysisText = aiMessage?.content || ''
          
          if (analysisText) {
            console.log('AI message found:', aiMessage)
            console.log('Analysis text:', analysisText)
            break // AIの応答が見つかったらループを抜ける
          }
        }
        
        console.log(`Attempt ${i + 1}: No AI response yet, retrying...`)
      }
      
      // AIメッセージが見つからない場合のフォールバック
      if (!analysisText) {
        console.error('No AI response found after all retries')
        throw new Error('AIからの応答を取得できませんでした。もう一度お試しください。')
      }
      
      // テキストを解析して構造化
      const analysis = {
        problem_definition: '',
        target_users: '',
        solution_approach: '',
        expected_impact: ''
      }
      
      if (analysisText) {
        console.log('Raw analysis text:', analysisText)
        
        // 各セクションを抽出
        const problemMatch = analysisText.match(/1\.\s*問題の定義[：:]\s*(.+?)(?=\n2\.|$)/s)
        const targetMatch = analysisText.match(/2\.\s*対象ユーザー[：:]\s*(.+?)(?=\n3\.|$)/s)
        const solutionMatch = analysisText.match(/3\.\s*解決アプローチ[：:]\s*(.+?)(?=\n4\.|$)/s)
        const impactMatch = analysisText.match(/4\.\s*期待される効果[：:]\s*(.+?)$/s)
        
        console.log('Regex matches:', {
          problemMatch: problemMatch?.[0],
          targetMatch: targetMatch?.[0],
          solutionMatch: solutionMatch?.[0],
          impactMatch: impactMatch?.[0]
        })
        
        analysis.problem_definition = problemMatch?.[1]?.trim() || ''
        analysis.target_users = targetMatch?.[1]?.trim() || ''
        analysis.solution_approach = solutionMatch?.[1]?.trim() || ''
        analysis.expected_impact = impactMatch?.[1]?.trim() || ''
        
        console.log('Parsed analysis:', analysis)
        
        // パースが失敗した場合のフォールバック
        if (!analysis.problem_definition && !analysis.target_users && !analysis.solution_approach && !analysis.expected_impact) {
          console.warn('Regex parsing failed, using simple split approach')
          
          // シンプルな分割アプローチ
          const lines = analysisText.split('\n')
          let currentSection = ''
          let currentContent = ''
          
          for (const line of lines) {
            if (line.match(/^1\.\s*問題の定義/)) {
              currentSection = 'problem_definition'
              currentContent = line.replace(/^1\.\s*問題の定義[：:]?\s*/, '')
            } else if (line.match(/^2\.\s*対象ユーザー/)) {
              if (currentSection === 'problem_definition') analysis.problem_definition = currentContent.trim()
              currentSection = 'target_users'
              currentContent = line.replace(/^2\.\s*対象ユーザー[：:]?\s*/, '')
            } else if (line.match(/^3\.\s*解決アプローチ/)) {
              if (currentSection === 'target_users') analysis.target_users = currentContent.trim()
              currentSection = 'solution_approach'
              currentContent = line.replace(/^3\.\s*解決アプローチ[：:]?\s*/, '')
            } else if (line.match(/^4\.\s*期待される効果/)) {
              if (currentSection === 'solution_approach') analysis.solution_approach = currentContent.trim()
              currentSection = 'expected_impact'
              currentContent = line.replace(/^4\.\s*期待される効果[：:]?\s*/, '')
            } else if (currentSection) {
              currentContent += ' ' + line
            }
          }
          
          // 最後のセクションを保存
          if (currentSection === 'expected_impact') {
            analysis.expected_impact = currentContent.trim()
          }
          
          console.log('Fallback parsed analysis:', analysis)
        }
      }
      
      const processedData = {
        id: conversationId,
        content: analysisText,
        analysis,
        created_at: new Date().toISOString()
      }
      
      console.log('Setting processed content:', processedData)
      console.log('processedData.analysis details:', JSON.stringify(processedData.analysis, null, 2))
      
      // 処理回数を更新
      const newCount = currentProcessCount + 1
      const storageKey = `ai_process_count_${painPointId}`
      localStorage.setItem(storageKey, newCount.toString())
      setLocalProcessCount(newCount)
      
      // 状態を更新
      console.log('About to set processedContent with:', processedData)
      
      setIsProcessing(false)
      setProcessedContent(processedData)
      
      // 強制的に再レンダリング
      forceUpdate(prev => prev + 1)
      
      onProcessComplete?.()
    } catch (error: any) {
      console.error('AI processing error:', error)
      console.error('Error response:', error.response?.data)
      
      if (error.response?.status === 429) {
        setError('このペインポイントのAI処理回数が上限（3回）に達しました')
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.error || 'リクエストが無効です')
      } else {
        setError('AI処理中にエラーが発生しました')
      }
      setIsProcessing(false)  // エラー時のみここでisProcessingをfalseにする
    }
  }

  const handleCreateIdea = () => {
    setShowCreateIdeaModal(true)
  }

  const handleReprocess = () => {
    setProcessedContent(null)
    handleAiProcess()
  }
  
  const handleCloseModal = () => {
    // モーダルを閉じる際に状態をリセット
    setProcessedContent(null)
    setError(null)
    setIsProcessing(false)
    setShowCreateIdeaModal(false)
    onClose()
  }
  
  const handleResetConversation = async () => {
    // 会話をリセット（削除して再作成）
    try {
      // 既存の会話を削除する処理を追加する場合はここに
      console.log('Resetting conversation for pain point:', painPointId)
      setError(null)
      setProcessedContent(null)
      // 再度処理を開始
      handleAiProcess()
    } catch (error) {
      console.error('Failed to reset conversation:', error)
    }
  }

  // モーダルが開いたときに自動で処理しない（明示的なボタンクリックでのみ処理）
  // useEffect(() => {
  //   if (isOpen && !processedContent && canProcess) {
  //     handleAiProcess()
  //   }
  // }, [isOpen])
  
  // デバッグ用：processedContentの変化を監視
  useEffect(() => {
    console.log('=== State Update ===')
    console.log('processedContent:', processedContent)
    console.log('isProcessing:', isProcessing)
    console.log('error:', error)
    console.log('showCreateIdeaModal:', showCreateIdeaModal)
    if (processedContent) {
      console.log('processedContent.analysis:', processedContent.analysis)
    }
  }, [processedContent, isProcessing, error, showCreateIdeaModal])

  if (!isOpen) return null

  return (
    <>
      {!showCreateIdeaModal && (
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
              onClick={handleCloseModal}
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

            {/* ペインポイントのタイトル表示 */}
            <div className="bg-secondary/10 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-foreground">{painPointTitle}</h3>
              {/* デバッグ情報 */}
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Debug: processedContent = {processedContent ? 'exists' : 'null'}</p>
                <p>Debug: isProcessing = {isProcessing.toString()}</p>
                <p>Debug: error = {error || 'null'}</p>
                {processedContent && (
                  <p>Debug: analysis keys = {Object.keys(processedContent.analysis || {}).join(', ')}</p>
                )}
              </div>
            </div>

            {/* デバッグ情報 */}
            {(() => {
              console.log('=== Render Check ===')
              console.log('processedContent exists:', !!processedContent)
              console.log('isProcessing:', isProcessing)
              console.log('error:', error)
              if (processedContent) {
                console.log('processedContent in render:', processedContent)
              }
              return null
            })()}
            

            {processedContent ? (
              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="font-semibold text-card-foreground mb-3">AI分析結果</h3>
                  
                  {/* デバッグ: processedContentの内容を確認 */}
                  <div className="mb-4 p-2 bg-secondary rounded text-xs">
                    <p>Content: {processedContent.content ? `${processedContent.content.substring(0, 100)}...` : 'なし'}</p>
                    <p>Analysis keys: {processedContent.analysis ? Object.keys(processedContent.analysis).join(', ') : 'なし'}</p>
                    <p>problem_definition: {processedContent.analysis?.problem_definition || 'なし'}</p>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    {/* Fallback: if all analysis fields are empty, show raw content */}
                    {(!processedContent.analysis?.problem_definition && !processedContent.analysis?.target_users && !processedContent.analysis?.solution_approach && !processedContent.analysis?.expected_impact) ? (
                      <pre className="whitespace-pre-wrap text-foreground text-sm bg-secondary/20 p-3 rounded-lg">
                        {processedContent.content}
                      </pre>
                    ) : (
                      <>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            問題の定義
                          </h4>
                          <p className="text-foreground whitespace-pre-wrap">
                            {processedContent.analysis?.problem_definition || '内容がありません'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            対象ユーザー
                          </h4>
                          <p className="text-foreground whitespace-pre-wrap">
                            {processedContent.analysis?.target_users || '内容がありません'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            解決アプローチ
                          </h4>
                          <p className="text-foreground whitespace-pre-wrap">
                            {processedContent.analysis?.solution_approach || '内容がありません'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            期待される効果
                          </h4>
                          <p className="text-foreground whitespace-pre-wrap">
                            {processedContent.analysis?.expected_impact || '内容がありません'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCloseModal}
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
            ) : isProcessing ? (
              <div className="py-8">
                <CatLoading />
                <p className="text-center mt-4 text-muted-foreground">
                  AIがペインポイントを分析しています...
                </p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg">
                  {error}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleResetConversation}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    再試行
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground mb-6">
                  AIがペインポイントを分析して、構造化された洞察を提供します。
                </p>
                <button
                  onClick={handleAiProcess}
                  disabled={!canProcess}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  分析を開始
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {showCreateIdeaModal && (
        <CreateIdeaModal
          painPointId={painPointId}
          painPointTitle={painPointTitle}
          aiProcessedContent={processedContent}
          isOpen={showCreateIdeaModal}
          onClose={() => {
            setShowCreateIdeaModal(false)
            handleCloseModal()
          }}
        />
      )}
    </>
  )
}