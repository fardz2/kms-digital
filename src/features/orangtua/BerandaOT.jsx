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

      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-md)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-bold)',
              margin: 0,
            }}
          >
            Anak Saya
          </h2>
          <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
            + Tambah Anak
          </Button>
        </div>

        {isLoading && <div>Memuat...</div>}

        {!isLoading && (!anakList || anakList.length === 0) && (
          <Card>
            <div
              style={{
                textAlign: 'center',
                color: 'var(--color-muted)',
                padding: 'var(--space-lg)',
              }}
            >
              Belum ada data anak
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {(anakList ?? []).map((anak) => {
            const umurBulan = anak.tanggal_lahir
              ? moment().diff(moment(anak.tanggal_lahir), 'month')
              : null;
            return (
              <Card
                key={anak.id}
                onClick={() => navigate(`/orangtua/balita/${anak.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      {anak.nama}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-muted)',
                      }}
                    >
                      {umurBulan != null ? `${umurBulan} bulan` : '-'} ·{' '}
                      {anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                    </div>
                  </div>
                  <div style={{ fontSize: 'var(--text-xl)', color: 'var(--color-muted)' }}>
                    ›
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-md)',
            marginTop: 'var(--space-xl)',
          }}
        >
          <Card onClick={() => navigate('/orangtua/forum')}>
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>
              💬
            </div>
            <div
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Forum Tanya Jawab
            </div>
          </Card>
          <Card onClick={() => navigate('/artikel')}>
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>
              📰
            </div>
            <div
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Artikel Kesehatan
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
