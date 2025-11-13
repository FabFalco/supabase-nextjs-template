import { Meeting, Project, Task, ReportSettings, GeneratedReport } from '@/types';
import { Database } from './types';

type DBMeeting = Database['public']['Tables']['meetings']['Row'];
type DBProject = Database['public']['Tables']['projects']['Row'];
type DBTask = Database['public']['Tables']['tasks']['Row'];
type DBMeetingNote = Database['public']['Tables']['meeting_notes']['Row'];
type DBReportSettings = Database['public']['Tables']['report_settings']['Row'];

export function mapSupabaseToMeetings(raw: any[]): Meeting[] {
  return raw.map(meeting => ({
    id: meeting.id,
    title: meeting.title,
    description: meeting.description ?? "",
    date: meeting.date,
    time: new Date(meeting.date).toISOString().split("T")[1].slice(0,5),

    projects: (meeting.projects ?? []).map((project: any) => mapSupabaseToProject(project)),

    notes: meeting.meeting_notes?.[0]?.content ?? "",

    reportSettings: mapSupabaseToReportSettings(meeting.report_settings?.[0])
  }))
}

export function mapSupabaseToProject(project: any): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    tasks: (project.tasks ?? []).map((task: any) => mapSupabaseToTask(task))
  };
}

export function mapSupabaseToTask(task: any): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    status: (task.status as 'in-progress' | 'blocked' | 'finish') ?? 'in-progress'
  };
}

export function mapSupabaseToReportSettings(settings: any): ReportSettings {
  if (!settings) {
    return {
      style: 'executive',
      additionalPrompt: ''
    };
  }

  return {
    style: (settings.style as 'executive' | 'detailed' | 'client-friendly' | 'technical') ?? 'executive',
    additionalPrompt: settings.additional_prompt ?? ""
  };
}

export function mapSupabaseToGeneratedReport(report: any): GeneratedReport {
  if (!report) {
    return {
      content: '',
      file_path: '',
      created_at: ''
    };
  }

  return {
    content: report.content,
    file_path: report.file_path,
    created_at: report.created_at
  };
}

export function mapTaskToSupabase(task: Partial<Task>): Partial<DBTask> {
  const mapped: Partial<DBTask> = {};

  if (task.title !== undefined) mapped.title = task.title;
  if (task.description !== undefined) mapped.description = task.description;
  if (task.status !== undefined) mapped.status = task.status;

  return mapped;
}

export function mapProjectToSupabase(project: Partial<Project>): Partial<DBProject> {
  const mapped: Partial<DBProject> = {};

  if (project.name !== undefined) mapped.name = project.name;
  if (project.description !== undefined) mapped.description = project.description;

  return mapped;
}
