-- YKS AI Assistant - Supabase Database Schema
-- Bu script'i Supabase Dashboard > SQL Editor'de çalıştırın

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kullanıcı_ID TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  seviye TEXT CHECK (seviye IN ('başlangıç', 'orta', 'ileri')) DEFAULT 'orta',
  haftalık_saat INTEGER DEFAULT 20,
  hedef_tarih DATE,
  field TEXT CHECK (field IN ('sayisal', 'ea', 'sozel', 'dil')) DEFAULT 'sayisal',
  tercihler JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Plans Table
CREATE TABLE study_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kullanıcı_ID TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  tarih DATE NOT NULL DEFAULT CURRENT_DATE,
  haftalık_plan JSONB NOT NULL,
  kaynak_önerileri JSONB NOT NULL DEFAULT '[]',
  ux_önerileri TEXT[] DEFAULT '{}',
  adaptasyon_notları TEXT,
  confidence_overall DECIMAL(3,2) DEFAULT 0.85,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress Table
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  progress_id TEXT NOT NULL,
  blok_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  tamamlandı BOOLEAN DEFAULT FALSE,
  zaman TEXT,
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_profiles_kullanıcı_id ON user_profiles(kullanıcı_ID);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_study_plans_kullanıcı_id ON study_plans(kullanıcı_ID);
CREATE INDEX idx_study_plans_plan_id ON study_plans(plan_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_plan_id ON user_progress(plan_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = kullanıcı_ID);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = kullanıcı_ID);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = kullanıcı_ID);

-- RLS Policies for study_plans
CREATE POLICY "Users can view own plans" ON study_plans
  FOR SELECT USING (auth.uid()::text = kullanıcı_ID);

CREATE POLICY "Users can insert own plans" ON study_plans
  FOR INSERT WITH CHECK (auth.uid()::text = kullanıcı_ID);

CREATE POLICY "Users can update own plans" ON study_plans
  FOR UPDATE USING (auth.uid()::text = kullanıcı_ID);

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update triggers
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_plans_updated_at 
  BEFORE UPDATE ON study_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
