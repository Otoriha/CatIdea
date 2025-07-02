'use client';

import { useState } from 'react';
import { healthApi } from '@/lib/api/health';

export default function ApiTestPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const checkHealth = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await healthApi.check();
      setStatus(JSON.stringify(response, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API接続テスト</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <button
            onClick={checkHealth}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '確認中...' : 'ヘルスチェック'}
          </button>

          {status && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">レスポンス:</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {status}
              </pre>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              エラー: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}