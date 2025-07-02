import QuickRegistration from "@/components/QuickRegistration";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            CatIdea
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            日常の課題をアイデアの種に変える
          </p>
        </header>
        
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
            ペインポイントをクイック登録
          </h2>
          <QuickRegistration />
        </section>
        
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