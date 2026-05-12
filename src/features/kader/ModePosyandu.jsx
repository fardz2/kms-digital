import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import PosyanduHeader from './PosyanduHeader';
import FilterChip from './FilterChip';
import BalitaCard from './BalitaCard';
import Button from '../../components/ui/Button';
import PengukuranForm from '../pengukuran/PengukuranForm';
import { useSession } from '../auth/useSession';
import { usePengukuranBulananKader } from '../../queries/usePengukuranBulananKader';
import { overallStatus, STATUS } from '../pengukuran/statusGizi';
import FormInputDataAnak from '../../components/form/FormInputDataAnak';

const toZ = (v) => (v == null || v === '' ? null : Number(v));

function classify(pengukuranList, currentBulan) {
  const safe = pengukuranList ?? [];
  const latest = safe
    .slice()
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];
  const bulanIni = safe.filter(
    (p) => moment(p.date).format('YYYY-MM') === currentBulan
  );
  const latestBulanIni = bulanIni
    .slice()
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];
  const status = latest
    ? overallStatus({
        zScoreBB: toZ(latest.z_score_berat),
        zScoreTB: toZ(latest.z_score_tinggi),
        zScoreLK: toZ(latest.z_score_lingkar_kepala),
        zScoreGizi: toZ(latest.z_score_gizi),
      })
    : STATUS.UNKNOWN;
  const sudahDiukur = !!latestBulanIni;
  const perluPerhatian = status !== STATUS.NORMAL && status !== STATUS.UNKNOWN;
  return { latest, latestBulanIni, sudahDiukur, perluPerhatian };
}

function priority(meta) {
  if (meta.perluPerhatian) return 0;
  if (!meta.sudahDiukur) return 1;
  return 2;
}

export default function ModePosyandu() {
  const navigate = useNavigate();
  const { user, logout } = useSession();
  const { anakList, pengukuranByAnak, isLoading } = usePengukuranBulananKader();
  const [filter, setFilter] = useState('semua');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAnak, setSelectedAnak] = useState(null);
  const [existingPengukuran, setExistingPengukuran] = useState(null);
  const [prefillFrom, setPrefillFrom] = useState(null);
  const [tambahOpen, setTambahOpen] = useState(false);

  const currentBulan = moment().format('YYYY-MM');

  const balitaWithMeta = useMemo(() => {
    return (anakList ?? []).map((anak) => ({
      anak,
      meta: classify(pengukuranByAnak[anak.id], currentBulan),
    }));
  }, [anakList, pengukuranByAnak, currentBulan]);

  const counts = useMemo(
    () => ({
      semua: balitaWithMeta.length,
      belum: balitaWithMeta.filter((x) => !x.meta.sudahDiukur).length,
      perhatian: balitaWithMeta.filter((x) => x.meta.perluPerhatian).length,
    }),
    [balitaWithMeta]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return balitaWithMeta
      .filter(({ anak, meta }) => {
        if (q && !(anak.nama ?? '').toLowerCase().includes(q)) return false;
        if (filter === 'belum') return !meta.sudahDiukur;
        if (filter === 'perhatian') return meta.perluPerhatian;
        return true;
      })
      .sort((a, b) => {
        const pa = priority(a.meta);
        const pb = priority(b.meta);
        if (pa !== pb) return pa - pb;
        return (a.anak.nama ?? '').localeCompare(b.anak.nama ?? '');
      });
  }, [balitaWithMeta, search, filter]);

  const handleKeluar = () => {
    if (window.confirm('Keluar dari akun?')) {
      logout();
      navigate('/masuk', { replace: true });
    }
  };

  const handleUkur = (anak, latest) => {
    setSelectedAnak(anak);
    setExistingPengukuran(null);
    setPrefillFrom(
      latest
        ? {
            berat: Number(latest.berat),
            tinggi: Number(latest.tinggi),
            lingkar_kepala: Number(latest.lingkar_kepala),
            lila: latest.lila != null ? Number(latest.lila) : null,
          }
        : null
    );
    setFormOpen(true);
  };

  const handleUlang = (anak, pengukuran) => {
    setSelectedAnak(anak);
    setExistingPengukuran(pengukuran);
    setPrefillFrom(null);
    setFormOpen(true);
  };

  const handleLihat = (anak) => {
    navigate(`/kader/balita/${anak.id}`);
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelectedAnak(null);
    setExistingPengukuran(null);
    setPrefillFrom(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', paddingBottom: 80 }}>
      <PosyanduHeader
        userName={user?.name}
        posyanduName={user?.posyandu_name}
        sudahCount={counts.semua - counts.belum}
        totalCount={counts.semua}
        onLaporan={() => navigate('/kader/laporan')}
        onKeluar={handleKeluar}
      />

      <div
        style={{
          padding: 'var(--space-md) var(--space-lg) 0',
          position: 'sticky',
          top: 140,
          zIndex: 5,
          background: 'var(--color-surface)',
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Cari nama balita..."
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            fontSize: 'var(--text-base)',
            borderRadius: 'var(--radius-button)',
            border: '1px solid var(--color-border)',
            marginBottom: 'var(--space-sm)',
          }}
        />
        <FilterChip value={filter} onChange={setFilter} counts={counts} />
      </div>

      <div style={{ padding: 'var(--space-md) var(--space-lg)', maxWidth: 960, margin: '0 auto' }}>
        {isLoading && <div>Memuat data balita...</div>}
        {!isLoading && filtered.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-xl)',
              color: 'var(--color-muted)',
            }}
          >
            {balitaWithMeta.length === 0
              ? 'Belum ada data balita. Tambah balita baru di tombol bawah.'
              : 'Tidak ada balita yang cocok dengan filter.'}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.map(({ anak, meta }) => (
            <BalitaCard
              key={anak.id}
              anak={anak}
              pengukuranList={pengukuranByAnak[anak.id]}
              currentBulan={currentBulan}
              onUkur={(a) => handleUkur(a, meta.latest)}
              onUlang={handleUlang}
              onLihat={handleLihat}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'var(--space-md)',
          background: 'var(--color-bg)',
          borderTop: '1px solid var(--color-border)',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setTambahOpen(true)}
            style={{ width: '100%' }}
          >
            + Tambah Balita Baru
          </Button>
        </div>
      </div>

      <PengukuranForm
        open={formOpen}
        onClose={closeForm}
        anak={selectedAnak}
        existing={existingPengukuran}
        prefillFrom={prefillFrom}
      />

      <FormInputDataAnak
        isOpen={tambahOpen}
        onCancel={() => setTambahOpen(false)}
      />
    </div>
  );
}
