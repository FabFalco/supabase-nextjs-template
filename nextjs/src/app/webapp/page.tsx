'use client';
import React, { useState, useEffect } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import {
    createSPASassClientAuthenticated as createSPASassClient
} from '@/lib/supabase/client';
import { Button } from '@/components/webapp/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/webapp/ui/card';
import { Badge } from '@/components/webapp/ui/badge';
import { Plus, Calendar, Users, CheckSquare, FileText, Settings, Loader2 } from 'lucide-react';
import MeetingView from '@/components/webapp/MeetingView';
import { Meeting } from '@/types';
import { Database } from '@/lib/types';
import { mapSupabaseToMeetings } from '@/lib/mapper'

type Meetings = Database['public']['Tables']['meetings']['Row'];
type Projects = Database['public']['Tables']['projects']['Row'];
type Tasks = Database['public']['Tables']['tasks']['Row'];

/*const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Q1 Strategy Planning',
    description: 'Quarterly planning session for 2025 strategy',
    date: '2025-01-15',
    time: '09:00',
    projects: [
      {
        id: 'p1',
        name: 'Product Roadmap',
        description: 'Define product features for Q1',
        tasks: [
          { id: 't1', title: 'Market Research', status: 'finish', description: 'Analyze competitor features' },
          { id: 't2', title: 'Feature Prioritization', status: 'in-progress', description: 'Rank features by impact' },
          { id: 't3', title: 'Timeline Planning', status: 'blocked', description: 'Blocked by resource allocation' }
        ]
      },
      {
        id: 'p2',
        name: 'Marketing Campaign',
        description: 'Launch campaign for new features',
        tasks: [
          { id: 't4', title: 'Content Creation', status: 'in-progress', description: 'Create marketing materials' },
          { id: 't5', title: 'Channel Planning', status: 'finish', description: 'Select marketing channels' }
        ]
      }
    ],
    notes: '',
    reportSettings: {
      style: 'executive',
      additionalPrompt: 'Focus on strategic outcomes and key decisions made.'
    }
  },
  {
    id: '2',
    title: 'Team Retrospective',
    description: 'Monthly team performance review',
    date: '2025-01-10',
    time: '14:00',
    projects: [
      {
        id: 'p3',
        name: 'Process Improvement',
        description: 'Optimize team workflows',
        tasks: [
          { id: 't6', title: 'Workflow Analysis', status: 'finish', description: 'Review current processes' },
          { id: 't7', title: 'Tool Evaluation', status: 'in-progress', description: 'Assess new productivity tools' }
        ]
      }
    ],
    notes: 'Great discussion about improving our sprint planning process.',
    reportSettings: {
      style: 'detailed',
      additionalPrompt: 'Include specific action items and team feedback.'
    }
  },
  {
    id: '3',
    title: 'Client Check-in',
    description: 'Weekly status update with client',
    date: '2025-01-08',
    time: '11:00',
    projects: [
      {
        id: 'p4',
        name: 'Feature Development',
        description: 'Current development progress',
        tasks: [
          { id: 't8', title: 'API Implementation', status: 'in-progress', description: 'Building REST endpoints' },
          { id: 't9', title: 'UI Design', status: 'finish', description: 'Complete mockups approved' },
          { id: 't10', title: 'Testing Setup', status: 'blocked', description: 'Waiting for QA environment' }
        ]
      }
    ],
    notes: '',
    reportSettings: {
      style: 'client-friendly',
      additionalPrompt: 'Use non-technical language and focus on business value.'
    }
  }
];*/

export default function Home() {
  const { user } = useGlobal();
  
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  //const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  useEffect(() => {
      if (user?.id) {
          loadTasks();
      }
  }, [filter, user?.id]);

  const loadTasks = async (): Promise<void> => {
      try {
          const isFirstLoad = initialLoading;
          if (!isFirstLoad) setLoading(true);

          const supabase = await createSPASassClient();
          const { data, error: supabaseError } = await supabase.getUserMeetingsFull(user?.id);
          if (supabaseError) throw supabaseError;

          const meetings: Meeting[] = mapSupabaseToMeetings(data)
          
          setMeetings(meetings || []);
      } catch (err) {
          setError('Failed to load meetings');
          console.error('❌ Error loading meetings:', err);
      } finally {
          setLoading(false);
          setInitialLoading(false);
      }
  };

  const handleMeetingUpdate = (updatedMeeting: Meeting) => {
    setMeetings(prev => 
      prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m)
    );
    setSelectedMeeting(updatedMeeting);
  };

  const getProjectCount = (meeting: Meeting) => meeting.projects.length;
  const getTaskCount = (meeting: Meeting) => 
    meeting.projects.reduce((acc, project) => acc + project.tasks.length, 0);
  const getCompletedTaskCount = (meeting: Meeting) =>
    meeting.projects.reduce((acc, project) => 
      acc + project.tasks.filter(task => task.status === 'finish').length, 0
    );

  if (selectedMeeting) {
    return (
      <MeetingView 
        meeting={selectedMeeting} 
        onBack={() => setSelectedMeeting(null)}
        onUpdate={handleMeetingUpdate}
      />
    );
  }

  if (initialLoading) {
    return (
        <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Reports</h1>
              <p className="text-gray-600 text-lg">Manage your meetings, projects, and generate AI-powered reports</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-5 h-5" />
              New Meeting
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                  <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {meetings.reduce((acc, meeting) => acc + getProjectCount(meeting), 0)}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {meetings.reduce((acc, meeting) => acc + getTaskCount(meeting), 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {meetings.reduce((acc, meeting) => acc + getCompletedTaskCount(meeting), 0)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meetings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {meetings.map((meeting) => {
            const projectCount = getProjectCount(meeting);
            const taskCount = getTaskCount(meeting);
            const completedTasks = getCompletedTaskCount(meeting);
            const completionRate = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

            return (
              <Card 
                key={meeting.id} 
                className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedMeeting(meeting)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                        {meeting.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm leading-relaxed">
                        {meeting.description}
                      </CardDescription>
                    </div>
                    <Settings className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Date and Time */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(meeting.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{meeting.time}</span>
                  </div>

                  {/* Progress Statistics */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Projects</span>
                      <span className="font-medium text-gray-900">{projectCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tasks</span>
                      <span className="font-medium text-gray-900">{completedTasks}/{taskCount}</span>
                    </div>
                    {taskCount > 0 && (
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
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    {meeting.notes && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                        <FileText className="w-3 h-3 mr-1" />
                        Has Notes
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className={`text-xs border-2 ${
                        completionRate === 100 
                          ? 'border-green-500 text-green-700 bg-green-50' 
                          : completionRate > 0 
                          ? 'border-amber-500 text-amber-700 bg-amber-50'
                          : 'border-gray-400 text-gray-600 bg-gray-50'
                      }`}
                    >
                      {completionRate === 100 ? 'Complete' : completionRate > 0 ? 'In Progress' : 'Not Started'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {meetings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h3>
            <p className="text-gray-600 mb-4">Create your first meeting to get started with project management and reporting.</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Meeting
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}