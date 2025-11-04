'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/webapp/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/webapp/ui/dropdown-menu';
import { User, LogOut, Key, CreditCard } from 'lucide-react';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import { useGlobal } from '@/lib/context/GlobalContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/dashboard/ui/avatar';

export default function TopNavBar({ title = (<h1 className="text-xl font-bold text-gray-900">Meeting Reports</h1>) }) {
  const router = useRouter();
  const { user } = useGlobal();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = await createSPASassClient();
      await supabase.logout();
    } catch (err) {
      console.error('Error logging out:', err);
      setIsLoggingOut(false);
    }
  };

  const handleChangePassword = () => {
    router.push('/webapp/settings/change-password');
  };

  const handleStripeSettings = () => {
    router.push('/webapp/settings/stripe');
  };

  const handleManageStripeSettings = () => {
    router.push('/webapp/settings/stripe/management');
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {title}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.email} alt="Profile" />
                        <AvatarFallback>
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleChangePassword}>
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={handleStripeSettings}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Stripe Settings
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleManageStripeSettings}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Stripe Settings
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
