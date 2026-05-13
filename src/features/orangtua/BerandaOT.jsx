import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useSession } from '../auth/useSession';
import { useAnakList } from '../../queries/useAnakQueries';
import FormInputDataAnak from '../../components/form/FormInputDataAnak';

const MENU = [
  { key: 'balita', label: 'Anak Saya', path: '/orangtua/balita' },
  { key: 'forum', label: 'Forum Tanya Jawab', path: '/orangtua/forum' },
  { key: 'artikel', label: 'Artikel', path: '/artikel' },
];

export default function BerandaOT() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { data: anakList, isLoading, refetch } = useAnakList();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <AppShell menu={MENU} activeKey="balita">
      <PageHeader
        title={`Halo, ${user?.name ?? 'Orang Tua'}`}
        subtitle="Pantau pertumbuhan anak Anda"
      />

      <div className="px-4 py-6 max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <h2 className="text-h2 font-display text-neutral-900 m-0">Anak Saya</h2>
          <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
            + Tambah Anak
          </Button>
        </div>

        {isLoading && <div className="text-neutral-500">Memuat...</div>}

        {!isLoading && (!anakList || anakList.length === 0) && (
          <Card>
            <div className="text-center py-6 text-neutral-500">
              Belum ada data anak
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {(anakList ?? []).map((anak) => {
            const umurBulan = anak.tanggal_lahir
              ? moment().diff(moment(anak.tanggal_lahir), 'month')
              : null;
            return (
              <Card
                key={anak.id}
                onClick={() => navigate(`/orangtua/balita/${anak.id}`)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-h3 font-display text-neutral-900">
                      {anak.nama}
                    </div>
                    <div className="text-caption text-neutral-500 mt-0.5">
                      {umurBulan != null ? `${umurBulan} bulan · ` : ''}
                      {anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                    </div>
                  </div>
                  <div className="text-2xl text-neutral-300">›</div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <Card
            onClick={() => navigate('/orangtua/forum')}
            className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
          >
            <div className="text-display mb-2" aria-hidden>💬</div>
            <div className="text-h3 font-display text-neutral-900">
              Forum Tanya Jawab
            </div>
            <div className="text-caption text-neutral-600 mt-1">
              Tanya tenaga kesehatan
            </div>
          </Card>
          <Card
            onClick={() => navigate('/artikel')}
            className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
          >
            <div className="text-display mb-2" aria-hidden>📰</div>
            <div className="text-h3 font-display text-neutral-900">
              Artikel Kesehatan
            </div>
            <div className="text-caption text-neutral-600 mt-1">
              Baca artikel edukasi gizi
            </div>
          </Card>
        </div>
      </div>

      <FormInputDataAnak
        isOpen={formOpen}
        onCancel={() => {
          setFormOpen(false);
          refetch();
        }}
      />
    </AppShell>
  );
}
