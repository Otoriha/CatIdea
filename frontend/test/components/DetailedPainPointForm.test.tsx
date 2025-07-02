import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
import DetailedPainPointForm from '@/components/DetailedPainPointForm'

// next/navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// localStorageのモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('DetailedPainPointForm', () => {
  const mockPush = jest.fn()
  const mockBack = jest.fn()
  const defaultProps = {
    onSubmit: jest.fn(),
    isLoading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack
    })
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('全ての必須フィールドが表示される', () => {
    render(<DetailedPainPointForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument()
    expect(screen.getByLabelText(/状況/)).toBeInTheDocument()
    expect(screen.getByLabelText(/感じた不便さ/)).toBeInTheDocument()
    expect(screen.getByLabelText(/影響範囲/)).toBeInTheDocument()
    expect(screen.getByText('タグ')).toBeInTheDocument()
    expect(screen.getByText('重要度')).toBeInTheDocument()
    expect(screen.getByText('緊急度')).toBeInTheDocument()
  })

  it('初期データが正しく設定される', () => {
    const initialData = {
      title: 'テストタイトル',
      situation: 'テスト状況',
      inconvenience: 'テスト不便さ',
      impact_scope: 'テスト影響範囲',
      tags: ['タグ1', 'タグ2'],
      importance: 4,
      urgency: 3
    }

    render(<DetailedPainPointForm {...defaultProps} initialData={initialData} />)
    
    expect(screen.getByDisplayValue('テストタイトル')).toBeInTheDocument()
    expect(screen.getByDisplayValue('テスト状況')).toBeInTheDocument()
    expect(screen.getByDisplayValue('テスト不便さ')).toBeInTheDocument()
    expect(screen.getByDisplayValue('テスト影響範囲')).toBeInTheDocument()
    expect(screen.getByText('タグ1')).toBeInTheDocument()
    expect(screen.getByText('タグ2')).toBeInTheDocument()
  })

  it('必須フィールドが空の場合バリデーションエラーが表示される', async () => {
    render(<DetailedPainPointForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /保存/ })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument()
      expect(screen.getByText('状況の説明は必須です')).toBeInTheDocument()
      expect(screen.getByText('不便さの説明は必須です')).toBeInTheDocument()
      expect(screen.getByText('重要度を選択してください')).toBeInTheDocument()
      expect(screen.getByText('緊急度を選択してください')).toBeInTheDocument()
    })
  })

  it('文字数制限のバリデーションが機能する', async () => {
    render(<DetailedPainPointForm {...defaultProps} />)
    
    const titleInput = screen.getByLabelText(/タイトル/)
    const longTitle = 'a'.repeat(101) // 100文字制限を超える
    
    fireEvent.change(titleInput, { target: { value: longTitle } })
    
    const submitButton = screen.getByRole('button', { name: /保存/ })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('タイトルは100文字以内で入力してください')).toBeInTheDocument()
    })
  })

  it('フォーム送信が正常に動作する', async () => {
    const onSubmit = jest.fn().mockResolvedValue({ success: true })
    render(<DetailedPainPointForm {...defaultProps} onSubmit={onSubmit} />)
    
    // 必須フィールドを入力
    fireEvent.change(screen.getByLabelText(/タイトル/), { 
      target: { value: 'テストタイトル' } 
    })
    fireEvent.change(screen.getByLabelText(/状況/), { 
      target: { value: 'テスト状況' } 
    })
    fireEvent.change(screen.getByLabelText(/感じた不便さ/), { 
      target: { value: 'テスト不便さ' } 
    })
    
    // 重要度と緊急度を設定
    const importanceButtons = screen.getAllByLabelText(/段階/)
    fireEvent.click(importanceButtons[2]) // 3段階を選択
    fireEvent.click(importanceButtons[7]) // 緊急度の3段階を選択
    
    const submitButton = screen.getByRole('button', { name: /保存/ })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'テストタイトル',
        situation: 'テスト状況',
        inconvenience: 'テスト不便さ',
        impact_scope: '',
        tags: [],
        importance: 3,
        urgency: 3
      })
    })
  })

  it('編集モードでは更新ボタンが表示される', () => {
    render(<DetailedPainPointForm {...defaultProps} isEditing={true} />)
    
    expect(screen.getByRole('button', { name: /更新/ })).toBeInTheDocument()
  })

  it('ローディング中は送信ボタンが無効化される', () => {
    render(<DetailedPainPointForm {...defaultProps} isLoading={true} />)
    
    const submitButton = screen.getByRole('button', { name: /保存中/ })
    expect(submitButton).toBeDisabled()
  })

  it('キャンセルボタンでページが戻る', () => {
    render(<DetailedPainPointForm {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /キャンセル/ })
    fireEvent.click(cancelButton)
    
    expect(mockBack).toHaveBeenCalled()
  })

  it('変更がある場合キャンセル時に確認ダイアログが表示される', () => {
    // confirm関数をモック
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
    
    render(<DetailedPainPointForm {...defaultProps} />)
    
    // フォームに変更を加える
    fireEvent.change(screen.getByLabelText(/タイトル/), { 
      target: { value: 'テスト' } 
    })
    
    const cancelButton = screen.getByRole('button', { name: /キャンセル/ })
    fireEvent.click(cancelButton)
    
    expect(confirmSpy).toHaveBeenCalledWith('編集中の内容が失われますが、よろしいですか？')
    expect(mockBack).toHaveBeenCalled()
    
    confirmSpy.mockRestore()
  })

  it('下書き自動保存が機能する', async () => {
    jest.useFakeTimers()
    
    render(<DetailedPainPointForm {...defaultProps} />)
    
    // フォームに入力
    fireEvent.change(screen.getByLabelText(/タイトル/), { 
      target: { value: 'テストタイトル' } 
    })
    
    // 1秒経過
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'painpoint_draft',
        expect.stringContaining('テストタイトル')
      )
    })
    
    jest.useRealTimers()
  })

  it('下書きクリア機能が動作する', () => {
    render(<DetailedPainPointForm {...defaultProps} />)
    
    // フォームに入力して下書き状態にする
    fireEvent.change(screen.getByLabelText(/タイトル/), { 
      target: { value: 'テスト' } 
    })
    
    // 下書きクリアボタンをクリック
    const clearButton = screen.getByText('下書きをクリア')
    fireEvent.click(clearButton)
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('painpoint_draft')
    expect(screen.getByLabelText(/タイトル/)).toHaveValue('')
  })

  it('保存成功時に下書きが削除される', async () => {
    const onSubmit = jest.fn().mockResolvedValue({ success: true })
    render(<DetailedPainPointForm {...defaultProps} onSubmit={onSubmit} />)
    
    // 必須フィールドを入力
    fireEvent.change(screen.getByLabelText(/タイトル/), { 
      target: { value: 'テストタイトル' } 
    })
    fireEvent.change(screen.getByLabelText(/状況/), { 
      target: { value: 'テスト状況' } 
    })
    fireEvent.change(screen.getByLabelText(/感じた不便さ/), { 
      target: { value: 'テスト不便さ' } 
    })
    
    // 重要度と緊急度を設定
    const importanceButtons = screen.getAllByLabelText(/段階/)
    fireEvent.click(importanceButtons[2])
    fireEvent.click(importanceButtons[7])
    
    const submitButton = screen.getByRole('button', { name: /保存/ })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('painpoint_draft')
    })
  })

  it('文字数カウンターが正しく表示される', () => {
    render(<DetailedPainPointForm {...defaultProps} />)
    
    expect(screen.getByText('0/100文字')).toBeInTheDocument() // タイトル
    expect(screen.getAllByText('0/500文字')).toHaveLength(2) // 状況と不便さ
    expect(screen.getByText('0/300文字')).toBeInTheDocument() // 影響範囲
  })
})