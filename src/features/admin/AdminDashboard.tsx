import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import AdminStatsGrid from './AdminStatsGrid';
import AdminActivityFeed from './AdminActivityFeed';
import { useAdminDashboardData } from './useAdminDashboardData';
import { useSession } from '../auth/useSession';

function greetingPart() {
  const h = new Date().getHours();
  if (h < 11) return 'Pagi';
  if (h < 15) return 'Siang';
  if (h < 19) return 'Sore';
  return 'Malam';
}

export default function AdminDashboard() {
  const { user } = useSession();
  const adminName = user?.name ?? 'Admin';
  const { stats, activity, isLoading, hasPartialError } = useAdminDashboardData();

  return (
    <div>
      <PageHeader
        eyebrow={`Panel Admin · ${greetingPart()}`}
        title={`Halo, ${adminName}`}
        subtitle="Ringkasan aktivitas KMS Digital Lebakwangi."
        dataTourId="admin-dashboard-header"
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[33px]">
        <div data-tour-id="admin-stats">
          <AdminStatsGrid stats={stats} loading={isLoading} />
        </div>
        <AdminActivityFeed
          items={activity}
          loading={isLoading}
          hasPartialError={hasPartialError}
        />
      </div>
    </div>
  );
}
