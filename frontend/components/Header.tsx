'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { CatLoadingInline } from '@/components/ui/cat-loading'

export default function Header() {
  const { user, isLoggedIn, logout, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {/* ライトモード用ロゴ */}
              <img 
                src="/images/catidea-logo.png" 
                alt="CatIdea"
                className="h-10 w-auto block dark:hidden"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  document.getElementById('header-title')?.classList.remove('hidden');
                }}
              />
              {/* ダークモード用ロゴ */}
              <img 
                src="/images/catidea-logo-dark.png" 
                alt="CatIdea"
                className="h-10 w-auto hidden dark:block"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  document.getElementById('header-title')?.classList.remove('hidden');
                }}
              />
              {/* フォールバック用テキスト */}
              <h1 id="header-title" className="text-2xl font-bold text-foreground hidden">
                CatIdea
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              ホーム
            </Link>
            {isLoggedIn && (
              <>
                <Link 
                  href="/pain-points" 
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  ペインポイント
                </Link>
                <Link 
                  href="/ideas" 
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  アイディア
                </Link>
              </>
            )}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isLoading ? (
              <CatLoadingInline />
            ) : isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground text-sm">
                  こんにちは、{user?.name}さん
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  サインアップ
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground"
              aria-label="メニューを開く"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}