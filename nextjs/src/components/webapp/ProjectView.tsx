'use client';

import { useState } from 'react';
import { Button } from '@/components/webapp/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/webapp/ui/card';
import { Badge } from '@/components/webapp/ui/badge';
import { ArrowLeft, Plus, GripVertical } from 'lucide-react';
import { Project, Task } from '@/types';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import TopNavBar from '@/components/webapp/TopNavBar';

interface ProjectViewProps {
  project: Project;
  meetingTitle: string;
  onBack: () => void;
  onUpdate: (project: Project) => void;
}

const statusConfig = {
  'in-progress': {
    label: 'In Progress',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    bgColor: 'bg-amber-50',
    headerColor: 'bg-amber-500'
  },
  'blocked': {
    label: 'Blocked',
    color: 'bg-red-100 text-red-800 border-red-200',
    bgColor: 'bg-red-50',
    headerColor: 'bg-red-500'
  },
  'finish': {
    label: 'Finished',
    color: 'bg-green-100 text-green-800 border-green-200',
    bgColor: 'bg-green-50',
    headerColor: 'bg-green-500'
  }
};

export default function ProjectView({ project, meetingTitle, onBack, onUpdate }: ProjectViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
    setDraggedFrom(task.status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();

    if (draggedTask && draggedFrom !== newStatus) {
      const updatedTasks = project.tasks.map(task =>
        task.id === draggedTask.id
          ? { ...task, status: newStatus }
          : task
      );

      onUpdate({ ...project, tasks: updatedTasks });

      try {
        const supabase = await createSPASassClient();
        await supabase.updateTask(draggedTask.id, { status: newStatus });
      } catch (err) {
        console.error('Error updating task status:', err);
      }
    }

    setDraggedTask(null);
    setDraggedFrom(null);
  };

  const getTasksByStatus = (status: Task['status']) => {
    return project.tasks.filter(task => task.status === status);
  };

  const addNewTask = async (status: Task['status']) => {
    try {
      const supabase = await createSPASassClient();
      const { data, error } = await supabase.createTask({
        title: 'New Task',
        description: 'Click to edit description',
        status,
        project_id: project.id,
        order_index: project.tasks.length
      });

      if (error) throw error;

      if (data) {
        const newTask: Task = {
          id: data.id,
          title: data.title,
          status: data.status as Task['status'],
          description: data.description || ''
        };

        onUpdate({
          ...project,
          tasks: [...project.tasks, newTask]
        });
      }
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = project.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );

    onUpdate({ ...project, tasks: updatedTasks });

    try {
      const supabase = await createSPASassClient();
      await supabase.updateTask(taskId, updates);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  return (
    <>
    <TopNavBar title={""}/>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {meetingTitle}
          </Button>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>📋 {project.tasks.length} Total Tasks</span>
              <span>✅ {getTasksByStatus('finish').length} Completed</span>
              <span>🚧 {getTasksByStatus('in-progress').length} In Progress</span>
              <span>🚫 {getTasksByStatus('blocked').length} Blocked</span>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['in-progress', 'blocked', 'finish'] as const).map((status) => {
            const config = statusConfig[status];
            const tasks = getTasksByStatus(status);
            
            return (
              <div key={status} className="flex flex-col h-fit">
                {/* Column Header */}
                <div className={`${config.headerColor} text-white rounded-t-lg p-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{config.label}</h3>
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                      {tasks.length}
                    </Badge>
                  </div>
                </div>

                {/* Tasks Container */}
                <div
                  className={`${config.bgColor} flex-1 p-4 rounded-b-lg border-2 border-gray-200 min-h-[400px]`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <Card
                        key={task.id}
                        className="bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-move group"
                        draggable
                        onDragStart={() => handleDragStart(task)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle 
                              className="text-sm font-medium text-gray-900 flex-1 cursor-text"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => updateTask(task.id, { title: e.currentTarget.textContent || '' })}
                            >
                              {task.title}
                            </CardTitle>
                            <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p 
                            className="text-xs text-gray-600 leading-relaxed cursor-text"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateTask(task.id, { description: e.currentTarget.textContent || '' })}
                          >
                            {task.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Add Task Button */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-600 hover:text-gray-900 border-2 border-dashed border-gray-300 hover:border-gray-400 h-auto py-4"
                      onClick={() => addNewTask(status)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 How to use the Kanban board:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Drag tasks between columns to change their status</li>
            <li>• Click on task titles or descriptions to edit them inline</li>
            <li>• Use "Add Task" to create new tasks in each column</li>
            <li>• Tasks automatically save when you make changes</li>
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}