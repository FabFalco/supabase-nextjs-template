'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/webapp/ui/dialog';
import { Button } from '@/components/webapp/ui/button';
import { Input } from '@/components/webapp/ui/input';
import { Label } from '@/components/webapp/ui/label';
import { Textarea } from '@/components/webapp/ui/textarea';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import { Loader as Loader2 } from 'lucide-react';

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMeetingCreated: () => void;
  userId: string;
}

export default function CreateMeetingDialog({ open, onOpenChange, onMeetingCreated, userId }: CreateMeetingDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !date || !time) {
      setError('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      const supabase = await createSPASassClient();
      const meetingDateTime = new Date(`${date}T${time}`);

      const { data, error: createError } = await supabase.createMeeting({
        title,
        description,
        date: meetingDateTime.toISOString(),
        duration,
        status: 'scheduled',
        user_id: userId
      });

      if (createError) throw createError;

      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setDuration(60);
      onOpenChange(false);
      onMeetingCreated();
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError('Failed to create meeting');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Meeting</DialogTitle>
          <DialogDescription>
            Enter the details for your new meeting. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q1 Strategy Planning"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the meeting"
              className="h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
              min="15"
              step="15"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Meeting'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
