import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Fetchのモック
global.fetch = jest.fn()

// テスト用コンポーネント
const TestComponent = () => {
  const { user, isLoggedIn, isLoading } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="logged-in">{isLoggedIn ? 'Logged In' : 'Not Logged In'}</div>
      <div data-testid="user-name">{user?.name || 'No User'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('初期状態が正しく設定される', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ logged_in: false, user: null })
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      expect(screen.getByTestId('logged-in')).toHaveTextContent('Not Logged In')
      expect(screen.getByTestId('user-name')).toHaveTextContent('No User')
    })
  })

  it('ログイン済みユーザーの状態が正しく設定される', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      created_at: '2024-01-01'
    }

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ logged_in: true, user: mockUser })
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      expect(screen.getByTestId('logged-in')).toHaveTextContent('Logged In')
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
    })
  })

  it('認証チェックが失敗した場合の処理', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      expect(screen.getByTestId('logged-in')).toHaveTextContent('Not Logged In')
      expect(screen.getByTestId('user-name')).toHaveTextContent('No User')
    })
  })
})