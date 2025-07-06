# CatIdea デプロイガイド

## 概要
- **フロントエンド**: Vercel（Next.js）
- **バックエンド**: Render（Rails API）
- **データベース**: Render PostgreSQL
- **Redis**: Render Redis

## 1. Renderでのバックエンドデプロイ

### 必要な環境変数
Renderのダッシュボードで以下の環境変数を設定：

```
RAILS_MASTER_KEY=<config/master.keyの内容>
OPENAI_API_KEY=<OpenAI APIキー>
FRONTEND_URL=<VercelでデプロイされるフロントエンドのURL>
```

### デプロイ手順
1. GitHubリポジトリをRenderに接続
2. `render.yaml`を使用してサービスを作成
3. PostgreSQLとRedisは自動的に作成される
4. 初回デプロイ後、データベースマイグレーションが自動実行される

## 2. Vercelでのフロントエンドデプロイ

### 必要な環境変数
Vercelのダッシュボードで以下の環境変数を設定：

```
NEXT_PUBLIC_API_URL=<RenderでデプロイされるバックエンドAPIのURL>/api/v1
NEXT_PUBLIC_WS_URL=<RenderでデプロイされるバックエンドのWebSocketURL>/cable
```

### デプロイ手順
1. GitHubリポジトリをVercelに接続
2. Root Directoryを`frontend`に設定
3. Build Commandは`npm run build`（デフォルト）
4. 環境変数を設定後デプロイ

## 3. 初回セットアップ手順

### 3.1 Renderでのセットアップ
1. [Render](https://render.com)にサインアップ
2. GitHubアカウントを連携
3. 「New」→「Blueprint」を選択
4. リポジトリを選択し、`render.yaml`を指定
5. 環境変数を設定：
   - `RAILS_MASTER_KEY`: `backend/config/master.key`の内容をコピー
   - `OPENAI_API_KEY`: OpenAI APIキーを設定
   - `FRONTEND_URL`: 一旦 `https://temp.vercel.app` で設定（後で更新）

### 3.2 Vercelでのセットアップ
1. [Vercel](https://vercel.com)にサインアップ
2. GitHubアカウントを連携
3. 「Import Project」でリポジトリを選択
4. Framework Preset: `Next.js`
5. Root Directory: `frontend`
6. 環境変数を設定：
   - `NEXT_PUBLIC_API_URL`: RenderのAPIのURL + `/api/v1`
   - `NEXT_PUBLIC_WS_URL`: RenderのWebSocket URL + `/cable`

### 3.3 相互URL設定の更新
1. Vercelのデプロイが完了したら、フロントエンドのURLを確認
2. RenderでFRONTEND_URL環境変数を実際のVercel URLに更新

## 4. 継続的デプロイメント

- GitHubのmainブランチへのpushで自動デプロイ
- フロントエンド: Vercelが自動ビルド・デプロイ
- バックエンド: Renderが自動ビルド・デプロイ・マイグレーション実行

## 5. トラブルシューティング

### よくある問題

#### CORS エラー
- RenderでFRONTEND_URL環境変数が正しく設定されているか確認
- Vercelの実際のURLと一致しているか確認

#### データベース接続エラー
- DATABASE_URLが自動設定されているか確認
- PostgreSQLサービスが正常に動作しているか確認

#### API接続エラー
- VercelでNEXT_PUBLIC_API_URLが正しく設定されているか確認
- RenderのAPIサービスが正常に動作しているか確認

### ログ確認方法
- **Render**: ダッシュボードの「Logs」タブ
- **Vercel**: ダッシュボードの「Functions」タブ

## 6. 本番環境での注意事項

- **セキュリティ**: 環境変数に機密情報を含める際は十分注意
- **スケーリング**: トラフィック増加時はRenderのプラン変更を検討
- **監視**: 両プラットフォームの監視機能を活用
- **バックアップ**: 重要なデータのバックアップ戦略を策定

## 7. 開発環境との違い

- 開発環境: Docker Compose
- 本番環境: Vercel + Render
- データベース: 開発（ローカルPostgreSQL）→ 本番（Render PostgreSQL）
- Redis: 開発（ローカルRedis）→ 本番（Render Redis）