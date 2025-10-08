import { Meeting } from '@/types';

export function mapSupabaseToMeetings(raw: any[]): Meeting[] {
  return raw.map(meeting => ({
    id: meeting.id,
    title: meeting.title,
    description: meeting.description ?? "",
    date: meeting.date, // déjà en string
    time: new Date(meeting.date).toISOString().split("T")[1].slice(0,5), // HH:mm

    projects: (meeting.projects ?? []).map((project: any) => ({
      id: project.id,
      name: project.name,
      description: project.description ?? "",
      tasks: (project.tasks ?? []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description ?? "",
        // on mappe le status brut vers ton union type
        status: (task.status as 'in-progress' | 'blocked' | 'finish') ?? 'in-progress'
      }))
    })),

    notes: meeting.meeting_notes?.[0]?.content ?? "",

    reportSettings: {
      style: (meeting.report_settings?.[0]?.style as 'executive' | 'detailed' | 'client-friendly' | 'technical') ?? 'executive',
      additionalPrompt: meeting.report_settings?.[0]?.additional_prompt ?? ""
    }
  }))
}
