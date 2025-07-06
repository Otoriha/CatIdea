import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// リクエストインターセプター
apiClient.interceptors.request.use((config) => {
  // JWTトークンがlocalStorageにある場合は追加（ブラウザ環境でのみ）
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    console.log('API Request Debug:', { 
      url: config.url, 
      method: config.method, 
      hasToken: !!token,
      tokenPrefix: token ? token.substring(0, 20) + '...' : null
    })
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 未認証の場合はログインページへリダイレクト（ブラウザ環境でのみ）
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)