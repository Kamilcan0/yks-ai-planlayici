/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PlanCard } from '../PlanCard'
import { AuthProvider } from '../auth/AuthProvider'

// Mock the API functions
jest.mock('../../lib/api', () => ({
  saveProgress: jest.fn().mockResolvedValue({
    progress: { id: 'test-progress' },
    adaptive_trigger: false
  })
}))

// Mock the auth hook
const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  isGuest: false
}

jest.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({
    user: mockUser,
    profile: null,
    loading: false,
    signOut: jest.fn(),
    setProfile: jest.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

const mockDay = {
  gün: 'Pazartesi',
  TYT: [
    {
      konu: 'Matematik',
      soru_sayısı: 25,
      süre_dakika: 90,
      odak_konular: ['Fonksiyonlar', 'Denklemler'],
      confidence: 0.85,
      not: 'Test notu',
      blok_id: 'math_tyt_1'
    }
  ],
  AYT: [
    {
      konu: 'Fizik',
      soru_sayısı: 15,
      süre_dakika: 60,
      odak_konular: ['Kuvvet', 'Hareket'],
      confidence: 0.72,
      blok_id: 'physics_ayt_1'
    }
  ]
}

const mockResources = [
  {
    konu: 'Matematik',
    tip: 'soru_bankası' as const,
    isim: 'Test Matematik Soru Bankası',
    zorluk: 'orta' as const,
    beklenen_süre_dakika: 120,
    öncelik: 5,
    repeat_after_days: 3
  }
]

describe('PlanCard', () => {
  it('renders day plan correctly', () => {
    render(
      <PlanCard 
        day={mockDay} 
        kaynak_önerileri={mockResources}
        planId="test-plan" 
      />
    )

    expect(screen.getByText('Pazartesi')).toBeInTheDocument()
    expect(screen.getByText('90 dk')).toBeInTheDocument()
    expect(screen.getByText('25 soru')).toBeInTheDocument()
    expect(screen.getByText('Matematik')).toBeInTheDocument()
  })

  it('expands to show detailed view when clicked', async () => {
    render(
      <PlanCard 
        day={mockDay} 
        kaynak_önerileri={mockResources}
        planId="test-plan" 
      />
    )

    // Click to expand
    fireEvent.click(screen.getByText('Pazartesi'))

    // Wait for animation and check if detailed content appears
    await waitFor(() => {
      expect(screen.getByText('TYT (1 blok)')).toBeInTheDocument()
      expect(screen.getByText('AYT (1 blok)')).toBeInTheDocument()
      expect(screen.getByText('Fonksiyonlar')).toBeInTheDocument()
      expect(screen.getByText('Test notu')).toBeInTheDocument()
    })
  })

  it('shows resource recommendations when expanded', async () => {
    render(
      <PlanCard 
        day={mockDay} 
        kaynak_önerileri={mockResources}
        planId="test-plan" 
      />
    )

    // Expand the card
    fireEvent.click(screen.getByText('Pazartesi'))

    await waitFor(() => {
      expect(screen.getByText('Önerilen Kaynaklar')).toBeInTheDocument()
      expect(screen.getByText('Test Matematik Soru Bankası')).toBeInTheDocument()
    })
  })

  it('handles progress completion toggle', async () => {
    const onProgressUpdate = jest.fn()
    
    render(
      <PlanCard 
        day={mockDay} 
        kaynak_önerileri={mockResources}
        planId="test-plan"
        onProgressUpdate={onProgressUpdate}
      />
    )

    // Expand to see study blocks
    fireEvent.click(screen.getByText('Pazartesi'))

    await waitFor(() => {
      const completeButtons = screen.getAllByRole('button')
      const mathCompleteButton = completeButtons.find(button => 
        button.closest('[class*="p-4"]')?.textContent?.includes('Matematik')
      )
      
      if (mathCompleteButton) {
        fireEvent.click(mathCompleteButton)
      }
    })

    // Should call onProgressUpdate
    await waitFor(() => {
      expect(onProgressUpdate).toHaveBeenCalledWith('math_tyt_1', true)
    })
  })

  it('displays confidence levels correctly', async () => {
    render(
      <PlanCard 
        day={mockDay} 
        kaynak_önerileri={mockResources}
        planId="test-plan" 
      />
    )

    // Expand the card
    fireEvent.click(screen.getByText('Pazartesi'))

    await waitFor(() => {
      expect(screen.getByText('Yüksek')).toBeInTheDocument() // 0.85 confidence
      expect(screen.getByText('Orta')).toBeInTheDocument() // 0.72 confidence
    })
  })

  it('shows progress bar correctly', () => {
    render(
      <PlanCard 
        day={mockDay} 
        kaynak_önerileri={mockResources}
        planId="test-plan" 
      />
    )

    // Should show 0/2 completed initially
    expect(screen.getByText('0/2')).toBeInTheDocument()
  })
})

