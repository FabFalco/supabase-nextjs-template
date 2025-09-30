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

    // si plusieurs notes → tu choisis la dernière par ex.
    notes: meeting.meeting_notes?.[0]?.content ?? "",

    // idem pour les reportSettings (ici on prend le dernier report généré comme exemple)
    reportSettings: {
      style: "executive", // valeur par défaut → tu pourras mapper avec `report_settings` si tu veux
      additionalPrompt: meeting.generated_reports?.[0]?.content ?? ""
    }
  }))
}
