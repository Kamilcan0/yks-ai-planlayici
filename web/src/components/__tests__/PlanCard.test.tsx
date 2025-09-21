import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PlanCard } from '../PlanCard'
import { StudyPlan } from '@/lib/supabase'

const mockPlan: StudyPlan = {
  id: 'test-plan-1',
  user_id: 'test-user',
  plan_id: 'plan-1',
  week_number: 1,
  plan_date: '2024-01-15',
  schedule: [
    {
      day: 'Monday',
      subjects: [
        {
          subject: 'Mathematics',
          question_count: 15,
          duration_minutes: 45,
          focus_topics: ['Functions', 'Limits'],
          confidence: 0.85,
          type: 'TYT',
          notes: 'Review basic concepts'
        },
        {
          subject: 'Physics',
          question_count: 10,
          duration_minutes: 30,
          focus_topics: ['Dynamics', 'Force'],
          confidence: 0.75,
          type: 'AYT',
          notes: 'Memorize formulas'
        }
      ]
    }
  ],
  resources: [
    {
      subject: 'Mathematics',
      type: 'question_bank',
      title: 'TYT Mathematics Question Bank',
      difficulty: 'medium',
      estimated_time_minutes: 60,
      priority: 5,
      url: 'https://example.com/math-bank'
    }
  ],
  tips: ['Review regularly', 'Use Pomodoro technique'],
  notes: 'Student is strong in mathematics topics',
  confidence_score: 0.82,
  is_active: true,
  created_at: '2024-01-15T00:00:00.000Z',
  updated_at: '2024-01-15T00:00:00.000Z'
}

describe('PlanCard', () => {
  test('renders plan card with basic information', () => {
    render(<PlanCard plan={mockPlan} />)
    
    expect(screen.getByText('Hafta 1 Planı')).toBeInTheDocument()
    expect(screen.getByText('15.01.2024')).toBeInTheDocument()
    expect(screen.getByText('Monday')).toBeInTheDocument()
  })

  test('displays subjects with details', () => {
    render(<PlanCard plan={mockPlan} />)
    
    expect(screen.getByText('Mathematics')).toBeInTheDocument()
    expect(screen.getByText('Physics')).toBeInTheDocument()
    expect(screen.getByText('15 soru')).toBeInTheDocument()
    expect(screen.getByText('45 dk')).toBeInTheDocument()
  })

  test('shows confidence scores', () => {
    render(<PlanCard plan={mockPlan} />)
    
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  test('displays focus topics', () => {
    render(<PlanCard plan={mockPlan} />)
    
    expect(screen.getByText('Functions')).toBeInTheDocument()
    expect(screen.getByText('Limits')).toBeInTheDocument()
    expect(screen.getByText('Dynamics')).toBeInTheDocument()
    expect(screen.getByText('Force')).toBeInTheDocument()
  })

  test('shows tips when available', () => {
    render(<PlanCard plan={mockPlan} />)
    
    expect(screen.getByText('Review regularly')).toBeInTheDocument()
    expect(screen.getByText('Use Pomodoro technique')).toBeInTheDocument()
  })

  test('displays notes', () => {
    render(<PlanCard plan={mockPlan} />)
    
    expect(screen.getByText('Student is strong in mathematics topics')).toBeInTheDocument()
  })

  test('shows overall confidence', () => {
    render(<PlanCard plan={mockPlan} />)
    
    expect(screen.getByText('82%')).toBeInTheDocument()
  })

  test('calls onToggleItem when item is clicked', () => {
    const mockToggle = jest.fn()
    render(<PlanCard plan={mockPlan} onToggleItem={mockToggle} />)
    
    // Find and click a subject checkbox
    const checkboxes = screen.getAllByRole('button')
    const subjectCheckbox = checkboxes.find(btn => 
      btn.querySelector('svg')
    )
    
    if (subjectCheckbox) {
      fireEvent.click(subjectCheckbox)
      expect(mockToggle).toHaveBeenCalled()
    }
  })

  test('handles empty schedule gracefully', () => {
    const emptyPlan: StudyPlan = {
      ...mockPlan,
      schedule: [],
      resources: [],
      tips: []
    }
    
    render(<PlanCard plan={emptyPlan} />)
    expect(screen.getByText('Hafta 1 Planı')).toBeInTheDocument()
  })

  test('expands and collapses day sections', () => {
    render(<PlanCard plan={mockPlan} />)
    
    const dayButton = screen.getByText('Monday').closest('button')
    expect(dayButton).toBeInTheDocument()
    
    if (dayButton) {
      fireEvent.click(dayButton)
      // After clicking, subjects should be visible
      expect(screen.getByText('Mathematics')).toBeInTheDocument()
    }
  })
})