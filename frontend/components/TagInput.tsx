'use client'

import { useState, useRef, useEffect } from 'react'

interface TagInputProps {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
  maxTags?: number
  description?: string
}

export default function TagInput({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'タグを入力してください...',
  maxTags = 10,
  description
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)


  const addTag = (tag: string) => {
    if (disabled) return
    
    const trimmedTag = tag.trim()
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmedTag])
      // タグ追加後は必ず入力値をクリア
      setInputValue('')
    }
  }

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}

      <div className="relative">
        {/* タグ表示エリア + 入力フィールド */}
        <div className="min-h-[42px] w-full px-3 py-2 border border-border rounded-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-input">
          <div className="flex flex-wrap gap-2 items-center">
            {/* 既存のタグ */}
            {value.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary"
              >
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-1 text-primary hover:text-primary/80"
                    aria-label={`${tag}を削除`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </span>
            ))}

            {/* 入力フィールド */}
            {value.length < maxTags && (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder={value.length === 0 ? placeholder : ''}
                disabled={disabled}
                className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-foreground placeholder-muted-foreground disabled:opacity-50"
              />
            )}
          </div>
        </div>
      </div>

      {/* ヘルプテキスト */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Enterキーでタグを追加</span>
        <span>{value.length}/{maxTags}</span>
      </div>

      {/* タグ付けガイドライン */}
      <div className="mt-3 p-3 bg-muted/30 rounded-md text-xs text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">💡 タグ付けのコツ（後で探しやすくなります）</p>
        <ul className="space-y-1 ml-4">
          <li>• <span className="font-medium">場面をメモ：</span>いつ・どこで起きたか
            <div className="ml-4 mt-0.5">
              <span className="text-green-600 dark:text-green-400">例: 朝の通勤時、スマホ表示、月末処理</span>
            </div>
          </li>
          <li>• <span className="font-medium">あなたの言葉で：</span>「あれ何だっけ？」と思い出すときの言葉
            <div className="ml-4 mt-0.5">
              <span className="text-green-600 dark:text-green-400">例: 遅い、見つからない、使いづらい、エラー</span>
            </div>
          </li>
          <li>• <span className="font-medium">シンプルに：</span>短い言葉の方が後で見つけやすい
            <div className="ml-4 mt-0.5">
              <span className="text-green-600 dark:text-green-400">例: 「ログイン」だけでOK（「ログインできない問題」は長すぎ）</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}