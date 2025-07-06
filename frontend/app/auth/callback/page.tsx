'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const userId = searchParams.get('user_id')
    const userName = searchParams.get('user_name')
    const error = searchParams.get('error')

    if (error) {
      // 認証エラーの場合
      console.error('GitHub OAuth Error:', error)
      router.push(`/login?error=${error}`)
      return
    }

    if (token && userId && userName) {
      // トークンをlocalStorageに保存
      localStorage.setItem('token', token)
      
      // AuthContextにユーザー情報を設定
      login({
        id: parseInt(userId),
        name: decodeURIComponent(userName),
        email: '' // GitHub認証では後で取得
      })

      // メインページにリダイレクト
      router.push('/')
    } else {
      // 認証失敗時はログインページにリダイレクト
      router.push('/login?error=authentication_failed')
    }
  }, [searchParams, login, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">認証処理中...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">認証処理中...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}