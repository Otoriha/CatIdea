'use client'

import QuickRegistration from "@/components/QuickRegistration";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { CatLoading } from "@/components/ui/cat-loading";

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            CatIdea
          </h1>
          <p className="text-lg text-muted-foreground">
            日常の課題（ペインポイント）をアイデアの種に変える
          </p>
        </header>
        
        {isLoading ? (
          <div className="text-center">
            <CatLoading />
          </div>
        ) : isLoggedIn ? (
          <>
            <section className="mb-16 mt-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                ペインポイントを見つけたらすぐ入力
              </h2>
              <QuickRegistration />
              
              <div className="text-center mt-6">
                <Link
                  href="/pain-points/new"
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  詳細フォームで登録
                </Link>
              </div>
            </section>
          </>
        ) : (
          <section className="mb-16 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              始めましょう
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              ペインポイントを記録してアイデアを生み出すために、まずはログインまたはサインアップしてください。
            </p>
            <div className="space-x-4">
              <Link
                href="/login"
                className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="inline-block bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                サインアップ
              </Link>
            </div>
          </section>
        )}
        
        <section className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-md p-6 border border-border">
            <h3 className="text-xl font-semibold text-card-foreground mb-4 text-center">
              使い方
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-left">
              <li>日常で感じた課題や不便をメモ感覚で記録</li>
              <li>自動で課題を深掘り</li>
              <li>アイディアとして記録・管理</li>
            </ol>
          </div>
          
          <div className="bg-card rounded-lg shadow-md p-6 border border-border">
            <h3 className="text-xl font-semibold text-card-foreground mb-4 text-center">
              CatIdeaの流れ
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-left">
              <li>小さな気づきを大きなチャンスに</li>
              <li>思考の整理はAIにお任せ</li>
              <li>あなたの課題が誰かの解決策になる</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}