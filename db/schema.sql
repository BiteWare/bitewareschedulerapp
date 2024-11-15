-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    team TEXT DEFAULT 'unassigned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    timezone TEXT DEFAULT 'UTC',
    work_hours_start TIME,
    work_hours_end TIME,
    standing_meetings TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row-Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users Table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable user creation" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for Schedules Table
CREATE POLICY "Users can view their own schedule" ON schedules
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own schedule" ON schedules
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable schedule creation" ON schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Optional Trigger to Sync Users on Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
