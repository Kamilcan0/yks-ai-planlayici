/**
 * @jest-environment jsdom
 */
import { generatePlan, AdaptiveScheduler, SpacedRepetitionEngine, ConfidenceScorer } from '../api'

// Mock fetch
global.fetch = jest.fn()

describe('API Functions', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('generatePlan', () => {
    it('generates a plan successfully', async () => {
      const mockResponse = {
        success: true,
        plan: {
          kullanıcı_ID: 'test-user',
          tarih: '2024-01-15',
          haftalık_plan: [
            {
              gün: 'Pazartesi',
              TYT: [
                {
                  konu: 'Matematik',
                  soru_sayısı: 20,
                  süre_dakika: 90,
                  odak_konular: ['Fonksiyonlar'],
                  confidence: 0.8
                }
              ],
              AYT: []
            }
          ],
          kaynak_önerileri: [],
          confidence_overall: 0.8
        },
        mock_mode: false
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const userData = {
        kullanıcı_ID: 'test-user',
        seviye: 'orta',
        haftalık_saat: 25,
        hedef_tarih: '2024-06-15'
      }

      const result = await generatePlan(userData)

      expect(fetch).toHaveBeenCalledWith(
        '/.netlify/functions/generate-plan',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
      )

      expect(result.plan).toBeDefined()
      expect(result.plan.kullanıcı_ID).toBe('test-user')
      expect(result.plan.haftalık_plan[0].TYT[0].blok_id).toBeDefined()
    })

    it('handles API errors gracefully', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const userData = {
        kullanıcı_ID: 'test-user',
        seviye: 'orta',
        haftalık_saat: 25,
        hedef_tarih: '2024-06-15'
      }

      await expect(generatePlan(userData)).rejects.toThrow('HTTP error! status: 500')
    })

    it('handles network errors', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const userData = {
        kullanıcı_ID: 'test-user',
        seviye: 'orta',
        haftalık_saat: 25,
        hedef_tarih: '2024-06-15'
      }

      await expect(generatePlan(userData)).rejects.toThrow('Network error')
    })
  })
})

describe('AdaptiveScheduler', () => {
  it('optimizes block distribution correctly', () => {
    const mockPlan = {
      kullanıcı_ID: 'test-user',
      tarih: '2024-01-15',
      haftalık_plan: [
        {
          gün: 'Pazartesi',
          TYT: [
            {
              konu: 'Matematik',
              soru_sayısı: 20,
              süre_dakika: 180, // Too much for daily target
              odak_konular: ['Fonksiyonlar'],
              confidence: 0.8
            }
          ],
          AYT: [
            {
              konu: 'Fizik',
              soru_sayısı: 15,
              süre_dakika: 120,
              odak_konular: ['Kuvvet'],
              confidence: 0.7
            }
          ]
        },
        {
          gün: 'Pazar',
          TYT: [],
          AYT: []
        }
      ],
      kaynak_önerileri: [],
      confidence_overall: 0.75
    }

    const optimizedPlan = AdaptiveScheduler.optimizeBlockDistribution(20, mockPlan) // 20 hours per week

    expect(optimizedPlan).toBeDefined()
    expect(optimizedPlan.haftalık_plan).toHaveLength(2)
    
    // Sunday should remain empty (rest day)
    const sunday = optimizedPlan.haftalık_plan.find(day => day.gün === 'Pazar')
    expect(sunday?.TYT).toHaveLength(0)
    expect(sunday?.AYT).toHaveLength(0)
  })
})

describe('SpacedRepetitionEngine', () => {
  it('calculates next review date correctly', () => {
    const lastReview = new Date('2024-01-01')
    const nextReview = SpacedRepetitionEngine.calculateNextReview(lastReview, 2, 0.8)

    expect(nextReview).toBeInstanceOf(Date)
    expect(nextReview.getTime()).toBeGreaterThan(lastReview.getTime())
  })

  it('generates repetition hints', () => {
    const resources = [
      {
        konu: 'Matematik',
        tip: 'soru_bankası' as const,
        isim: 'Test Soru Bankası',
        zorluk: 'orta' as const,
        beklenen_süre_dakika: 120,
        öncelik: 5,
        repeat_after_days: 3
      }
    ]

    const hints = SpacedRepetitionEngine.getRepetitionHints(resources)

    expect(hints).toHaveLength(1)
    expect(hints[0]).toContain('Test Soru Bankası')
    expect(hints[0]).toContain('3 gün sonra')
  })
})

describe('ConfidenceScorer', () => {
  it('calculates confidence based on level', () => {
    const confidence1 = ConfidenceScorer.calculateBlockConfidence('Matematik', 'başlangıç')
    const confidence2 = ConfidenceScorer.calculateBlockConfidence('Matematik', 'ileri')

    expect(confidence1).toBeLessThan(confidence2)
    expect(confidence1).toBeGreaterThanOrEqual(0)
    expect(confidence2).toBeLessThanOrEqual(1)
  })

  it('adjusts confidence based on previous performance', () => {
    const baseConfidence = ConfidenceScorer.calculateBlockConfidence('Matematik', 'orta')
    const adjustedConfidence = ConfidenceScorer.calculateBlockConfidence('Matematik', 'orta', [0.9, 0.8, 0.85])

    expect(adjustedConfidence).toBeGreaterThan(baseConfidence)
  })

  it('estimates difficulty correctly', () => {
    expect(ConfidenceScorer.getDifficultyEstimate(0.9)).toBe('kolay')
    expect(ConfidenceScorer.getDifficultyEstimate(0.7)).toBe('orta')
    expect(ConfidenceScorer.getDifficultyEstimate(0.5)).toBe('zor')
  })
})

