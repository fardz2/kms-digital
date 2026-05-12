import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAnakList } from '../../queries/useAnakQueries';

export default function DaftarAnak() {
  const navigate = useNavigate();
  const { data: anakList, isLoading } = useAnakList();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!anakList) return [];
    const q = query.trim().toLowerCase();
    if (!q) return anakList;
    return anakList.filter(
      (a) =>
        (a.nama ?? '').toLowerCase().includes(q) ||
        (a.nama_ortu ?? '').toLowerCase().includes(q)
    );
  }, [anakList, query]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader title="Daftar Balita" subtitle={`${filtered.length} balita`} />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-md)' }}>
          ← Kembali
        </Button>

        <input
          type="search"
          placeholder="🔍 Cari nama balita atau orang tua..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            fontSize: 'var(--text-base)',
            borderRadius: 'var(--radius-button)',
            border: '1px solid var(--color-border)',
            marginBottom: 'var(--space-md)',
          }}
        />

        {isLoading && (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>Memuat...</div>
        )}

        {!isLoading && filtered.length === 0 && (
          <Card>
            <div style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
              {query ? 'Tidak ada balita yang cocok' : 'Belum ada data balita'}
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.map((anak) => {
            const umurBulan = anak.tanggal_lahir
              ? moment().diff(moment(anak.tanggal_lahir), 'month')
              : null;
            return (
              <Card
                key={anak.id}
                onClick={() => navigate(`/kader/balita/${anak.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                      {anak.nama}
                    </div>
                    <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
                      {umurBulan != null ? `${umurBulan} bulan` : '-'} · {anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                    </div>
                    {anak.nama_ortu && (
                      <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
                        Ortu: {anak.nama_ortu}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 'var(--text-xl)', color: 'var(--color-muted)' }}>›</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
