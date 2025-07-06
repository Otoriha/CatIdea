'use client'

import { useState, useRef, useEffect } from 'react'

interface TagInputProps {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  required?: boolean
  disabled?: boolean
  placeholder?: string
  maxTags?: number
}

export default function TagInput({
  label,
  value,
  onChange,
  suggestions = [],
  required = false,
  disabled = false,
  placeholder = 'タグを入力してください...',
  maxTags = 10,
  description
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 入力値に基づいて候補をフィルタリング
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(
        suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(suggestion)
      )
      setFilteredSuggestions(filtered)
      setIsOpen(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setIsOpen(false)
    }
    setHighlightedIndex(-1)
  }, [inputValue, suggestions, value])

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addTag = (tag: string) => {
    if (disabled) return
    
    const trimmedTag = tag.trim()
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmedTag])
    }
    setInputValue('')
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        addTag(filteredSuggestions[highlightedIndex])
      } else if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
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
                onFocus={() => inputValue && setIsOpen(filteredSuggestions.length > 0)}
                placeholder={value.length === 0 ? placeholder : ''}
                disabled={disabled}
                className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-foreground placeholder-muted-foreground disabled:opacity-50"
              />
            )}
          </div>
        </div>

        {/* オートコンプリートドロップダウン */}
        {isOpen && filteredSuggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                  index === highlightedIndex 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-popover-foreground'
                }`}
                onClick={() => addTag(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ヘルプテキスト */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Enterキーでタグを追加</span>
        <span>{value.length}/{maxTags}</span>
      </div>
    </div>
  )
}