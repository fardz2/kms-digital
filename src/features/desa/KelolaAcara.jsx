import React from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import AcaraSection from './AcaraSection';

const MENU = [{ key: 'beranda', label: 'Beranda', path: '/desa/beranda' }];

export default function KelolaAcara() {
  return (
    <AppShell menu={MENU} activeKey="beranda">
      <PageHeader
        eyebrow="Pemerintah Desa"
        title="Kelola Acara Posyandu"
        subtitle="Buat pengingat acara untuk kader dan orang tua"
      />
      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
        <AcaraSection />
      </div>
    </AppShell>
  );
}
