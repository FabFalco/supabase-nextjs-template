'use client';
import React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createSPAClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-user';
import { DashboardLayout } from './layout/dashboard-layout';
import { MeetingsList } from './meetings/meetings-list';
import { CreateMeetingDialog } from './meetings/create-meeting-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboard/ui/card';

export function Dashboard() {
  const { user } = useUser();
  const supabase = createSPAClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: meetings, isLoading } = useQuery({
    queryKey: ['meetings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          projects (
            *,
            tasks (*)
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [meetingsResult, projectsResult, tasksResult] = await Promise.all([
        supabase
          .from('meetings')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('projects')
          .select('id', { count: 'exact' })
          .eq('meetings.user_id', user.id),
        supabase
          .from('tasks')
          .select('id, status', { count: 'exact' })
          .eq('projects.meetings.user_id', user.id)
      ]);

      return {
        totalMeetings: meetingsResult.count || 0,
        totalProjects: projectsResult.count || 0,
        totalTasks: tasksResult.count || 0,
        completedTasks: tasksResult.data?.filter(task => task.status === 'finish').length || 0,
      };
    },
    enabled: !!user?.id,
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Welcome back! Here's an overview of your meetings and projects.
            </p>
          </div>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMeetings}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalTasks > 0 
                    ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion rate`
                    : 'No tasks yet'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Meetings List */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Meetings</h2>
          <MeetingsList meetings={meetings || []} isLoading={isLoading} />
        </div>
      </div>

      <CreateMeetingDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </DashboardLayout>
  );
}