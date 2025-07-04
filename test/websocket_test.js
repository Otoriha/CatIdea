// WebSocket接続テストスクリプト
// ブラウザのコンソールで実行してください

// テスト用のトークン（実際のトークンに置き換えてください）
const testToken = "YOUR_JWT_TOKEN_HERE";

// WebSocket URLの構築
const wsUrl = `ws://localhost:3000/cable?token=${encodeURIComponent(testToken)}`;

console.log("WebSocket接続を試みています...");
console.log("URL:", wsUrl);

// WebSocket接続の作成
const socket = new WebSocket(wsUrl);

// 接続成功時
socket.onopen = (event) => {
  console.log("✅ WebSocket接続成功!");
  console.log("接続状態:", socket.readyState);
  
  // Action Cableのサブスクリプションメッセージを送信
  const subscriptionMessage = {
    command: "subscribe",
    identifier: JSON.stringify({
      channel: "ConversationChannel",
      conversation_id: 1 // テスト用のID
    })
  };
  
  socket.send(JSON.stringify(subscriptionMessage));
  console.log("サブスクリプションメッセージを送信しました");
};

// メッセージ受信時
socket.onmessage = (event) => {
  console.log("📩 メッセージ受信:", event.data);
  const data = JSON.parse(event.data);
  console.log("パース済みデータ:", data);
};

// エラー発生時
socket.onerror = (error) => {
  console.error("❌ WebSocketエラー:", error);
};

// 接続終了時
socket.onclose = (event) => {
  console.log("🔚 WebSocket接続終了");
  console.log("終了コード:", event.code);
  console.log("終了理由:", event.reason);
  console.log("正常終了:", event.wasClean);
};

// テスト用の関数
window.testWebSocket = {
  // メッセージ送信
  sendMessage: (content) => {
    if (socket.readyState === WebSocket.OPEN) {
      const message = {
        command: "message",
        identifier: JSON.stringify({
          channel: "ConversationChannel",
          conversation_id: 1
        }),
        data: JSON.stringify({
          action: "send_message",
          conversation_id: 1,
          content: content
        })
      };
      socket.send(JSON.stringify(message));
      console.log("メッセージを送信しました:", content);
    } else {
      console.error("WebSocketが接続されていません");
    }
  },
  
  // 接続を閉じる
  close: () => {
    socket.close();
    console.log("WebSocket接続を閉じました");
  },
  
  // 接続状態を確認
  status: () => {
    const states = {
      0: "CONNECTING",
      1: "OPEN",
      2: "CLOSING",
      3: "CLOSED"
    };
    console.log("接続状態:", states[socket.readyState]);
    return socket.readyState;
  }
};

console.log("テスト用関数が利用可能です:");
console.log("- testWebSocket.sendMessage('メッセージ内容')");
console.log("- testWebSocket.status()");
console.log("- testWebSocket.close()");