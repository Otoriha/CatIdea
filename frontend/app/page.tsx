'use client'

import QuickRegistration from "@/components/QuickRegistration";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            CatIdea
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            日常の課題をアイデアの種に変える
          </p>
        </header>
        
        {isLoading ? (
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : isLoggedIn ? (
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
              ペインポイントをクイック登録
            </h2>
            <QuickRegistration />
          </section>
        ) : (
          <section className="mb-16 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
              始めましょう
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              ペインポイントを記録してアイデアを生み出すために、まずはログインまたはサインアップしてください。
            </p>
            <div className="space-x-4">
              <Link
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                サインアップ
              </Link>
            </div>
          </section>
        )}
        
        <section className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              使い方
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>日常で感じた課題や不便なことを入力</li>
              <li>エンターキーですぐに保存</li>
              <li>後でじっくり分析し、アイデアへと昇華</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}