import { useEffect } from 'react';

type HistoryState = {
  page: 'meetings' | 'meeting' | 'project';
  meetingId?: string;
  projectId?: string;
};

export function useHistoryBack(onBack: () => void, page: HistoryState['page']) {
  useEffect(() => {
    const state: HistoryState = { page };
    window.history.pushState(state, '');

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as HistoryState | null;

      //if (state?.page === 'meetings') {
        onBack();
      //}
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBack, page]);
}
