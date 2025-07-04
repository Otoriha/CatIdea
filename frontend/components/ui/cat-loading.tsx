import React from 'react'

export function CatLoading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-20 h-20">
        {/* 猫の顔 */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
        
        {/* 猫の耳 */}
        <div className="absolute -top-2 left-2 w-0 h-0 border-l-[10px] border-l-transparent border-b-[20px] border-b-primary/40 border-r-[10px] border-r-transparent animate-pulse"></div>
        <div className="absolute -top-2 right-2 w-0 h-0 border-l-[10px] border-l-transparent border-b-[20px] border-b-primary/40 border-r-[10px] border-r-transparent animate-pulse"></div>
        
        {/* 猫の目 */}
        <div className="absolute top-6 left-5 w-2 h-2 bg-primary rounded-full animate-blink"></div>
        <div className="absolute top-6 right-5 w-2 h-2 bg-primary rounded-full animate-blink"></div>
        
        {/* 猫の鼻 */}
        <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-t-[8px] border-t-primary/60 border-r-[5px] border-r-transparent"></div>
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