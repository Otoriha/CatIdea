import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Axiosインスタンスの作成
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CORS認証情報を含める
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    // 認証トークンがある場合は追加
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized Error:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        response: error.response?.data
      });
      
      // /ideas エンドポイントの場合は詳細なエラーログを出力
      if (error.config?.url?.includes('/ideas')) {
        console.error('Ideas endpoint 401 error - Auth token:', localStorage.getItem('authToken'));
      }
      
      // 認証エラーの場合の処理
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;