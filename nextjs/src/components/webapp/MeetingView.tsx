'use client';

import { useState } from 'react';
import { Button } from '@/components/webapp/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/webapp/ui/card';
import { Badge } from '@/components/webapp/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/webapp/ui/tabs';
import { ArrowLeft, FolderOpen, Settings, FileText, Sparkles, Plus } from 'lucide-react';
import { Meeting } from '@/types';
import ProjectView from './ProjectView';
import NotesView from './NotesView';
import ReportSettings from './ReportSettings';
import ReportGeneration from './ReportGeneration';
import CreateProjectDialog from './CreateProjectDialog';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import { mapSupabaseToMeetings } from '@/lib/mapper';

interface MeetingViewProps {
  meeting: Meeting;
  onBack: () => void;
  onUpdate: (meeting: Meeting) => void;
}

export default function MeetingView({ meeting, onBack, onUpdate }: MeetingViewProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('projects');
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleNotesUpdate = (notes: string) => {
    onUpdate({ ...meeting, notes });
  };

  const handleReportSettingsUpdate = (reportSettings: typeof meeting.reportSettings) => {
    onUpdate({ ...meeting, reportSettings });
  };

  const handleProjectUpdate = (updatedProjects: typeof meeting.projects) => {
    onUpdate({ ...meeting, projects: updatedProjects });
  };

  const selectedProjectData = meeting.projects.find(p => p.id === selectedProject);

  if (selectedProject && selectedProjectData) {
    return (
      <ProjectView
        project={selectedProjectData}
        meetingTitle={meeting.title}
        onBack={() => setSelectedProject(null)}
        onUpdate={(updatedProject) => {
          const updatedProjects = meeting.projects.map(p => 
            p.id === updatedProject.id ? updatedProject : p
          );
          handleProjectUpdate(updatedProjects);
        }}
      />
    );
  }

  const getTotalTasks = () => meeting.projects.reduce((acc, project) => acc + project.tasks.length, 0);
  const getCompletedTasks = () => meeting.projects.reduce((acc, project) =>
    acc + project.tasks.filter(task => task.status === 'finish').length, 0
  );

  const refreshMeetingData = async () => {
    setIsRefreshing(true);
    try {
      const supabase = await createSPASassClient();
      const client = supabase.getSupabaseClient();
      const { data: user } = await client.auth.getUser();

      if (user.user) {
        const { data, error } = await supabase.getUserMeetingsFull(user.user.id);

        if (!error && data && data.length > 0) {
          const updatedMeetings = mapSupabaseToMeetings(data);
          const updatedMeeting = updatedMeetings.find(m => m.id === meeting.id);
          if (updatedMeeting) {
            onUpdate(updatedMeeting);
          }
        }
      }
    } catch (err) {
      console.error('Error refreshing meeting data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Meetings
            </Button>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
                <p className="text-gray-600 mb-4">{meeting.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span>📅 {new Date(meeting.date).toLocaleDateString()}</span>
                  <span>🕐 {meeting.time}</span>
                  <span>📁 {meeting.projects.length} Projects</span>
                  <span>✅ {getCompletedTasks()}/{getTotalTasks()} Tasks</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {meeting.notes && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <FileText className="w-3 h-3 mr-1" />
                    Has Notes
                  </Badge>
                )}
                <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                  {Math.round((getCompletedTasks() / Math.max(getTotalTasks(), 1)) * 100)}% Complete
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md bg-white border border-gray-200 rounded-lg">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowCreateProjectDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {meeting.projects.map((project) => {
                const completedTasks = project.tasks.filter(task => task.status === 'finish').length;
                const totalTasks = project.tasks.length;
                const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <Card 
                    key={project.id}
                    className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                        {project.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tasks</span>
                          <span className="font-medium text-gray-900">{completedTasks}/{totalTasks}</span>
                        </div>
                        
                        {totalTasks > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium text-gray-900">{completionRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {project.tasks.filter(t => t.status === 'in-progress').length > 0 && (
                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                              {project.tasks.filter(t => t.status === 'in-progress').length} In Progress
                            </Badge>
                          )}
                          {project.tasks.filter(t => t.status === 'blocked').length > 0 && (
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                              {project.tasks.filter(t => t.status === 'blocked').length} Blocked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <NotesView
              notes={meeting.notes}
              meetingId={meeting.id}
              onUpdate={handleNotesUpdate}
            />
          </TabsContent>

          <TabsContent value="settings">
            <ReportSettings
              meetingId={meeting.id}
              settings={meeting.reportSettings}
              onUpdate={handleReportSettingsUpdate}
            />
          </TabsContent>

          <TabsContent value="report">
            <ReportGeneration
              meeting={meeting}
            />
          </TabsContent>
        </Tabs>

        {/* Create Project Dialog */}
        <CreateProjectDialog
          open={showCreateProjectDialog}
          onOpenChange={setShowCreateProjectDialog}
          meetingId={meeting.id}
          onProjectCreated={refreshMeetingData}
        />
      </div>
    </div>
  );
}