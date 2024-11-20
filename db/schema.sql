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

-- Create Commitments table
CREATE TABLE commitments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Holidays', 'Appointments', 'Meetings')),
    title TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add RLS policies for Commitments
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own commitments
CREATE POLICY "Users can view their own commitments" ON commitments
    FOR SELECT USING (
        schedule_id IN (
            SELECT id FROM schedules 
            WHERE user_id = auth.uid()
        )
    );

-- Allow users to insert their own commitments
CREATE POLICY "Users can insert their own commitments" ON commitments
    FOR INSERT WITH CHECK (
        schedule_id IN (
            SELECT id FROM schedules 
            WHERE user_id = auth.uid()
        )
    );

-- Allow users to update their own commitments
CREATE POLICY "Users can update their own commitments" ON commitments
    FOR UPDATE USING (
        schedule_id IN (
            SELECT id FROM schedules 
            WHERE user_id = auth.uid()
        )
    );

-- Allow users to delete their own commitments
CREATE POLICY "Users can delete their own commitments" ON commitments
    FOR DELETE USING (
        schedule_id IN (
            SELECT id FROM schedules 
            WHERE user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_commitments_updated_at
    BEFORE UPDATE ON commitments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update Commitments table
ALTER TABLE commitments
ADD COLUMN start_time TIME,
ADD COLUMN end_time TIME;

-- Add flexibility column to commitments table
ALTER TABLE commitments
ADD COLUMN flexibility TEXT CHECK (flexibility IN ('Firm', 'Flexible')) DEFAULT 'Firm';

-- Create Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Tasks table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    required_members TEXT,
    optional_members TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on both tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Projects
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Tasks
CREATE POLICY "Users can view tasks in their projects" ON tasks
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks in their projects" ON tasks
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks in their projects" ON tasks
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tasks in their projects" ON tasks
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
        )
    );

-- Create updated_at triggers for both tables
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Modify the Tasks table to add priority and hours
ALTER TABLE tasks
ADD COLUMN priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
ADD COLUMN hours INTEGER CHECK (hours >= 1 AND hours <= 40) DEFAULT 1;

-- Add Priority and Hours to Projects table
ALTER TABLE projects
ADD COLUMN priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
ADD COLUMN hours INTEGER CHECK (hours >= 1 AND hours <= 40) DEFAULT 1;

-- Add new columns to Projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS hours INTEGER CHECK (hours >= 1 AND hours <= 40) DEFAULT 1,
ADD COLUMN IF NOT EXISTS per TEXT CHECK (per IN ('Week', 'Month', 'Day')) DEFAULT 'Week',
ADD COLUMN IF NOT EXISTS max_hours INTEGER CHECK (max_hours >= 1 AND max_hours <= 40) DEFAULT 40;

-- Add new columns to Tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS hours INTEGER CHECK (hours >= 1 AND hours <= 40) DEFAULT 1,
ADD COLUMN IF NOT EXISTS "order" INTEGER,
ADD COLUMN IF NOT EXISTS recurring TEXT[],
ADD COLUMN IF NOT EXISTS hour_delay INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS next_task TEXT;

