'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/webapp/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/webapp/ui/card';
import { Badge } from '@/components/webapp/ui/badge';
import { Save, FileText, Clock, Type, List, Hash } from 'lucide-react';

interface NotesViewProps {
  notes: string;
  onUpdate: (notes: string) => void;
}

export default function NotesView({ notes, onUpdate }: NotesViewProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [hasChanges, setHasChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  useEffect(() => {
    const words = localNotes.trim() ? localNotes.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setHasChanges(localNotes !== notes);
  }, [localNotes, notes]);

  const handleSave = () => {
    onUpdate(localNotes);
    setHasChanges(false);
    setLastSaved(new Date());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = localNotes;
    const newText = currentText.substring(0, start) + text + currentText.substring(end);
    
    setLocalNotes(newText);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const formatText = (format: 'bold' | 'italic' | 'heading' | 'bullet') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localNotes.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'heading':
        formattedText = `## ${selectedText || 'Heading'}`;
        break;
      case 'bullet':
        formattedText = `\n- ${selectedText || 'List item'}`;
        break;
    }

    const newText = localNotes.substring(0, start) + formattedText + localNotes.substring(end);
    setLocalNotes(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + formattedText.length;
      textarea.selectionStart = textarea.selectionEnd = newPosition;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Notes Header */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Meeting Notes</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Take notes during your meeting for better reporting
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{wordCount}</span> words
              </div>
              {lastSaved && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {hasChanges ? 'Save Changes' : 'Saved'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Formatting Toolbar */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Format:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => formatText('heading')}
              className="flex items-center gap-1"
            >
              <Hash className="w-4 h-4" />
              Heading
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => formatText('bold')}
              className="flex items-center gap-1"
            >
              <Type className="w-4 h-4 font-bold" />
              Bold
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => formatText('italic')}
              className="flex items-center gap-1"
            >
              <Type className="w-4 h-4 italic" />
              Italic
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => formatText('bullet')}
              className="flex items-center gap-1"
            >
              <List className="w-4 h-4" />
              Bullet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes Editor */}
      <Card className="bg-white border-0 shadow-md">
        <CardContent className="p-0">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start taking notes during your meeting...

You can use markdown formatting:
- **bold text** for emphasis
- *italic text* for subtlety  
- ## Headings for sections
- - Bullet points for lists

Press Ctrl+S to save your notes."
              className="w-full h-96 p-6 text-gray-900 placeholder-gray-500 border-none outline-none resize-none font-mono text-sm leading-relaxed"
              style={{ fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace' }}
            />
            
            {hasChanges && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  Unsaved Changes
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200 border">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Notes Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use markdown formatting for better structure in your AI reports</li>
            <li>• Press Ctrl+S to save your notes quickly</li>
            <li>• Notes are automatically included in AI report generation</li>
            <li>• Use headings (##) to organize different discussion topics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}