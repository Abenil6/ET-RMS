import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoopingTitle } from './LoopingTitle'

describe('LoopingTitle', () => {
  it('should render text with letter spans', () => {
    render(<LoopingTitle text="Hello" className="test-class" />)

    const heading = screen.getByRole('heading')
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveClass('test-class')

    const spans = heading.querySelectorAll('span')
    expect(spans).toHaveLength(5)
  })

  it('should convert spaces to non-breaking spaces', () => {
    render(<LoopingTitle text="Hello World" />)

    const heading = screen.getByRole('heading')
    expect(heading.textContent).toContain('\u00A0')
  })

  it('should apply highlight class to highlighted text', () => {
    render(
      <LoopingTitle
        text="Hello World"
        highlight="World"
        highlightClass="text-green"
      />
    )

    const heading = screen.getByRole('heading')
    const spans = heading.querySelectorAll('span')

    const worldSpans = Array.from(spans).slice(6)
    worldSpans.forEach((span) => {
      expect(span).toHaveClass('text-green')
    })
  })

  it('should insert line break before highlight', () => {
    render(<LoopingTitle text="Hello World" highlight="World" />)

    const heading = screen.getByRole('heading')
    const br = heading.querySelector('br')

    expect(br).toBeInTheDocument()
  })

  it('should render without highlight when not provided', () => {
    render(<LoopingTitle text="Simple Text" />)

    const heading = screen.getByRole('heading')
    const br = heading.querySelector('br')

    expect(br).not.toBeInTheDocument()
  })
})
