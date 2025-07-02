import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import RatingSelector from '@/components/RatingSelector'

describe('RatingSelector', () => {
  const defaultProps = {
    label: 'テスト評価',
    value: 0,
    onChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('ラベルが表示される', () => {
    render(<RatingSelector {...defaultProps} />)
    expect(screen.getByText('テスト評価')).toBeInTheDocument()
  })

  it('必須マークが表示される', () => {
    render(<RatingSelector {...defaultProps} required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('説明文が表示される', () => {
    const description = 'テストの説明文'
    render(<RatingSelector {...defaultProps} description={description} />)
    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('5つの評価ボタンが表示される', () => {
    render(<RatingSelector {...defaultProps} />)
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByLabelText(`${i}段階`)).toBeInTheDocument()
    }
  })

  it('評価ボタンをクリックするとonChangeが呼ばれる', () => {
    const onChange = jest.fn()
    render(<RatingSelector {...defaultProps} onChange={onChange} />)
    
    fireEvent.click(screen.getByLabelText('3段階'))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('選択された値が正しく表示される', () => {
    render(<RatingSelector {...defaultProps} value={4} />)
    
    const button = screen.getByLabelText('4段階')
    expect(button).toHaveClass('bg-blue-500')
  })

  it('無効化されたボタンはクリックできない', () => {
    const onChange = jest.fn()
    render(<RatingSelector {...defaultProps} onChange={onChange} disabled />)
    
    fireEvent.click(screen.getByLabelText('3段階'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('マウスホバーで適切なラベルが表示される', () => {
    render(<RatingSelector {...defaultProps} />)
    
    const button = screen.getByLabelText('4段階')
    fireEvent.mouseEnter(button)
    
    expect(screen.getByText('やや高い')).toBeInTheDocument()
  })

  it('値に応じた適切なラベルが表示される', () => {
    render(<RatingSelector {...defaultProps} value={1} />)
    expect(screen.getByText('低い')).toBeInTheDocument()
    
    render(<RatingSelector {...defaultProps} value={5} />)
    expect(screen.getByText('高い')).toBeInTheDocument()
  })
})