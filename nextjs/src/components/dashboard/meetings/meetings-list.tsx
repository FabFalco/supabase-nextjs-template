'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard/ui/card';
import { Badge } from '@/components/dashboard/ui/badge';
import { Button } from '@/components/dashboard/ui/button';
import { Calendar, Clock, Users, ExternalLink } from 'lucide-react';
import { LoadingSpinner } from '@/components/dashboard/ui/loading-spinner';
import Link from 'next/link';

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  status: string;
  projects?: Array<{
    id: string;
    name: string;
    tasks: Array<{ id: string; status: string }>;
  }>;
}

interface MeetingsListProps {
  meetings: Meeting[];
  isLoading: boolean;
}

export function MeetingsList({ meetings, isLoading }: MeetingsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <CardTitle className="text-lg text-gray-900 mb-2">No meetings yet</CardTitle>
          <CardDescription>
            Create your first meeting to get started with MeetingFlow.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Scheduled';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {meetings.map((meeting) => {
        const totalTasks = meeting.projects?.reduce((acc, project) => acc + project.tasks.length, 0) || 0;
        const completedTasks = meeting.projects?.reduce(
          (acc, project) => acc + project.tasks.filter(task => task.status === 'finish').length,
          0
        ) || 0;

        return (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{meeting.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {meeting.description || 'No description provided'}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(meeting.status)}>
                  {getStatusText(meeting.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(meeting.date), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {meeting.duration}m
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {totalTasks > 0 ? `${completedTasks}/${totalTasks} tasks` : '0 tasks'}
                  </span>
                </div>
                
                {totalTasks > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {meeting.projects?.length || 0} projects
                </div>
                
                <Link href={`/dashboard/meetings/${meeting.id}`}>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}