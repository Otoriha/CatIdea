'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RatingSelector from './RatingSelector'
import TagInput from './TagInput'

interface PainPointFormData {
  title: string
  situation: string
  inconvenience: string
  impact_scope: string
  tags: string[]
  importance: number
  urgency: number
}

interface DetailedPainPointFormProps {
  initialData?: Partial<PainPointFormData>
  onSubmit?: (data: PainPointFormData) => Promise<{ success: boolean; message?: string }>
  isEditing?: boolean
  isLoading?: boolean
}

const INITIAL_FORM_DATA: PainPointFormData = {
  title: '',
  situation: '',
  inconvenience: '',
  impact_scope: '',
  tags: [],
  importance: 0,
  urgency: 0
}

// よく使われるタグの候補
const TAG_SUGGESTIONS = [
  '仕事', '通勤', '家事', 'アプリ', 'ウェブサイト', 'ツール',
  'コミュニケーション', '時間管理', '効率化', 'UI/UX', 'デザイン',
  'プロセス', '手続き', 'サービス', '機能', 'パフォーマンス',
  'セキュリティ', 'アクセシビリティ', '操作性', '利便性'
]

export default function DetailedPainPointForm({ 
  initialData, 
  onSubmit, 
  isEditing = false, 
  isLoading = false 
}: DetailedPainPointFormProps) {
  const [formData, setFormData] = useState<PainPointFormData>({ 
    ...INITIAL_FORM_DATA, 
    ...initialData 
  })
  const [errors, setErrors] = useState<Partial<Record<keyof PainPointFormData, string>>>({})
  const [isDirty, setIsDirty] = useState(false)
  const router = useRouter()

  // 下書き自動保存機能
  useEffect(() => {
    if (isDirty && !isEditing) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('painpoint_draft', JSON.stringify(formData))
      }, 1000) // 1秒後に保存

      return () => clearTimeout(timeoutId)
    }
  }, [formData, isDirty, isEditing])

  // 下書きデータの読み込み
  useEffect(() => {
    if (!isEditing && !initialData) {
      const savedDraft = localStorage.getItem('painpoint_draft')
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft)
          setFormData({ ...INITIAL_FORM_DATA, ...draftData })
        } catch (error) {
          console.error('Failed to load draft:', error)
        }
      }
    }
  }, [isEditing, initialData])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PainPointFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です'
    } else if (formData.title.length > 100) {
      newErrors.title = 'タイトルは100文字以内で入力してください'
    }

    if (!formData.situation.trim()) {
      newErrors.situation = '状況の説明は必須です'
    } else if (formData.situation.length > 500) {
      newErrors.situation = '状況は500文字以内で入力してください'
    }

    if (!formData.inconvenience.trim()) {
      newErrors.inconvenience = '不便さの説明は必須です'
    } else if (formData.inconvenience.length > 500) {
      newErrors.inconvenience = '不便さは500文字以内で入力してください'
    }

    if (formData.impact_scope.length > 300) {
      newErrors.impact_scope = '影響範囲は300文字以内で入力してください'
    }

    if (formData.importance === 0) {
      newErrors.importance = '重要度を選択してください'
    }

    if (formData.urgency === 0) {
      newErrors.urgency = '緊急度を選択してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof PainPointFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setIsDirty(true)
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleRatingChange = (field: 'importance' | 'urgency') => (value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({ ...prev, tags }))
    setIsDirty(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (onSubmit) {
      const result = await onSubmit(formData)
      if (result.success) {
        // 成功時は下書きを削除
        localStorage.removeItem('painpoint_draft')
        setIsDirty(false)
      }
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      if (confirm('編集中の内容が失われますが、よろしいですか？')) {
        router.back()
      }
    } else {
      router.back()
    }
  }

  const clearDraft = () => {
    localStorage.removeItem('painpoint_draft')
    setFormData(INITIAL_FORM_DATA)
    setIsDirty(false)
    setErrors({})
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* タイトル */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={handleInputChange('title')}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${
              errors.title 
                ? 'border-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="ペインポイントを一言で表現してください"
            maxLength={100}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.title.length}/100文字
          </p>
        </div>

        {/* 状況 */}
        <div>
          <label htmlFor="situation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            状況 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="situation"
            value={formData.situation}
            onChange={handleInputChange('situation')}
            disabled={isLoading}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors resize-y ${
              errors.situation 
                ? 'border-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="どのような状況でこの問題が発生しますか？具体的に説明してください。"
            maxLength={500}
          />
          {errors.situation && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.situation}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.situation.length}/500文字
          </p>
        </div>

        {/* 感じた不便さ */}
        <div>
          <label htmlFor="inconvenience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            感じた不便さ <span className="text-red-500">*</span>
          </label>
          <textarea
            id="inconvenience"
            value={formData.inconvenience}
            onChange={handleInputChange('inconvenience')}
            disabled={isLoading}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors resize-y ${
              errors.inconvenience 
                ? 'border-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="具体的にどのような不便さを感じましたか？なぜ問題だと思うのかを説明してください。"
            maxLength={500}
          />
          {errors.inconvenience && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.inconvenience}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.inconvenience.length}/500文字
          </p>
        </div>

        {/* 影響範囲 */}
        <div>
          <label htmlFor="impact_scope" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            影響範囲
          </label>
          <textarea
            id="impact_scope"
            value={formData.impact_scope}
            onChange={handleInputChange('impact_scope')}
            disabled={isLoading}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors resize-y ${
              errors.impact_scope 
                ? 'border-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="この問題は誰に・どのくらいの頻度で・どの程度の影響を与えますか？（任意）"
            maxLength={300}
          />
          {errors.impact_scope && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.impact_scope}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.impact_scope.length}/300文字
          </p>
        </div>

        {/* タグ */}
        <TagInput
          label="タグ"
          value={formData.tags}
          onChange={handleTagsChange}
          suggestions={TAG_SUGGESTIONS}
          disabled={isLoading}
          placeholder="関連するタグを追加してください..."
          maxTags={8}
        />

        {/* 重要度と緊急度 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RatingSelector
            label="重要度"
            value={formData.importance}
            onChange={handleRatingChange('importance')}
            required
            disabled={isLoading}
            description="この問題がどの程度重要か評価してください"
          />
          {errors.importance && (
            <p className="text-sm text-red-600 dark:text-red-400 -mt-6">{errors.importance}</p>
          )}

          <RatingSelector
            label="緊急度"
            value={formData.urgency}
            onChange={handleRatingChange('urgency')}
            required
            disabled={isLoading}
            description="この問題がどの程度緊急か評価してください"
          />
          {errors.urgency && (
            <p className="text-sm text-red-600 dark:text-red-400 -mt-6">{errors.urgency}</p>
          )}
        </div>

        {/* 下書き情報 */}
        {isDirty && !isEditing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                入力内容は自動的に下書きとして保存されています
              </p>
              <button
                type="button"
                onClick={clearDraft}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
              >
                下書きをクリア
              </button>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                保存中...
              </span>
            ) : (
              isEditing ? '更新' : '保存'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}