'use client'

import { useState } from 'react'

interface RatingSelectorProps {
  label: string
  value: number
  onChange: (value: number) => void
  required?: boolean
  disabled?: boolean
  description?: string
}

export default function RatingSelector({ 
  label, 
  value, 
  onChange, 
  required = false, 
  disabled = false, 
  description 
}: RatingSelectorProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)

  const ratingLabels = [
    { value: 1, label: '低い', color: 'text-green-600' },
    { value: 2, label: 'やや低い', color: 'text-yellow-500' },
    { value: 3, label: '普通', color: 'text-orange-500' },
    { value: 4, label: 'やや高い', color: 'text-red-500' },
    { value: 5, label: '高い', color: 'text-red-700' }
  ]

  const getCurrentLabel = () => {
    const displayValue = hoveredValue !== null ? hoveredValue : value
    const rating = ratingLabels.find(r => r.value === displayValue)
    return rating ? rating.label : ''
  }

  const getCurrentColor = () => {
    const displayValue = hoveredValue !== null ? hoveredValue : value
    const rating = ratingLabels.find(r => r.value === displayValue)
    return rating ? rating.color : 'text-gray-400'
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      
      <div className="flex items-center space-x-4">
        <div className="flex space-x-1" role="radiogroup" aria-label={label}>
          {[1, 2, 3, 4, 5].map((rating) => {
            const isSelected = value === rating
            const isHovered = hoveredValue === rating
            const shouldHighlight = hoveredValue !== null 
              ? rating <= hoveredValue 
              : rating <= value

            return (
              <button
                key={rating}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${rating}段階`}
                disabled={disabled}
                className={`
                  w-8 h-8 rounded-full border-2 transition-all duration-200 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${shouldHighlight 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 hover:border-blue-400'
                  }
                  ${isHovered ? 'scale-110' : ''}
                `}
                onClick={() => !disabled && onChange(rating)}
                onMouseEnter={() => !disabled && setHoveredValue(rating)}
                onMouseLeave={() => !disabled && setHoveredValue(null)}
              >
                <span className="text-sm font-medium">{rating}</span>
              </button>
            )
          })}
        </div>
        
        {(value > 0 || hoveredValue !== null) && (
          <div className={`text-sm font-medium transition-colors duration-200 ${getCurrentColor()}`}>
            {getCurrentLabel()}
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>低い</span>
        <span>高い</span>
      </div>
    </div>
  )
}