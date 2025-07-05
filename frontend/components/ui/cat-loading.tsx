import React from 'react'

export function CatLoading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* 猫の画像 */}
      <div className="relative w-20 h-20">
        <img 
          src="/images/cat-loding-light.png" 
          alt="Loading..."
          className="w-20 h-20 animate-pulse block dark:hidden"
        />
        <img 
          src="/images/cat-loding-dark.png" 
          alt="Loading..."
          className="w-20 h-20 animate-pulse hidden dark:block"
        />
      </div>
      
      {/* 足跡アニメーション */}
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
      
      <p className="text-sm text-muted-foreground animate-pulse">読み込み中...</p>
    </div>
  )
}

export function CatLoadingInline() {
  return (
    <div className="inline-flex items-center space-x-2">
      <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  )
}