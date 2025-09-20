/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OnboardingModal } from '../OnboardingModal'

// Mock the auth hook
jest.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user', name: 'Test User', email: 'test@example.com', isGuest: false },
    profile: null,
    loading: false,
    signOut: jest.fn(),
    setProfile: jest.fn()
  })
}))

// Mock Firebase functions
jest.mock('../../lib/firebase', () => ({
  updateUserProfile: jest.fn().mockResolvedValue({}),
  saveGuestProfile: jest.fn()
}))

describe('OnboardingModal', () => {
  const mockOnComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders first step (name input) when opened', () => {
    render(
      <OnboardingModal 
        isOpen={true} 
        onComplete={mockOnComplete} 
      />
    )

    expect(screen.getByText('Merhaba! 👋')).toBeInTheDocument()
    expect(screen.getByText('Kendini tanıtalım')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Adını yaz...')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <OnboardingModal 
        isOpen={false} 
        onComplete={mockOnComplete} 
      />
    )

    expect(screen.queryByText('Merhaba! 👋')).not.toBeInTheDocument()
  })

  it('navigates through steps correctly', async () => {
    render(
      <OnboardingModal 
        isOpen={true} 
        onComplete={mockOnComplete} 
      />
    )

    // Fill name
    const nameInput = screen.getByPlaceholderText('Adını yaz...')
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })

    // Go to next step
    const nextButton = screen.getByText('İleri')
    fireEvent.click(nextButton)

    // Should be on level selection step
    await waitFor(() => {
      expect(screen.getByText('Seviyeni Belirle 📚')).toBeInTheDocument()
      expect(screen.getByText('Başlangıç')).toBeInTheDocument()
      expect(screen.getByText('Orta Seviye')).toBeInTheDocument()
      expect(screen.getByText('İleri Seviye')).toBeInTheDocument()
    })
  })

  it('prevents progression with empty required fields', () => {
    render(
      <OnboardingModal 
        isOpen={true} 
        onComplete={mockOnComplete} 
      />
    )

    const nextButton = screen.getByText('İleri')
    expect(nextButton).toBeDisabled()
  })

  it('enables progression when required fields are filled', async () => {
    render(
      <OnboardingModal 
        isOpen={true} 
        onComplete={mockOnComplete} 
      />
    )

    // Fill name
    const nameInput = screen.getByPlaceholderText('Adını yaz...')
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })

    const nextButton = screen.getByText('İleri')
    expect(nextButton).not.toBeDisabled()
  })

  it('allows back navigation', async () => {
    render(
      <OnboardingModal 
        isOpen={true} 
        onComplete={mockOnComplete} 
      />
    )

    // Fill name and go to step 2
    const nameInput = screen.getByPlaceholderText('Adını yaz...')
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.click(screen.getByText('İleri'))

    // Go back
    await waitFor(() => {
      const backButton = screen.getByText('Geri')
      fireEvent.click(backButton)
    })

    // Should be back to step 1
    await waitFor(() => {
      expect(screen.getByText('Merhaba! 👋')).toBeInTheDocument()
    })
  })

  it('selects level correctly', async () => {
    render(
      <OnboardingModal 
        isOpen={true} 
        onComplete={mockOnComplete} 
      />
    )

    // Go to level selection
    const nameInput = screen.getByPlaceholderText('Adını yaz...')
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.click(screen.getByText('İleri'))

    // Select orta level
    await waitFor(() => {
      const ortaButton = screen.getByText('Orta Seviye').closest('button')
      if (ortaButton) {
        fireEvent.click(ortaButton)
      }
    })

    // Should show selection feedback
    await waitFor(() => {
      const ortaButton = screen.getByText('Orta Seviye').closest('button')
      expect(ortaButton).toHaveClass('border-primary')
    })
  })

  it('updates weekly hours with slider', async () => {
    render(
      <OnboardingModal 
        isOpen={true} 
        onComplete={mockOnComplete} 
      />
    )

    // Navigate to hours step
    const nameInput = screen.getByPlaceholderText('Adını yaz...')
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.click(screen.getByText('İleri'))

    await waitFor(() => {
      const ortaButton = screen.getByText('Orta Seviye').closest('button')
      if (ortaButton) {
        fireEvent.click(ortaButton)
      }
    })

    fireEvent.click(screen.getByText('İleri'))

    // Should be on hours step
    await waitFor(() => {
      expect(screen.getByText('Çalışma Süren ⏰')).toBeInTheDocument()
      expect(screen.getByText('20 saat')).toBeInTheDocument() // Default value
    })

    // Change hours
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '30' } })

    expect(screen.getByText('30 saat')).toBeInTheDocument()
  })

  it('completes onboarding successfully', async () => {
    render(
      <OnboardingModal 
        isOpen={true} 
        onComplete={mockOnComplete} 
      />
    )

    // Fill all steps
    const nameInput = screen.getByPlaceholderText('Adını yaz...')
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.click(screen.getByText('İleri'))

    // Level
    await waitFor(() => {
      const ortaButton = screen.getByText('Orta Seviye').closest('button')
      if (ortaButton) {
        fireEvent.click(ortaButton)
      }
    })
    fireEvent.click(screen.getByText('İleri'))

    // Hours (keep default)
    await waitFor(() => {
      fireEvent.click(screen.getByText('İleri'))
    })

    // Date
    await waitFor(() => {
      const dateInput = screen.getByDisplayValue(/2024-06-15/)
      expect(dateInput).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('İleri'))

    // Field
    await waitFor(() => {
      const sayisalButton = screen.getByText('Sayısal').closest('button')
      if (sayisalButton) {
        fireEvent.click(sayisalButton)
      }
    })

    // Complete
    await waitFor(() => {
      const completeButton = screen.getByText('Tamamla')
      fireEvent.click(completeButton)
    })

    // Should call onComplete
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })

  it('shows progress correctly', async () => {
    render(
      <OnboardingModal 
        isOpen={true} 
        onComplete={mockOnComplete} 
      />
    )

    // Should show 1/5 initially
    expect(screen.getByText('1 / 5')).toBeInTheDocument()

    // Go to next step
    const nameInput = screen.getByPlaceholderText('Adını yaz...')
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.click(screen.getByText('İleri'))

    // Should show 2/5
    await waitFor(() => {
      expect(screen.getByText('2 / 5')).toBeInTheDocument()
    })
  })
})

