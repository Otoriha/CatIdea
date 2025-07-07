'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { CatLoadingInline } from '@/components/ui/cat-loading'

export default function Header() {
  const { user, isLoggedIn, logout, isLoading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

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
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ホーム
            </Link>
            {isLoggedIn && (
              <>
                <Link 
                  href="/pain-points" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname?.startsWith('/pain-points') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ペインポイント
                </Link>
                <Link 
                  href="/ideas" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname?.startsWith('/ideas') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
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
                  こんにちは {user?.name}さん
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground"
              aria-label={isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === '/' 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ホーム
              </Link>
              {isLoggedIn && (
                <>
                  <Link 
                    href="/pain-points" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname?.startsWith('/pain-points') 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ペインポイント
                  </Link>
                  <Link 
                    href="/ideas" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname?.startsWith('/ideas') 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    アイディア
                  </Link>
                  <div className="border-t border-border mt-2 pt-2">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      こんにちは、{user?.name}さん
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="block w-full text-left bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-md text-base font-medium transition-colors"
                    >
                      ログアウト
                    </button>
                  </div>
                </>
              )}
              {!isLoggedIn && !isLoading && (
                <div className="border-t border-border mt-2 pt-2 space-y-1">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    サインアップ
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}