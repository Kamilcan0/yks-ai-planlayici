import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'

// Mock the firebase functions
jest.mock('@/lib/firebase', () => ({
  signInWithEmail: jest.fn(),
  signInWithGoogle: jest.fn()
}))

// Mock the debounce hook
jest.mock('@/hooks/useDebouncedState', () => ({
  useDebouncedState: (value: any) => [value, jest.fn()]
}))

const mockOnSuccess = jest.fn()

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form with email and password fields', () => {
    render(<LoginForm onSuccess={mockOnSuccess} />)
    
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument()
  })

  it('shows loading state when submit button is clicked', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSuccess={mockOnSuccess} />)
    
    const emailInput = screen.getByLabelText(/e-posta/i)
    const passwordInput = screen.getByLabelText(/şifre/i)
    const submitButton = screen.getByRole('button', { name: /giriş yap/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/işleniyor/i)).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSuccess={mockOnSuccess} />)
    
    const emailInput = screen.getByLabelText(/e-posta/i)
    await user.type(emailInput, 'invalid-email')
    
    // Wait for validation to trigger
    await waitFor(() => {
      expect(screen.getByText(/geçerli bir e-posta adresi girin/i)).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSuccess={mockOnSuccess} />)
    
    const passwordInput = screen.getByLabelText(/şifre/i)
    await user.type(passwordInput, '123')
    
    // Wait for validation to trigger
    await waitFor(() => {
      expect(screen.getByText(/şifre en az 6 karakter olmalı/i)).toBeInTheDocument()
    })
  })

  it('shows error message for invalid credentials', async () => {
    const user = userEvent.setup()
    const { signInWithEmail } = require('@/lib/firebase')
    
    signInWithEmail.mockRejectedValueOnce(new Error('Invalid credentials'))
    
    render(<LoginForm onSuccess={mockOnSuccess} />)
    
    const emailInput = screen.getByLabelText(/e-posta/i)
    const passwordInput = screen.getByLabelText(/şifre/i)
    const submitButton = screen.getByRole('button', { name: /giriş yap/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('calls onSuccess when login is successful', async () => {
    const user = userEvent.setup()
    const { signInWithEmail } = require('@/lib/firebase')
    
    signInWithEmail.mockResolvedValueOnce({})
    
    render(<LoginForm onSuccess={mockOnSuccess} />)
    
    const emailInput = screen.getByLabelText(/e-posta/i)
    const passwordInput = screen.getByLabelText(/şifre/i)
    const submitButton = screen.getByRole('button', { name: /giriş yap/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSuccess={mockOnSuccess} />)
    
    const passwordInput = screen.getByLabelText(/şifre/i) as HTMLInputElement
    const toggleButton = screen.getByLabelText(/şifreyi göster/i)
    
    expect(passwordInput.type).toBe('password')
    
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('text')
    
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('prevents double submission', async () => {
    const user = userEvent.setup()
    const { signInWithEmail } = require('@/lib/firebase')
    
    // Mock a slow response
    signInWithEmail.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    )
    
    render(<LoginForm onSuccess={mockOnSuccess} />)
    
    const emailInput = screen.getByLabelText(/e-posta/i)
    const passwordInput = screen.getByLabelText(/şifre/i)
    const submitButton = screen.getByRole('button', { name: /giriş yap/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    // Click submit button multiple times quickly
    await user.click(submitButton)
    await user.click(submitButton)
    await user.click(submitButton)
    
    // Should only be called once
    await waitFor(() => {
      expect(signInWithEmail).toHaveBeenCalledTimes(1)
    })
  })

  it('handles Google sign in', async () => {
    const user = userEvent.setup()
    const { signInWithGoogle } = require('@/lib/firebase')
    
    signInWithGoogle.mockResolvedValueOnce({})
    
    render(<LoginForm onSuccess={mockOnSuccess} />)
    
    const googleButton = screen.getByRole('button', { name: /google ile giriş yap/i })
    await user.click(googleButton)
    
    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled()
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })
})
