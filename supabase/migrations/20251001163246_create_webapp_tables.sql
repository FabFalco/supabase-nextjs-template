/*
  # Create WebApp Tables for Meeting Management

  ## Overview
  This migration creates the complete database schema for the meeting management webapp including:
  - Meetings table for storing meeting information
  - Projects table for meeting projects
  - Tasks table for project tasks
  - Meeting notes table for meeting notes
  - Report settings table for AI report generation settings  
  - Generated reports table for storing AI-generated reports

  ## Tables Created

  ### 1. meetings
  - `id` (uuid, primary key) - Unique meeting identifier
  - `title` (text) - Meeting title
  - `description` (text) - Meeting description
  - `date` (timestamptz) - Meeting date and time
  - `duration` (integer) - Duration in minutes
  - `status` (text) - Meeting status (scheduled, completed, cancelled)
  - `user_id` (uuid, foreign key) - Owner of the meeting
  - `created_at`, `updated_at` (timestamptz) - Timestamps

  ### 2. projects
  - `id` (uuid, primary key) - Unique project identifier
  - `name` (text) - Project name
  - `description` (text) - Project description
  - `meeting_id` (uuid, foreign key) - Associated meeting
  - `color` (text) - Color code for visual identification
  - `created_at`, `updated_at` (timestamptz) - Timestamps

  ### 3. tasks
  - `id` (uuid, primary key) - Unique task identifier
  - `title` (text) - Task title
  - `description` (text) - Task description
  - `status` (text) - Task status (in-progress, blocked, finish)
  - `project_id` (uuid, foreign key) - Associated project
  - `order_index` (integer) - Display order
  - `created_at`, `updated_at` (timestamptz) - Timestamps

  ### 4. meeting_notes
  - `id` (uuid, primary key) - Unique note identifier
  - `meeting_id` (uuid, foreign key) - Associated meeting
  - `content` (text) - Note content
  - `created_at`, `updated_at` (timestamptz) - Timestamps

  ### 5. report_settings
  - `id` (uuid, primary key) - Unique settings identifier
  - `meeting_id` (uuid, foreign key) - Associated meeting
  - `style` (text) - Report style (executive, detailed, client-friendly, technical)
  - `additional_prompt` (text) - Custom AI prompt
  - `created_at`, `updated_at` (timestamptz) - Timestamps

  ### 6. generated_reports
  - `id` (uuid, primary key) - Unique report identifier
  - `meeting_id` (uuid, foreign key) - Associated meeting
  - `content` (text) - Generated report content
  - `file_path` (text) - Storage path for report file
  - `created_at` (timestamptz) - Generation timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only access their own meetings and related data
  - Proper authentication checks on all policies
  - Foreign key cascades for data integrity
*/

-- Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text DEFAULT '',
    date timestamptz NOT NULL,
    duration integer DEFAULT 60,
    status text DEFAULT 'scheduled',
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text DEFAULT '',
    meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    color text DEFAULT '#3B82F6',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text DEFAULT '',
    status text DEFAULT 'in-progress',
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    order_index integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create meeting_notes table
CREATE TABLE IF NOT EXISTS public.meeting_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    content text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create report_settings table
CREATE TABLE IF NOT EXISTS public.report_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    style text DEFAULT 'executive',
    additional_prompt text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create generated_reports table
CREATE TABLE IF NOT EXISTS public.generated_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    content text,
    file_path text,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_meeting_id ON public.projects(meeting_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_meeting_id ON public.meeting_notes(meeting_id);
CREATE INDEX IF NOT EXISTS idx_report_settings_meeting_id ON public.report_settings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_meeting_id ON public.generated_reports(meeting_id);

-- Enable Row Level Security
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- Meetings policies
CREATE POLICY "Users can view own meetings"
    ON public.meetings FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meetings"
    ON public.meetings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings"
    ON public.meetings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings"
    ON public.meetings FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects"
    ON public.projects FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = projects.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own projects"
    ON public.projects FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = projects.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = projects.meeting_id
            AND meetings.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = projects.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = projects.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

-- Tasks policies
CREATE POLICY "Users can view own tasks"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            JOIN public.meetings ON meetings.id = projects.meeting_id
            WHERE projects.id = tasks.project_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            JOIN public.meetings ON meetings.id = projects.meeting_id
            WHERE projects.id = tasks.project_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            JOIN public.meetings ON meetings.id = projects.meeting_id
            WHERE projects.id = tasks.project_id
            AND meetings.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            JOIN public.meetings ON meetings.id = projects.meeting_id
            WHERE projects.id = tasks.project_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            JOIN public.meetings ON meetings.id = projects.meeting_id
            WHERE projects.id = tasks.project_id
            AND meetings.user_id = auth.uid()
        )
    );

-- Meeting notes policies
CREATE POLICY "Users can view own meeting notes"
    ON public.meeting_notes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = meeting_notes.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own meeting notes"
    ON public.meeting_notes FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = meeting_notes.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own meeting notes"
    ON public.meeting_notes FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = meeting_notes.meeting_id
            AND meetings.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = meeting_notes.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own meeting notes"
    ON public.meeting_notes FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = meeting_notes.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

-- Report settings policies
CREATE POLICY "Users can view own report settings"
    ON public.report_settings FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = report_settings.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own report settings"
    ON public.report_settings FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = report_settings.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own report settings"
    ON public.report_settings FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = report_settings.meeting_id
            AND meetings.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = report_settings.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own report settings"
    ON public.report_settings FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = report_settings.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

-- Generated reports policies
CREATE POLICY "Users can view own generated reports"
    ON public.generated_reports FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = generated_reports.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own generated reports"
    ON public.generated_reports FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = generated_reports.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own generated reports"
    ON public.generated_reports FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = generated_reports.meeting_id
            AND meetings.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = generated_reports.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own generated reports"
    ON public.generated_reports FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.meetings
            WHERE meetings.id = generated_reports.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at_meetings
    BEFORE UPDATE ON public.meetings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_projects
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_tasks
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_meeting_notes
    BEFORE UPDATE ON public.meeting_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_report_settings
    BEFORE UPDATE ON public.report_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
