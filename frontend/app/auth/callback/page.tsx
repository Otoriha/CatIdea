'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUserData } = useAuth()
  const processedRef = useRef(false)

  useEffect(() => {
    // 一度だけ実行されるようにする
    if (processedRef.current) return
    processedRef.current = true

    const token = searchParams.get('token')
    const userId = searchParams.get('user_id')
    const userName = searchParams.get('user_name')
    const error = searchParams.get('error')

    console.log('OAuth Callback Debug:', { token: !!token, userId, userName, error })

    if (error) {
      // 認証エラーの場合
      console.error('GitHub OAuth Error:', error)
      router.push(`/login?error=${error}`)
      return
    }

    if (token && userId && userName) {
      try {
        console.log('Setting user data and redirecting...')
        
        // トークンをlocalStorageに保存
        localStorage.setItem('token', token)
        
        // AuthContextにユーザー情報を設定（GitHub OAuth用）
        setUserData({
          id: parseInt(userId),
          name: decodeURIComponent(userName),
          email: '', // GitHub認証では後で取得
          created_at: new Date().toISOString()
        })

        // リダイレクト
        console.log('Redirecting to home page...')
        router.push('/')
      } catch (error) {
        console.error('Error during OAuth callback processing:', error)
        router.push('/login?error=callback_processing_failed')
      }
    } else {
      // 認証失敗時はログインページにリダイレクト
      console.log('Missing required parameters, redirecting to login')
      router.push('/login?error=authentication_failed')
    }
  }, [])

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