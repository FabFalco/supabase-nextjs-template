'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/webapp/ui/card';
import { Button } from '@/components/webapp/ui/button';
import { Input } from '@/components/webapp/ui/input';
import { Label } from '@/components/webapp/ui/label';
import { ArrowLeft, Key, Loader as Loader2 } from 'lucide-react';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import TopNavBar from '@/components/webapp/TopNavBar';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsChanging(true);

    try {
      const supabase = await createSPASassClient();
      const client = supabase.getSupabaseClient();

      const { error: updateError } = await client.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        router.push('/webapp');
      }, 2000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password');
    } finally {
      setIsChanging(false);
    }
  };

  const buttonBack = (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/webapp')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </div>
        );

  return (
    <>
      <TopNavBar title = {buttonBack}/>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Key className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                    Password changed successfully! Redirecting...
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/webapp')}
                    disabled={isChanging}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isChanging || success}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isChanging ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
