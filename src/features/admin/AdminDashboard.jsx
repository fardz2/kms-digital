import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import AdminStatsGrid from './AdminStatsGrid';
import AdminActivityFeed from './AdminActivityFeed';
import { useAdminDashboardData } from './useAdminDashboardData';
import useAuth from '../../hook/useAuth';

function greetingPart() {
  const h = new Date().getHours();
  if (h < 11) return 'Pagi';
  if (h < 15) return 'Siang';
  if (h < 19) return 'Sore';
  return 'Malam';
}

export default function AdminDashboard() {
  const auth = useAuth();
  const adminName = auth?.user?.name ?? 'Admin';
  const { stats, activity, isLoading, hasPartialError } = useAdminDashboardData();

  return (
    <div>
      <PageHeader
        eyebrow={`Panel Admin · ${greetingPart()}`}
        title={`Halo, ${adminName}`}
        subtitle="Ringkasan aktivitas KMS Digital Lebakwangi."
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[33px]">
        <AdminStatsGrid stats={stats} loading={isLoading} />
        <AdminActivityFeed
          items={activity}
          loading={isLoading}
          hasPartialError={hasPartialError}
        />
      </div>
    </div>
  );
}
