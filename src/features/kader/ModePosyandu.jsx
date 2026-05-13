import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import PosyanduHeader from './PosyanduHeader';
import FilterChip from './FilterChip';
import BalitaCard from './BalitaCard';
import ApproveModal from './ApproveModal';
import { classifyBalita, priority } from './classifyBalita';
import Button from '../../components/ui/Button';
import PengukuranForm from '../pengukuran/PengukuranForm';
import { useSession } from '../auth/useSession';
import { usePengukuranBulananKader } from '../../queries/usePengukuranBulananKader';
import {
  usePendingOrangTua,
  usePendingAnak,
} from '../../queries/useApproveQueries';
import FormInputDataAnak from '../../components/form/FormInputDataAnak';

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
  const [approveOpen, setApproveOpen] = useState(false);

  const { data: pendingOT } = usePendingOrangTua(true);
  const { data: pendingAnak } = usePendingAnak(true);
  const pendingCount = (pendingOT?.length ?? 0) + (pendingAnak?.length ?? 0);

  const currentBulan = moment().format('YYYY-MM');

  const balitaWithMeta = useMemo(() => {
    return (anakList ?? []).map((anak) => ({
      anak,
      meta: classifyBalita(pengukuranByAnak[anak.id], currentBulan),
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
    <div className="min-h-screen bg-neutral-50 pb-24">
      <PosyanduHeader
        userName={user?.name}
        posyanduName={user?.posyandu_name}
        sudahCount={counts.semua - counts.belum}
        totalCount={counts.semua}
        pendingCount={pendingCount}
        onApprove={() => setApproveOpen(true)}
        onLaporan={() => navigate('/kader/laporan')}
        onKeluar={handleKeluar}
      />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="space-y-3">
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama balita..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-button text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
            />
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              aria-hidden
            >
              🔍
            </span>
          </div>
          <FilterChip value={filter} onChange={setFilter} counts={counts} />
        </div>

        {isLoading && (
          <div className="text-neutral-500">Memuat data balita...</div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            {balitaWithMeta.length === 0
              ? 'Belum ada data balita. Tambah balita baru di tombol bawah.'
              : 'Tidak ada balita yang cocok dengan filter.'}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {filtered.map(({ anak, meta }, i) => (
            <div
              key={anak.id}
              className="animate-in fade-in slide-in-from-bottom-1 duration-250"
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'backwards' }}
            >
              <BalitaCard
                anak={anak}
                meta={meta}
                onUkur={(a) => handleUkur(a, meta.latest)}
                onUlang={handleUlang}
                onLihat={handleLihat}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-neutral-200 p-4 z-20">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setTambahOpen(true)}
            className="w-full"
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

      <ApproveModal open={approveOpen} onClose={() => setApproveOpen(false)} />
    </div>
  );
}
