import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TagInput from '@/components/TagInput'

describe('TagInput', () => {
  const defaultProps = {
    label: 'テストタグ',
    value: [],
    onChange: jest.fn(),
    suggestions: ['タグ1', 'タグ2', 'タグ3']
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('ラベルが表示される', () => {
    render(<TagInput {...defaultProps} />)
    expect(screen.getByText('テストタグ')).toBeInTheDocument()
  })

  it('必須マークが表示される', () => {
    render(<TagInput {...defaultProps} required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('説明文が表示される', () => {
    const description = 'タグの説明文'
    render(<TagInput {...defaultProps} description={description} />)
    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('既存のタグが表示される', () => {
    const tags = ['既存タグ1', '既存タグ2']
    render(<TagInput {...defaultProps} value={tags} />)
    
    expect(screen.getByText('既存タグ1')).toBeInTheDocument()
    expect(screen.getByText('既存タグ2')).toBeInTheDocument()
  })

  it('入力フィールドにテキストを入力できる', () => {
    render(<TagInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'テスト入力' } })
    
    expect(input).toHaveValue('テスト入力')
  })

  it('Enterキーでタグが追加される', () => {
    const onChange = jest.fn()
    render(<TagInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '新しいタグ' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(onChange).toHaveBeenCalledWith(['新しいタグ'])
  })

  it('重複したタグは追加されない', () => {
    const onChange = jest.fn()
    const existingTags = ['既存タグ']
    render(<TagInput {...defaultProps} value={existingTags} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '既存タグ' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(onChange).not.toHaveBeenCalled()
  })

  it('空文字のタグは追加されない', () => {
    const onChange = jest.fn()
    render(<TagInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(onChange).not.toHaveBeenCalled()
  })

  it('タグの削除ボタンが機能する', () => {
    const onChange = jest.fn()
    const tags = ['タグ1', 'タグ2']
    render(<TagInput {...defaultProps} value={tags} onChange={onChange} />)
    
    const removeButtons = screen.getAllByText('×')
    fireEvent.click(removeButtons[0])
    
    expect(onChange).toHaveBeenCalledWith(['タグ2'])
  })

  it('最大タグ数に達すると入力フィールドが無効化される', () => {
    const maxTags = 2
    const tags = ['タグ1', 'タグ2']
    render(<TagInput {...defaultProps} value={tags} maxTags={maxTags} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('最大タグ数の警告メッセージが表示される', () => {
    const maxTags = 2
    const tags = ['タグ1', 'タグ2']
    render(<TagInput {...defaultProps} value={tags} maxTags={maxTags} />)
    
    expect(screen.getByText(`最大${maxTags}個までタグを追加できます`)).toBeInTheDocument()
  })

  it('入力に応じて候補が絞り込まれる', async () => {
    render(<TagInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'タグ1' } })
    
    await waitFor(() => {
      expect(screen.getByText('タグ1')).toBeInTheDocument()
    })
    
    expect(screen.queryByText('タグ2')).not.toBeInTheDocument()
  })

  it('候補をクリックしてタグを追加できる', async () => {
    const onChange = jest.fn()
    render(<TagInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'タグ' } })
    
    await waitFor(() => {
      const suggestion = screen.getByText('タグ1')
      fireEvent.click(suggestion)
    })
    
    expect(onChange).toHaveBeenCalledWith(['タグ1'])
  })

  it('ArrowDownキーで候補を選択できる', async () => {
    render(<TagInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'タグ' } })
    
    await waitFor(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
    })
    
    const firstSuggestion = screen.getByText('タグ1')
    expect(firstSuggestion.parentElement).toHaveClass('bg-blue-50')
  })

  it('ArrowUpキーで候補を選択できる', async () => {
    render(<TagInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'タグ' } })
    
    await waitFor(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' })
    })
    
    const firstSuggestion = screen.getByText('タグ1')
    expect(firstSuggestion.parentElement).toHaveClass('bg-blue-50')
  })

  it('Escapeキーで候補リストが閉じる', async () => {
    render(<TagInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'タグ' } })
    
    await waitFor(() => {
      expect(screen.getByText('タグ1')).toBeInTheDocument()
    })
    
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })
    
    await waitFor(() => {
      expect(screen.queryByText('タグ1')).not.toBeInTheDocument()
    })
  })

  it('無効化された状態では操作できない', () => {
    const onChange = jest.fn()
    render(<TagInput {...defaultProps} onChange={onChange} disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    
    fireEvent.change(input, { target: { value: '新しいタグ' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(onChange).not.toHaveBeenCalled()
  })
})