'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { user, isLoggedIn, logout, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                CatIdea
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              ホーム
            </Link>
            {isLoggedIn && (
              <>
                <Link 
                  href="/pain-points" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  ペインポイント
                </Link>
                <Link 
                  href="/ideas" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  アイディア
                </Link>
              </>
            )}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  こんにちは、{user?.name}さん
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
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
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:text-gray-900 dark:focus:text-white"
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