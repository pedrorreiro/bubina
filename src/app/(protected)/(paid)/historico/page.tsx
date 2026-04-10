'use client';
import { HistoryTab } from '@/components/history/HistoryTab';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function HistoricoPage() {
  const { isLoading } = useApp();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
      </div>
    );
  }

  const handleSetActiveTab = (tab: string) => {
    router.push(`/${tab}`);
  };

  return (
    <HistoryTab onSetActiveTab={handleSetActiveTab} />
  );
}
