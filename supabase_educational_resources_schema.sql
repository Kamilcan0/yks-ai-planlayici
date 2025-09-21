-- YKS AI Assistant - Educational Resources Schema
-- Bu script'i Supabase Dashboard > SQL Editor'de çalıştırın

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Educational Subjects Table (Dersler)
CREATE TABLE IF NOT EXISTS educational_subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ders_adi TEXT NOT NULL UNIQUE,
  kategori TEXT CHECK (kategori IN ('TYT', 'AYT')) NOT NULL,
  alan TEXT[] NOT NULL, -- sayisal, esit, sozel
  aciklama TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Educational Topics Table (Konular)
CREATE TABLE IF NOT EXISTS educational_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES educational_subjects(id) ON DELETE CASCADE NOT NULL,
  konu_adi TEXT NOT NULL,
  aciklama TEXT,
  sira_no INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subject_id, konu_adi)
);

-- Educational Resources Table (Kaynaklar)
CREATE TABLE IF NOT EXISTS educational_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic_id UUID REFERENCES educational_topics(id) ON DELETE CASCADE NOT NULL,
  kaynak_adi TEXT NOT NULL,
  kaynak_turu TEXT CHECK (kaynak_turu IN ('Kitap', 'Video', 'PDF', 'Uygulama', 'Online Kurs', 'Test')) NOT NULL,
  seviye TEXT CHECK (seviye IN ('başlangıç', 'orta', 'ileri')) DEFAULT 'orta',
  yayinevi TEXT,
  kanal TEXT,
  link TEXT,
  aciklama TEXT,
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  tahmini_fiyat DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert educational subjects
INSERT INTO educational_subjects (ders_adi, kategori, alan, aciklama) VALUES
('Türkçe', 'TYT', ARRAY['sayisal', 'esit', 'sozel'], 'TYT Türkçe dersi'),
('Türk Dili ve Edebiyatı', 'AYT', ARRAY['esit', 'sozel'], 'AYT Türk Dili ve Edebiyatı dersi'),
('Matematik', 'TYT', ARRAY['sayisal', 'esit'], 'TYT Matematik dersi'),
('Geometri', 'AYT', ARRAY['sayisal'], 'AYT Geometri dersi'),
('Fizik', 'AYT', ARRAY['sayisal'], 'AYT Fizik dersi'),
('Kimya', 'AYT', ARRAY['sayisal'], 'AYT Kimya dersi'),
('Biyoloji', 'AYT', ARRAY['sayisal'], 'AYT Biyoloji dersi'),
('Tarih', 'AYT', ARRAY['sozel'], 'AYT Tarih dersi'),
('Coğrafya', 'AYT', ARRAY['sozel'], 'AYT Coğrafya dersi'),
('Felsefe', 'AYT', ARRAY['sozel'], 'AYT Felsefe dersi'),
('Mantık', 'AYT', ARRAY['sozel'], 'AYT Mantık dersi'),
('Psikoloji', 'AYT', ARRAY['sozel'], 'AYT Psikoloji dersi'),
('Sosyoloji', 'AYT', ARRAY['sozel'], 'AYT Sosyoloji dersi'),
('Din Kültürü ve Ahlak Bilgisi', 'AYT', ARRAY['sozel'], 'AYT Din Kültürü ve Ahlak Bilgisi dersi')
ON CONFLICT (ders_adi) DO NOTHING;

-- Insert topics for Türkçe
WITH turkce_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Türkçe')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT turkce_subject.id, unnest(ARRAY['Ses Bilgisi', 'Cümle Yapısı']), unnest(ARRAY[1, 2])
FROM turkce_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Türk Dili ve Edebiyatı
WITH edebiyat_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Türk Dili ve Edebiyatı')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT edebiyat_subject.id, unnest(ARRAY['Nazım Biçimleri ve Türleri', 'Tanzimat Edebiyatı']), unnest(ARRAY[1, 2])
FROM edebiyat_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Matematik
WITH matematik_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Matematik')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT matematik_subject.id, unnest(ARRAY['Sayılar', 'Fonksiyonlar']), unnest(ARRAY[1, 2])
FROM matematik_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Geometri
WITH geometri_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Geometri')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT geometri_subject.id, unnest(ARRAY['Üçgenler', 'Dönüşümler']), unnest(ARRAY[1, 2])
FROM geometri_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Fizik
WITH fizik_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Fizik')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT fizik_subject.id, unnest(ARRAY['Kuvvet ve Hareket', 'Elektrostatik']), unnest(ARRAY[1, 2])
FROM fizik_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Kimya
WITH kimya_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Kimya')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT kimya_subject.id, unnest(ARRAY['Atom ve Periyodik Sistem', 'Kimyasal Tepkimeler']), unnest(ARRAY[1, 2])
FROM kimya_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Biyoloji
WITH biyoloji_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Biyoloji')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT biyoloji_subject.id, unnest(ARRAY['Hücre Yapısı', 'Mendel Genetiği']), unnest(ARRAY[1, 2])
FROM biyoloji_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Tarih
WITH tarih_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Tarih')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT tarih_subject.id, unnest(ARRAY['İlk Türk Devletleri', 'Kurtuluş Savaşı']), unnest(ARRAY[1, 2])
FROM tarih_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Coğrafya
WITH cografya_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Coğrafya')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT cografya_subject.id, unnest(ARRAY['Harita Bilgisi', 'Türkiye''de Nüfus ve Yerleşme']), unnest(ARRAY[1, 2])
FROM cografya_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Felsefe
WITH felsefe_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Felsefe')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT felsefe_subject.id, unnest(ARRAY['Bilgi Felsefesi', 'Etik ve Ahlak']), unnest(ARRAY[1, 2])
FROM felsefe_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Mantık
WITH mantik_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Mantık')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT mantik_subject.id, 'Önerme Mantığı', 1
FROM mantik_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Psikoloji
WITH psikoloji_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Psikoloji')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT psikoloji_subject.id, 'Öğrenme ve Hafıza', 1
FROM psikoloji_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Sosyoloji
WITH sosyoloji_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Sosyoloji')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT sosyoloji_subject.id, 'Toplumsal Kurumlar', 1
FROM sosyoloji_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Insert topics for Din Kültürü ve Ahlak Bilgisi
WITH dkab_subject AS (SELECT id FROM educational_subjects WHERE ders_adi = 'Din Kültürü ve Ahlak Bilgisi')
INSERT INTO educational_topics (subject_id, konu_adi, sira_no) 
SELECT dkab_subject.id, unnest(ARRAY['İbadetler', 'Laiklik ve Dinin Rolü']), unnest(ARRAY[1, 2])
FROM dkab_subject
ON CONFLICT (subject_id, konu_adi) DO NOTHING;

-- Function to insert resources for a topic
CREATE OR REPLACE FUNCTION insert_topic_resources(
  subject_name TEXT,
  topic_name TEXT,
  resources JSONB
) RETURNS VOID AS $$
DECLARE
  topic_uuid UUID;
  resource JSONB;
BEGIN
  -- Get topic ID
  SELECT t.id INTO topic_uuid
  FROM educational_topics t
  JOIN educational_subjects s ON t.subject_id = s.id
  WHERE s.ders_adi = subject_name AND t.konu_adi = topic_name;
  
  -- Insert each resource
  FOR resource IN SELECT * FROM jsonb_array_elements(resources)
  LOOP
    INSERT INTO educational_resources (
      topic_id, kaynak_adi, kaynak_turu, seviye, yayinevi, kanal, link, aciklama, priority
    ) VALUES (
      topic_uuid,
      COALESCE(resource->>'isim', resource->>'baslik'),
      resource->>'tur',
      resource->>'seviye',
      resource->>'yayinevi',
      resource->>'kanal',
      resource->>'link',
      CONCAT((SELECT konu_adi FROM educational_topics WHERE id = topic_uuid), ' konusu için ', LOWER(resource->>'tur'), ' kaynağı'),
      COALESCE((resource->>'priority')::INTEGER, 3)
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert all resources using the function
-- Türkçe - Ses Bilgisi
SELECT insert_topic_resources('Türkçe', 'Ses Bilgisi', '[
  {"tur": "Kitap", "isim": "MEB Lisanslı Ders Kitabı - Ses Bilgisi", "yayinevi": "MEB", "seviye": "başlangıç", "priority": 5},
  {"tur": "Video", "kanal": "Öğrenci Koçu (YouTube)", "link": "https://youtube.com", "seviye": "orta", "priority": 4},
  {"tur": "PDF", "baslik": "MEBİ Konu Özetleri - Türkçe", "link": "https://mebi.eba.gov.tr", "seviye": "orta", "priority": 3},
  {"tur": "Uygulama", "isim": "OGM Materyal Soru Bankası", "link": "https://play.google.com/store/apps/details?id=tr.gov.eba.ogmmateryalsoru", "seviye": "orta", "priority": 3}
]'::jsonb);

-- Türkçe - Cümle Yapısı
SELECT insert_topic_resources('Türkçe', 'Cümle Yapısı', '[
  {"tur": "Kitap", "isim": "MEB Lisanslı Ders Kitabı - Cümle Yapısı", "yayinevi": "MEB", "seviye": "başlangıç", "priority": 5},
  {"tur": "Video", "kanal": "Öğrenci Koçu (YouTube)", "link": "https://youtube.com", "seviye": "orta", "priority": 4},
  {"tur": "PDF", "baslik": "MEBİ Konu Özetleri - Türkçe", "link": "https://mebi.eba.gov.tr", "seviye": "orta", "priority": 3},
  {"tur": "Uygulama", "isim": "OGM Materyal Soru Bankası", "link": "https://play.google.com/store/apps/details?id=tr.gov.eba.ogmmateryalsoru", "seviye": "orta", "priority": 3}
]'::jsonb);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_educational_subjects_ders_adi ON educational_subjects(ders_adi);
CREATE INDEX IF NOT EXISTS idx_educational_subjects_kategori ON educational_subjects(kategori);
CREATE INDEX IF NOT EXISTS idx_educational_topics_subject_id ON educational_topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_educational_topics_konu_adi ON educational_topics(konu_adi);
CREATE INDEX IF NOT EXISTS idx_educational_resources_topic_id ON educational_resources(topic_id);
CREATE INDEX IF NOT EXISTS idx_educational_resources_seviye ON educational_resources(seviye);
CREATE INDEX IF NOT EXISTS idx_educational_resources_kaynak_turu ON educational_resources(kaynak_turu);

-- Create a view for easy querying
CREATE OR REPLACE VIEW educational_resources_view AS
SELECT 
  s.ders_adi,
  s.kategori,
  s.alan,
  t.konu_adi,
  r.kaynak_adi,
  r.kaynak_turu,
  r.seviye,
  r.yayinevi,
  r.kanal,
  r.link,
  r.aciklama,
  r.priority,
  r.tahmini_fiyat
FROM educational_resources r
JOIN educational_topics t ON r.topic_id = t.id
JOIN educational_subjects s ON t.subject_id = s.id
ORDER BY s.ders_adi, t.sira_no, r.priority DESC;
