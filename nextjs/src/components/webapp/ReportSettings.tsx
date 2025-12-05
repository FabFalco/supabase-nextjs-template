'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/webapp/ui/card';
import { Button } from '@/components/webapp/ui/button';
import { Label } from '@/components/webapp/ui/label';
import { Textarea } from '@/components/webapp/ui/textarea';
import { Badge } from '@/components/webapp/ui/badge';
import { Settings, FileText, Users, Code, Save } from 'lucide-react';
import { ReportSettings as ReportSettingsType } from '@/types';
import { useState } from 'react';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';

interface ReportSettingsProps {
  settings: ReportSettingsType;
  meetingId: string;
  onUpdate: (settings: ReportSettingsType) => void;
}

const reportStyles = [
  {
    id: 'executive' as const,
    name: 'Executive Summary',
    description: 'High-level overview focused on key decisions and outcomes',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    preview: 'Concise, strategic focus, bullet points, action items'
  },
  {
    id: 'detailed' as const,
    name: 'Detailed Report',
    description: 'Comprehensive report with full discussion details',
    icon: <FileText className="w-5 h-5" />,
    color: 'bg-green-100 text-green-700 border-green-300',
    preview: 'Full context, detailed discussions, comprehensive analysis'
  },
  {
    id: 'client-friendly' as const,
    name: 'Client-Friendly',
    description: 'Non-technical language suitable for external stakeholders',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    preview: 'Simple language, business focused, minimal technical jargon'
  },
  {
    id: 'technical' as const,
    name: 'Technical Report',
    description: 'In-depth technical details for development teams',
    icon: <Code className="w-5 h-5" />,
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    preview: 'Technical specifications, code references, implementation details'
  }
];

export default function ReportSettings({ settings, meetingId, onUpdate }: ReportSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleStyleChange = (style: ReportSettingsType['style']) => {
    const newSettings = { ...localSettings, style };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handlePromptChange = (additionalPrompt: string) => {
    const newSettings = { ...localSettings, additionalPrompt };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = await createSPASassClient();
      const { error } = await supabase.updateReportSettings(
        meetingId,
        localSettings.style,
        localSettings.additionalPrompt
      );

      if (error) throw error;

      onUpdate(localSettings);
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving report settings:', err);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Report Settings</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Configure how AI generates reports from your meeting data
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : hasChanges ? 'Save Settings' : 'Settings Saved'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Report Style</CardTitle>
          <p className="text-sm text-gray-600">
            Choose the tone and format for your generated reports
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportStyles.map((style) => (
              <div
                key={style.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  localSettings.style === style.id
                    ? style.color + ' border-current'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleStyleChange(style.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    localSettings.style === style.id ? 'bg-white/80' : 'bg-white'
                  }`}>
                    {style.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{style.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{style.description}</p>
                    <p className="text-xs text-gray-500 italic">{style.preview}</p>
                  </div>
                  {localSettings.style === style.id && (
                    <Badge variant="secondary" className="bg-white/80 text-current">
                      Selected
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Additional Instructions</CardTitle>
          <p className="text-sm text-gray-600">
            Provide specific instructions to customize the AI report generation
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="additional-prompt" className="text-sm font-medium text-gray-700">
              Custom Prompt (Optional)
            </Label>
            <Textarea
              id="additional-prompt"
              value={localSettings.additionalPrompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="e.g., In FRENCH, focus on action items and deadlines, include team responsibilities, emphasize budget considerations..."
              className="mt-2 h-32"
            />
            <p className="text-xs text-gray-500 mt-2">
              This prompt will be added to the AI generation request to customize the output according to your specific needs.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800">Selected Style:</span>
              <Badge className={reportStyles.find(s => s.id === localSettings.style)?.color}>
                {reportStyles.find(s => s.id === localSettings.style)?.name}
              </Badge>
            </div>
            
            {localSettings.additionalPrompt && (
              <div>
                <span className="text-sm font-medium text-blue-800">Custom Instructions:</span>
                <p className="text-sm text-blue-700 bg-white/50 p-3 rounded-lg mt-1 italic">
                  "{localSettings.additionalPrompt}"
                </p>
              </div>
            )}

            <div className="text-sm text-blue-700">
              <p><strong>Report will include:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Meeting overview and participants</li>
                <li>Project status and progress updates</li>
                <li>Task summaries organized by status</li>
                <li>Meeting notes and key discussions</li>
                <li>Action items and next steps</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : hasChanges ? 'Save Settings' : 'Settings Saved'}
        </Button>
      </div> */}
    </div>
  );
}
