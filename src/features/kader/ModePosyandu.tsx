// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { AlertTriangle, Search, Plus } from 'lucide-react';
import PosyanduHeader from './PosyanduHeader';
import FilterChip from './FilterChip';
import BalitaCard from './BalitaCard';
import { classifyBalita, priority } from './classifyBalita';
import Button from '../../components/ui/Button';
import PengukuranForm from '../pengukuran/PengukuranForm';
import { useSession } from '../auth/useSession';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { usePengukuranBulananKader } from '../../queries/usePengukuranBulananKader';
import {
  usePendingOrangTua,
  usePendingAnak,
} from '../../queries/useApproveQueries';
import FormInputDataAnak from '../../components/form/FormInputDataAnak';

export default function ModePosyandu() {
  const navigate = useNavigate();
  const { user, logout } = useSession();
  const confirm = useConfirmDialog();
  const { anakList, pengukuranByAnak, isLoading } = usePengukuranBulananKader();
  const [filter, setFilter] = useState('semua');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAnak, setSelectedAnak] = useState(null);
  const [existingPengukuran, setExistingPengukuran] = useState(null);
  const [prefillFrom, setPrefillFrom] = useState(null);
  const [tambahOpen, setTambahOpen] = useState(false);

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
    confirm({
      title: 'Keluar dari akun?',
      icon: <AlertTriangle size={20} className="text-danger" />,
      content: 'Anda perlu masuk kembali untuk menggunakan aplikasi.',
      okText: 'Ya, Keluar',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () => {
        logout();
        navigate('/masuk', { replace: true });
      },
    });
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
    <div className="min-h-screen bg-faint-fog pb-[95px]">
      <PosyanduHeader
        userName={user?.name}
        posyanduName={user?.posyandu_name}
        sudahCount={counts.semua - counts.belum}
        totalCount={counts.semua}
        pendingCount={pendingCount}
        onAkunOrangTua={() => navigate('/kader/orangtua')}
        onLaporan={() => navigate('/kader/laporan')}
        onKeluar={handleKeluar}
      />

      <div className="max-w-[720px] mx-auto px-[17px] md:px-[25px] py-[25px] space-y-[25px]">
        <div className="space-y-[13px]">
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama balita..."
              aria-label="Cari balita"
              className="w-full h-[52px] pl-[42px] pr-[17px] bg-white border border-light-ash rounded-default text-base text-deep-slate placeholder:text-graphite focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
            <span
              className="absolute left-[13px] top-1/2 -translate-y-1/2 text-graphite pointer-events-none"
              aria-hidden
            >
              <Search size={18} strokeWidth={1.75} />
            </span>
          </div>
          <FilterChip value={filter} onChange={setFilter} counts={counts} />
        </div>

        {isLoading && (
          <div className="text-body-sm text-graphite">Memuat data balita...</div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-[50px] text-body-sm text-graphite">
            {balitaWithMeta.length === 0
              ? 'Belum ada data balita. Tambah balita baru di tombol bawah.'
              : 'Tidak ada balita yang cocok dengan filter.'}
          </div>
        )}

        <div className="flex flex-col gap-[8px]">
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

      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-light-ash p-[17px] z-20">
        <div className="max-w-[720px] mx-auto">
          <Button
            variant="primary"
            size="lg"
            leadingIcon={<Plus size={20} strokeWidth={2} />}
            onClick={() => setTambahOpen(true)}
            className="w-full"
          >
            Tambah Balita Baru
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
