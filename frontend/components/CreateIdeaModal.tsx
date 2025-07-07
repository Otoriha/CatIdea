'use client'

import { useState } from 'react'
import { ideasApi, type CreateIdeaInput } from '@/lib/api/ideas'
import { useRouter } from 'next/navigation'

interface CreateIdeaModalProps {
  painPointId: number
  painPointTitle: string
  isOpen: boolean
  onClose: () => void
  fromConversation?: boolean
  suggestedContent?: {
    title?: string
    description?: string
  }
  aiProcessedContent?: {
    analysis: {
      problem_definition: string
      target_users: string
      solution_approach: string
      expected_impact: string
    }
  }
}

export default function CreateIdeaModal({
  painPointId,
  painPointTitle,
  isOpen,
  onClose,
  fromConversation = false,
  suggestedContent = {},
  aiProcessedContent,
}: CreateIdeaModalProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // AI処理結果がある場合は、それを使用してデフォルト値を設定
  const getDefaultDescription = () => {
    if (aiProcessedContent) {
      return `## 問題の定義
${aiProcessedContent.analysis.problem_definition}

## 対象ユーザー
${aiProcessedContent.analysis.target_users}

## 解決アプローチ
${aiProcessedContent.analysis.solution_approach}

## 期待される効果
${aiProcessedContent.analysis.expected_impact}`
    }
    return suggestedContent.description || ''
  }
  
  const [formData, setFormData] = useState<CreateIdeaInput>({
    title: suggestedContent.title || '',
    description: getDefaultDescription(),
    feasibility: 3,
    impact: 3,
    status: 'draft',
    from_conversation: fromConversation,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError(null)

    try {
      const response = await ideasApi.createIdea(painPointId, formData)
      router.push(`/ideas/${response.idea.id}`)
    } catch (err) {
      setError('アイディアの作成に失敗しました')
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            アイディアに昇華
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            ペインポイント「{painPointTitle}」からアイディアを作成
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              アイディアのタイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="解決策のタイトルを入力"
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
              placeholder={`どのように「${painPointTitle}」を解決するか詳しく説明してください`}
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

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-2">
              💡 ヒント
            </h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
              <li>• 実現可能性: 技術的・リソース的に実現できるか</li>
              <li>• インパクト: 問題をどの程度解決できるか</li>
              <li>• 高い実現可能性と高いインパクトのアイディアを目指しましょう</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? '作成中...' : 'アイディアを作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}