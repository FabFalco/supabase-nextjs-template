export interface Task {
  id: string;
  title: string;
  status: 'in-progress' | 'blocked' | 'finish';
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
}

export interface ReportSettings {
  style: 'executive' | 'detailed' | 'client-friendly' | 'technical';
  additionalPrompt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  projects: Project[];
  notes: string;
  reportSettings: ReportSettings;
}

export interface GeneratedReport {
  content: string;
  file_path: string;
  created_at: string;
}