// src/app/app/layout.tsx
import AppLayout from '@/components/AppLayout';
import { GlobalProvider } from '@/lib/context/GlobalContext';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Providers } from '@/components/dashboard/providers';

export default function Layout({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient()
    return (
        //<GlobalProvider>
          //  <AppLayout>{children}</AppLayout>
        //</GlobalProvider>
        <Providers>
          {children}
        </Providers>
    );
}