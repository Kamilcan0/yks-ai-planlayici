import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthButton } from '../AuthButton'

describe('AuthButton', () => {
  it('renders button with children', () => {
    render(<AuthButton>Test Button</AuthButton>)
    expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument()
  })

  it('shows loading spinner when loading is true', () => {
    render(<AuthButton loading={true}>Loading Button</AuthButton>)
    
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText(/loading button/i)).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<AuthButton disabled={true}>Disabled Button</AuthButton>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-60')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<AuthButton onClick={handleClick}>Clickable Button</AuthButton>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<AuthButton onClick={handleClick} disabled={true}>Disabled Button</AuthButton>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<AuthButton onClick={handleClick} loading={true}>Loading Button</AuthButton>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<AuthButton className="custom-class">Button</AuthButton>)
    
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('applies correct variant styles', () => {
    const { rerender } = render(<AuthButton variant="outline">Outline Button</AuthButton>)
    expect(screen.getByRole('button')).toHaveClass('border-input')
    
    rerender(<AuthButton variant="ghost">Ghost Button</AuthButton>)
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')
  })

  it('applies correct size styles', () => {
    const { rerender } = render(<AuthButton size="sm">Small Button</AuthButton>)
    expect(screen.getByRole('button')).toHaveClass('h-9')
    
    rerender(<AuthButton size="lg">Large Button</AuthButton>)
    expect(screen.getByRole('button')).toHaveClass('h-11')
  })

  it('has proper accessibility attributes', () => {
    render(
      <AuthButton 
        ariaLabel="Custom aria label"
        loading={true}
      >
        Button
      </AuthButton>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Custom aria label')
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('has touch manipulation styles', () => {
    render(<AuthButton>Touch Button</AuthButton>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveStyle('touch-action: manipulation')
  })
})
