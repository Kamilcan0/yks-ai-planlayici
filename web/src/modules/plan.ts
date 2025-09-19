export type PlanBlock = { time: string; subject: string }
export type PlanDay = { day: string; blocks: PlanBlock[] }

const templateTimes = [
  '09:00-10:30', '11:00-12:30', '14:00-15:30', '16:00-17:30', '18:00-19:30', '20:00-21:30'
]

const days = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar']

export function generateWeeklyTemplate(track: string, level: number): PlanDay[] {
  const core = track === 'sayisal'
    ? ['Matematik','Fizik','Kimya','Biyoloji','Geometri','TYT Deneme']
    : track === 'ea'
    ? ['Matematik','Edebiyat','Tarih','Coğrafya','Geometri','TYT Deneme']
    : track === 'sozel'
    ? ['Edebiyat','Tarih','Coğrafya','Türkçe Paragraf','Vatandaşlık','TYT Deneme']
    : ['YDT Vocabulary','Grammar','Reading','Use of English','Listening','Deneme']

  const plan: PlanDay[] = []
  for (let i=0;i<7;i++){
    const blocks = templateTimes.map((t,idx)=> ({ time: t, subject: core[(idx+i)%core.length] }))
    // Akşam bloklarını seviyeye göre tekrar/analiz olarak ayarla
    if (level <= 2) blocks[4].subject = 'Genel Tekrar'
    else if (level >= 4) blocks[5].subject = (track==='dil'?'YDT Deneme Analizi':'AYT Deneme Analizi')
    plan.push({ day: days[i], blocks })
  }
  return plan
}

export type Resource = { subject: string; title: string; level: 'Başlangıç'|'Orta'|'İleri'; desc: string }

export function suggestResources(track: string, level: number): Resource[] {
  const diff = level<=2 ? 'Başlangıç' : level===3 ? 'Orta' : 'İleri'
  const bySubject: Record<string, Resource[]> = {
    Matematik: [
      {subject:'Matematik', title:'Antrenmanlarla Matematik', level:'Başlangıç', desc:'Temel kazanımlar için.'},
      {subject:'Matematik', title:'345 Yayınları TYT', level:'Orta', desc:'Yeni nesil soru odaklı.'},
      {subject:'Matematik', title:'Acil Yayınları AYT', level:'İleri', desc:'Seçkin ileri düzey set.'},
    ],
    Türkçe: [
      {subject:'Türkçe', title:'Türkçe Kolay Seri', level:'Başlangıç', desc:'Paragraf temelleri.'},
      {subject:'Türkçe', title:'Merkez Yayınları', level:'Orta', desc:'Dengeli zorluk.'},
      {subject:'Türkçe', title:'Bilgi Sarmal Denemeleri', level:'İleri', desc:'Yoğun deneme pratiği.'},
    ],
    Fizik: [
      {subject:'Fizik', title:'Palme Temel Set', level:'Başlangıç', desc:'Konu anlatım + temel.'},
      {subject:'Fizik', title:'3D Yayınları', level:'Orta', desc:'ÖSYM tarzı sorular.'},
      {subject:'Fizik', title:'Branş Denemeleri', level:'İleri', desc:'Hız ve seviye ölçümü.'},
    ],
    Kimya: [
      {subject:'Kimya', title:'Palme Temel Set', level:'Başlangıç', desc:'Temel kavramlar.'},
      {subject:'Kimya', title:'Bilgi Sarmal', level:'Orta', desc:'Orta seviye bankası.'},
      {subject:'Kimya', title:'Palme İleri', level:'İleri', desc:'Zorlayıcı ve kapsamlı.'},
    ],
    Biyoloji: [
      {subject:'Biyoloji', title:'Palme Temel', level:'Başlangıç', desc:'Temel seviye.'},
      {subject:'Biyoloji', title:'3D Yayınları', level:'Orta', desc:'Seçili özgün sorular.'},
      {subject:'Biyoloji', title:'Branş Denemeleri', level:'İleri', desc:'Sınav temposu.'},
    ],
  }

  const subjects = track==='sayisal' ? ['Matematik','Fizik','Kimya','Biyoloji'] : ['Matematik','Türkçe']
  const list: Resource[] = []
  for(const s of subjects){
    const pool = bySubject[s] ?? []
    list.push(...pool.filter(r=>r.level===diff).slice(0,2))
  }
  return list
}


