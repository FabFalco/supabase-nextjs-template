'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/webapp/ui/card';
import { Button } from '@/components/webapp/ui/button';
import { Badge } from '@/components/webapp/ui/badge';
import { Sparkles, Download, Copy, RefreshCw, FileText, Clock, Mail, Save } from 'lucide-react';
import { Meeting } from '@/types';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import { useGlobal } from '@/lib/context/GlobalContext';
import { mapSupabaseToGeneratedReport } from '@/lib/mapper';

interface ReportGenerationProps {
  meeting: Meeting;
}

export default function ReportGeneration({ meeting }: ReportGenerationProps) {
  const { user } = useGlobal();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExistingReport();
  }, [meeting.id]);

  const loadExistingReport = async () => {
    setIsLoading(true);
    try {
      const supabase = await createSPASassClient();
      const { data: reportData, error: reportError } = await supabase.getGeneratedReport(meeting.id);

      if (!reportError && reportData) {
        const report = mapSupabaseToGeneratedReport(reportData)
        if (report.file_path) {
          const filePath = report.file_path.split('/').pop();
          if (filePath) {
            const { data: fileData, error: fileError } = await supabase.shareFile(
              user?.id || '',
              filePath,
              60,
              true
            );

            if (!fileError && fileData.signedUrl) {
              const response = await fetch(fileData.signedUrl);
              const content = await response.text();
              setGeneratedReport(content);
              setLastGenerated(new Date(report.created_at));
            }
          }
        } else if (report.content) {
          setGeneratedReport(report.content);
          setLastGenerated(new Date(report.created_at));
        }
      }
    } catch (err) {
      console.error('Error loading report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const report = generateMockReport(meeting);
      setGeneratedReport(report);
      setLastGenerated(new Date());
      setIsGenerating(false);
    }, 3000);
  };

  const saveReport = async () => {
    if (!generatedReport || !user?.id) return;

    setIsSaving(true);
    try {
      const supabase = await createSPASassClient();
      
      const fileName = `report_${meeting.id}_${Date.now()}.md`;
      const file = new Blob([generatedReport], { type: 'text/markdown' });
      const fileToUpload = new File([file], fileName, { type: 'text/markdown' });

      const { error: uploadError } = await supabase.uploadFile(user.id, fileName, fileToUpload);

      if (uploadError) throw uploadError;

      const filePath = `${user.id}/${fileName}`;
      const { error: saveError } = await supabase.saveGeneratedReport(meeting.id, generatedReport, filePath);

      if (saveError) throw saveError;

      alert('Report saved successfully to file storage!');
    } catch (err) {
      console.error('Error saving report:', err);
      alert('Failed to save report');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedReport) {
      navigator.clipboard.writeText(generatedReport);
      alert('Report copied to clipboard!');
    }
  };

  const downloadReport = () => {
    if (generatedReport) {
      const blob = new Blob([generatedReport], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meeting.title.replace(/\s+/g, '_')}_Report.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const createEmailDraft = () => {
    if (!generatedReport) return;

    const subject = encodeURIComponent(`Meeting Report: ${meeting.title}`);
    const body = encodeURIComponent(generatedReport);
    //let rtf = generatedReport
    // Titres
    //.replace(/^### (.*)$/gm, '{\\b\\fs28 $1}\\par')
    //.replace(/^## (.*)$/gm, '{\\b\\fs36 $1}\\par')
    //.replace(/^# (.*)$/gm, '{\\b\\fs48 $1}\\par')
    // Italique (attention, ici **...** = italique)
    //.replace(/\*\*(.*?)\*\*/g, '{\\i $1}')
    // Puces
    //.replace(/^- (.*)$/gm, '\\bullet $1\\par')
    // Sauts de ligne
    //.replace(/\n/g, '\n');

    //const rtfBody = '{\\rtf1\\ansi\n' + rtf + '\n}';

    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoLink;
  };

  const getTotalTasks = () => meeting.projects.reduce((acc, project) => acc + project.tasks.length, 0);
  const getCompletedTasks = () => meeting.projects.reduce((acc, project) => 
    acc + project.tasks.filter(task => task.status === 'finish').length, 0
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">AI Report Generation</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Generate comprehensive reports from your meeting data using AI
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {lastGenerated && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {lastGenerated.toLocaleString()}
                </div>
              )}
              <Button
                onClick={generateReport}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {(isGenerating || generatedReport) && (
        <Card className="bg-white border-0 shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <CardTitle className="text-lg text-gray-900">Generated Report</CardTitle>
                  {lastGenerated && (
                    <p className="text-sm text-gray-600">
                      Generated on {lastGenerated.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              {generatedReport && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createEmailDraft}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email Draft
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadReport}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveReport}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save to Storage'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-purple-600 absolute top-3 left-3 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900 mb-1">Generating AI Report</p>
                  <p className="text-sm text-gray-600">Analyzing meeting data and creating comprehensive report...</p>
                </div>
              </div>
            ) : generatedReport ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                    {generatedReport}
                  </pre>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Report Input Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-blue-800">Meeting:</span>
                <p className="text-blue-700">{meeting.title}</p>
              </div>
              {/*<div>
                <span className="text-sm font-medium text-blue-800">Date:</span>
                <p className="text-blue-700">{new Date(meeting.date).toLocaleDateString()} at {meeting.time}</p>
              </div>*/}
              <div>
                <span className="text-sm font-medium text-blue-800">Projects:</span>
                <p className="text-blue-700">{meeting.projects.length} projects</p>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">Tasks:</span>
                <p className="text-blue-700">{getCompletedTasks()}/{getTotalTasks()} completed</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-blue-800">Report Style:</span>
                <Badge className="ml-2 bg-blue-100 text-blue-700">
                  {meeting.reportSettings.style.charAt(0).toUpperCase() + meeting.reportSettings.style.slice(1).replace('-', ' ')}
                </Badge>
                <p className="text-blue-700">Write a report in style '{meeting.reportSettings.style.charAt(0).toUpperCase() + meeting.reportSettings.style.slice(1).replace('-', ' ')}' on the progress of the tasks listed below, highlighting key points and any potential blockers.</p>
                {/* en {meeting.reportSettings.style.language} */}
              </div>
              {/*<div>
                <span className="text-sm font-medium text-blue-800">Notes:</span>
                <p className="text-blue-700">
                  {meeting.notes ? `${meeting.notes.length} characters` : 'No notes'}
                </p>
              </div>*/}
              {meeting.reportSettings.additionalPrompt && (
                <div>
                  <span className="text-sm font-medium text-blue-800">Custom Instructions:</span>
                  <p className="text-blue-700 text-sm italic">"{meeting.reportSettings.additionalPrompt}"</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200 border">
        <CardContent className="p-4">
          <h4 className="font-medium text-amber-900 mb-2">Report Generation Features:</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• AI analyzes your meeting data, projects, tasks, and notes</li>
            <li>• Reports generated based on selected style and custom instructions</li>
            <li>• Create email drafts to send reports directly</li>
            <li>• Download reports as Markdown files</li>
            <li>• Save to Supabase storage (one report per meeting, automatically retrieved)</li>
            <li>• Regenerate reports anytime as meeting data changes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function generateMockReport(meeting: Meeting): string {
  const totalTasks = meeting.projects.reduce((acc, project) => acc + project.tasks.length, 0);
  const completedTasks = meeting.projects.reduce((acc, project) => 
    acc + project.tasks.filter(task => task.status === 'finish').length, 0
  );
  const inProgressTasks = meeting.projects.reduce((acc, project) => 
    acc + project.tasks.filter(task => task.status === 'in-progress').length, 0
  );
  const blockedTasks = meeting.projects.reduce((acc, project) => 
    acc + project.tasks.filter(task => task.status === 'blocked').length, 0
  );

  let report = '';

  switch (meeting.reportSettings.style) {
    case 'executive':
      report += `# Executive Summary: ${meeting.title}\n\n`;
      report += `**Date:** ${new Date(meeting.date).toLocaleDateString()} at ${meeting.time}\n`;
      report += `**Overall Progress:** ${Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}% Complete\n\n`;
      break;
    
    case 'client-friendly':
      report += `# Meeting Report: ${meeting.title}\n\n`;
      report += `Thank you for taking the time to meet with us on ${new Date(meeting.date).toLocaleDateString()}.\n\n`;
      report += `## Summary\n${meeting.description}\n\n`;
      break;
    
    case 'technical':
      report += `# Technical Report: ${meeting.title}\n\n`;
      report += `**Meeting Metadata:**\n`;
      report += `- Date/Time: ${new Date(meeting.date).toLocaleDateString()} ${meeting.time}\n`;
      report += `- Projects: ${meeting.projects.length}\n`;
      report += `- Total Tasks: ${totalTasks}\n\n`;
      break;
    
    default:
      report += `# Detailed Meeting Report: ${meeting.title}\n\n`;
      report += `**Meeting Overview:**\n`;
      report += `- Date: ${new Date(meeting.date).toLocaleDateString()}\n`;
      report += `- Time: ${meeting.time}\n`;
      report += `- Description: ${meeting.description}\n\n`;
  }

  report += `## Project Status\n\n`;
  
  meeting.projects.forEach((project) => {
    const projectCompleted = project.tasks.filter(task => task.status === 'finish').length;
    const projectTotal = project.tasks.length;
    const projectProgress = projectTotal > 0 ? Math.round((projectCompleted / projectTotal) * 100) : 0;

    report += `### ${project.name}\n`;
    report += `${project.description}\n\n`;
    report += `**Progress:** ${projectCompleted}/${projectTotal} tasks completed (${projectProgress}%)\n\n`;

    const tasksByStatus = {
      'finish': project.tasks.filter(t => t.status === 'finish'),
      'in-progress': project.tasks.filter(t => t.status === 'in-progress'),
      'blocked': project.tasks.filter(t => t.status === 'blocked')
    };

    Object.entries(tasksByStatus).forEach(([status, tasks]) => {
      if (tasks.length > 0) {
        const statusLabel = status === 'finish' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Blocked';
        report += `**${statusLabel} Tasks:**\n`;
        tasks.forEach(task => {
          report += `- ${task.title}: ${task.description}\n`;
        });
        report += `\n`;
      }
    });
  });

  if (meeting.notes) {
    report += `## Meeting Notes\n\n`;
    report += `${meeting.notes}\n\n`;
  }

  report += `## Summary & Next Steps\n\n`;
  
  if (meeting.reportSettings.style === 'executive') {
    report += `**Key Outcomes:**\n`;
    report += `- ${completedTasks} tasks completed across ${meeting.projects.length} projects\n`;
    if (blockedTasks > 0) {
      report += `- ${blockedTasks} tasks currently blocked - requiring immediate attention\n`;
    }
    if (inProgressTasks > 0) {
      report += `- ${inProgressTasks} tasks in active development\n`;
    }
  } else if (meeting.reportSettings.style === 'client-friendly') {
    report += `We made excellent progress during this meeting:\n\n`;
    report += `- Successfully completed ${completedTasks} tasks\n`;
    report += `- Currently working on ${inProgressTasks} ongoing initiatives\n`;
    if (blockedTasks > 0) {
      report += `- Identified ${blockedTasks} items that need your input to proceed\n`;
    }
  } else {
    report += `**Meeting Statistics:**\n`;
    report += `- Total Tasks: ${totalTasks}\n`;
    report += `- Completed: ${completedTasks}\n`;
    report += `- In Progress: ${inProgressTasks}\n`;
    report += `- Blocked: ${blockedTasks}\n`;
    report += `- Completion Rate: ${Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}%\n\n`;
  }

  //if (meeting.reportSettings.additionalPrompt) {
  //  report += `\n**Additional Considerations:**\n`;
  //  report += `${meeting.reportSettings.additionalPrompt}\n`;
  //}

  //report += `\n---\n`;
  //report += `*This report was generated automatically based on meeting data and notes.*`;

  return report;
}

function generateMockReportMD(meeting: Meeting): string {
  const totalTasks = meeting.projects.reduce((acc, project) => acc + project.tasks.length, 0);
  const completedTasks = meeting.projects.reduce((acc, project) => 
    acc + project.tasks.filter(task => task.status === 'finish').length, 0
  );
  const inProgressTasks = meeting.projects.reduce((acc, project) => 
    acc + project.tasks.filter(task => task.status === 'in-progress').length, 0
  );
  const blockedTasks = meeting.projects.reduce((acc, project) => 
    acc + project.tasks.filter(task => task.status === 'blocked').length, 0
  );

  let report = '';

  switch (meeting.reportSettings.style) {
    case 'executive':
      report += `# Executive Summary: ${meeting.title}\n\n`;
      report += `**Date:** ${new Date(meeting.date).toLocaleDateString()} at ${meeting.time}\n`;
      report += `**Overall Progress:** ${Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}% Complete\n\n`;
      break;
    
    case 'client-friendly':
      report += `# Meeting Report: ${meeting.title}\n\n`;
      report += `Thank you for taking the time to meet with us on ${new Date(meeting.date).toLocaleDateString()}.\n\n`;
      report += `## Summary\n${meeting.description}\n\n`;
      break;
    
    case 'technical':
      report += `# Technical Report: ${meeting.title}\n\n`;
      report += `**Meeting Metadata:**\n`;
      report += `- Date/Time: ${new Date(meeting.date).toLocaleDateString()} ${meeting.time}\n`;
      report += `- Projects: ${meeting.projects.length}\n`;
      report += `- Total Tasks: ${totalTasks}\n\n`;
      break;
    
    default:
      report += `# Detailed Meeting Report: ${meeting.title}\n\n`;
      report += `**Meeting Overview:**\n`;
      report += `- Date: ${new Date(meeting.date).toLocaleDateString()}\n`;
      report += `- Time: ${meeting.time}\n`;
      report += `- Description: ${meeting.description}\n\n`;
  }

  report += `## Project Status\n\n`;
  
  meeting.projects.forEach((project) => {
    const projectCompleted = project.tasks.filter(task => task.status === 'finish').length;
    const projectTotal = project.tasks.length;
    const projectProgress = projectTotal > 0 ? Math.round((projectCompleted / projectTotal) * 100) : 0;

    report += `### ${project.name}\n`;
    report += `${project.description}\n\n`;
    report += `**Progress:** ${projectCompleted}/${projectTotal} tasks completed (${projectProgress}%)\n\n`;

    const tasksByStatus = {
      'finish': project.tasks.filter(t => t.status === 'finish'),
      'in-progress': project.tasks.filter(t => t.status === 'in-progress'),
      'blocked': project.tasks.filter(t => t.status === 'blocked')
    };

    Object.entries(tasksByStatus).forEach(([status, tasks]) => {
      if (tasks.length > 0) {
        const statusLabel = status === 'finish' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Blocked';
        report += `**${statusLabel} Tasks:**\n`;
        tasks.forEach(task => {
          report += `- ${task.title}: ${task.description}\n`;
        });
        report += `\n`;
      }
    });
  });

  if (meeting.notes) {
    report += `## Meeting Notes\n\n`;
    report += `${meeting.notes}\n\n`;
  }

  report += `## Summary & Next Steps\n\n`;
  
  if (meeting.reportSettings.style === 'executive') {
    report += `**Key Outcomes:**\n`;
    report += `- ${completedTasks} tasks completed across ${meeting.projects.length} projects\n`;
    if (blockedTasks > 0) {
      report += `- ${blockedTasks} tasks currently blocked - requiring immediate attention\n`;
    }
    if (inProgressTasks > 0) {
      report += `- ${inProgressTasks} tasks in active development\n`;
    }
  } else if (meeting.reportSettings.style === 'client-friendly') {
    report += `We made excellent progress during this meeting:\n\n`;
    report += `- Successfully completed ${completedTasks} tasks\n`;
    report += `- Currently working on ${inProgressTasks} ongoing initiatives\n`;
    if (blockedTasks > 0) {
      report += `- Identified ${blockedTasks} items that need your input to proceed\n`;
    }
  } else {
    report += `**Meeting Statistics:**\n`;
    report += `- Total Tasks: ${totalTasks}\n`;
    report += `- Completed: ${completedTasks}\n`;
    report += `- In Progress: ${inProgressTasks}\n`;
    report += `- Blocked: ${blockedTasks}\n`;
    report += `- Completion Rate: ${Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}%\n\n`;
  }

  if (meeting.reportSettings.additionalPrompt) {
    report += `\n**Additional Considerations:**\n`;
    report += `${meeting.reportSettings.additionalPrompt}\n`;
  }

  report += `\n---\n`;
  report += `*This report was generated automatically based on meeting data and notes.*`;

  return report;
}
