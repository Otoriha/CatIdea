# WebSocket接続テストガイド

## 前提条件
1. Dockerコンテナが起動していること
2. ユーザーがログイン済みでJWTトークンを持っていること

## テスト手順

### 1. JWTトークンの取得
ブラウザの開発者ツールでlocalStorageからトークンを取得：
```javascript
localStorage.getItem('token')
```

### 2. WebSocketテストの実行

#### 方法1: ブラウザコンソールで直接実行
1. http://localhost:3001 にアクセス
2. ログイン
3. 開発者ツールのコンソールを開く
4. 以下のコードを実行：

```javascript
// トークンを取得
const token = localStorage.getItem('token');

// WebSocket接続
const ws = new WebSocket(`ws://localhost:3000/cable?token=${encodeURIComponent(token)}`);

ws.onopen = () => console.log('✅ 接続成功');
ws.onmessage = (e) => console.log('📩 受信:', JSON.parse(e.data));
ws.onerror = (e) => console.error('❌ エラー:', e);
ws.onclose = (e) => console.log('🔚 切断:', e);
```

#### 方法2: テストスクリプトを使用
1. test/websocket_test.js の内容をコピー
2. `YOUR_JWT_TOKEN_HERE` を実際のトークンに置き換え
3. ブラウザコンソールで実行

### 3. 期待される結果
- 接続成功時: "✅ WebSocket接続成功!" と表示
- Action Cableからウェルカムメッセージを受信
- エラーがない場合は接続が維持される

### 4. トラブルシューティング

#### 接続できない場合
1. Redisが起動しているか確認:
   ```bash
   docker-compose ps redis
   ```

2. Backendログを確認:
   ```bash
   docker-compose logs -f backend
   ```

3. ブラウザのネットワークタブでWebSocket接続を確認

#### 認証エラーの場合
- トークンが正しいか確認
- トークンの有効期限が切れていないか確認

## 補足情報
- WebSocket URL: ws://localhost:3000/cable
- 認証方式: URLパラメータでJWTトークンを送信
- チャンネル: ConversationChannel (AI対話用)