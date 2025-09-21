/* Supabase Database Schema for YKS AI Assistant */
/* Bu script'i Supabase Dashboard > SQL Editor'de çalıştırın */

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
  weekly_hours INTEGER DEFAULT 20 CHECK (weekly_hours > 0 AND weekly_hours <= 168),
  target_date DATE,
  field TEXT CHECK (field IN ('science', 'social', 'language', 'mixed')) DEFAULT 'science',
  preferences JSONB DEFAULT '{}',
  avatar_url TEXT,
  is_guest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Plans Table
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  week_number INTEGER DEFAULT 1,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  schedule JSONB NOT NULL,
  resources JSONB NOT NULL DEFAULT '[]',
  tips TEXT[] DEFAULT '{}',
  notes TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.85 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- User Progress Table
CREATE TABLE IF NOT EXISTS progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL,
  completed_items JSONB DEFAULT '{}',
  study_time_minutes INTEGER DEFAULT 0,
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_plan_id ON plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_plan_id ON progress(plan_id);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for plans
CREATE POLICY "Users can view own plans" ON plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" ON plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" ON plans
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for progress
CREATE POLICY "Users can view own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON progress
  FOR DELETE USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at 
  BEFORE UPDATE ON plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- INSERT INTO profiles (user_id, name, email, level, weekly_hours, field) VALUES
-- ('test-user-id', 'Test User', 'test@example.com', 'intermediate', 25, 'science');

/* Comments */
COMMENT ON TABLE profiles IS 'User profile information and preferences';
COMMENT ON TABLE plans IS 'AI-generated study plans for users';
COMMENT ON TABLE progress IS 'User study progress tracking';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
