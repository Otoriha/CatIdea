import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import QuickRegistration from '@/components/QuickRegistration'

// Fetchのモック
global.fetch = jest.fn()

describe('QuickRegistration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('入力フィールドとボタンが表示される', () => {
    render(<QuickRegistration />)
    
    expect(screen.getByPlaceholderText('今感じている課題を入力してください...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument()
  })

  it('エンターキーで送信できる', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'ペインポイントをクイック作成しました' })
    })

    render(<QuickRegistration />)
    const input = screen.getByPlaceholderText('今感じている課題を入力してください...')
    
    fireEvent.change(input, { target: { value: 'テストペインポイント' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/pain_points/quick`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ content: 'テストペインポイント' }),
        })
      )
    })
  })

  it('送信成功時にメッセージが表示される', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'ペインポイントをクイック作成しました' })
    })

    render(<QuickRegistration />)
    const input = screen.getByPlaceholderText('今感じている課題を入力してください...')
    
    fireEvent.change(input, { target: { value: 'テストペインポイント' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('ペインポイントを登録しました')).toBeInTheDocument()
    })
  })

  it('送信失敗時にエラーメッセージが表示される', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'エラーが発生しました' })
    })

    render(<QuickRegistration />)
    const input = screen.getByPlaceholderText('今感じている課題を入力してください...')
    
    fireEvent.change(input, { target: { value: 'テストペインポイント' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('登録に失敗しました')).toBeInTheDocument()
    })
  })

  it('空の入力では送信されない', () => {
    render(<QuickRegistration />)
    const button = screen.getByRole('button', { name: '送信' })
    
    expect(button).toBeDisabled()
  })

  it('送信後に入力フィールドがクリアされる', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'ペインポイントをクイック作成しました' })
    })

    render(<QuickRegistration />)
    const input = screen.getByPlaceholderText('今感じている課題を入力してください...') as HTMLInputElement
    
    fireEvent.change(input, { target: { value: 'テストペインポイント' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })
})