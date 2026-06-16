import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { AlertTriangle, Search, Plus, CalendarDays } from 'lucide-react';
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
import { useReminderList } from '../../queries/useReminderQueries';
import FormInputDataAnak from '../../components/form/FormInputDataAnak';
import { SkeletonList } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import ProfileModal from '../../components/ui/ProfileModal';

export default function ModePosyandu() {
  const navigate = useNavigate();
  const { user, logout } = useSession();
  const confirm = useConfirmDialog();
  const { anakList, pengukuranByAnak, isLoading, isError, refetch } = usePengukuranBulananKader();
  const [filter, setFilter] = useState('semua');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAnak, setSelectedAnak] = useState(null);
  const [existingPengukuran, setExistingPengukuran] = useState(null);
  const [prefillFrom, setPrefillFrom] = useState(null);
  const [tambahOpen, setTambahOpen] = useState(false);
  const [sandiOpen, setSandiOpen] = useState(false);

  const { data: pendingOT } = usePendingOrangTua(true);
  const { data: pendingAnak } = usePendingAnak(true);
  const { data: reminders, isLoading: remindersLoading } = useReminderList();
  const pendingCount = (pendingOT?.length ?? 0) + (pendingAnak?.length ?? 0);

  const currentBulan = dayjs().format('YYYY-MM');
  const acaraMendatang = (reminders ?? [])
    .filter((r) => {
      if (!r.tanggal_reminder) return false;
      return !dayjs(r.tanggal_reminder).isBefore(dayjs(), 'day');
    })
    .toSorted((a, b) =>
      (a.tanggal_reminder ?? '').localeCompare(b.tanggal_reminder ?? '')
    );

  const balitaWithMeta = (anakList ?? []).map((anak) => ({
    anak,
    meta: classifyBalita(pengukuranByAnak[anak.id], currentBulan),
  }));

  const counts = {
    semua: balitaWithMeta.length,
    belum: balitaWithMeta.filter((x) => !x.meta.sudahDiukur).length,
    perhatian: balitaWithMeta.filter((x) => x.meta.perluPerhatian).length,
    stunting: balitaWithMeta.filter((x) => x.meta.status === 'stunting').length,
    kurang: balitaWithMeta.filter((x) => x.meta.status === 'kurang').length,
    obesitas: balitaWithMeta.filter((x) => x.meta.status === 'obesitas').length,
  };

  const filtered = (() => {
    const q = search.trim().toLowerCase();
    return balitaWithMeta
      .filter(({ anak, meta }) => {
        if (q && !(anak.nama ?? '').toLowerCase().includes(q)) return false;
        if (filter === 'belum') return !meta.sudahDiukur;
        if (filter === 'perhatian') return meta.perluPerhatian;
        if (filter === 'stunting' || filter === 'kurang' || filter === 'obesitas') {
          return meta.status === filter;
        }
        return true;
      })
      .sort((a, b) => {
        const pa = priority(a.meta);
        const pb = priority(b.meta);
        if (pa !== pb) return pa - pb;
        return (a.anak.nama ?? '').localeCompare(b.anak.nama ?? '');
      });
  })();

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
        onUbahSandi={() => setSandiOpen(true)}
        onKeluar={handleKeluar}
      />

      <div className="max-w-[720px] mx-auto px-[17px] md:px-[25px] py-[25px] space-y-[25px]">
        <div className="space-y-[13px]">
          <div className="relative" data-tour-id="kader-search">
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
          <div data-tour-id="kader-filter">
            <FilterChip value={filter} onChange={setFilter} counts={counts} />
          </div>
        </div>

        <section className="space-y-[17px]" data-tour-id="kader-acara">
          <div>
            <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
              Jadwal
            </p>
            <h2 className="text-heading-lg font-bold text-deep-slate leading-[1.15] tracking-tight m-0">
              Acara Posyandu
            </h2>
          </div>

          {remindersLoading && <SkeletonList count={2} />}

          {!remindersLoading && acaraMendatang.length === 0 && (
            <div className="bg-white border border-light-ash rounded-default py-[33px] px-[21px] text-center text-body-sm text-graphite">
              Belum ada acara posyandu yang dijadwalkan.
            </div>
          )}

          <div className="flex flex-col gap-[8px]">
            {acaraMendatang.map((acara) => (
              <div
                key={acara.id}
                className="bg-white border border-light-ash rounded-default p-[17px] transition-colors duration-150 hover:border-graphite/30"
              >
                <div className="flex items-start gap-[13px]">
                  <span className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-polar-mist text-primary-600 shrink-0">
                    <CalendarDays size={20} strokeWidth={1.75} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-body-sm font-semibold text-deep-slate break-words">
                      {acara.judul}
                    </div>
                    <div className="text-caption font-medium text-primary-600 mt-[2px]">
                      {dayjs(acara.tanggal_reminder).format('dddd, DD MMMM YYYY')}
                    </div>
                    {acara.deskripsi && (
                      <div className="text-caption text-graphite mt-[6px] break-words">
                        {acara.deskripsi}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isError && <ErrorState onRetry={() => refetch()} />}

        {isLoading && !isError && <SkeletonList count={3} />}

        {!isLoading && !isError && filtered.length === 0 && (
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
            data-tour-id="kader-tambah"
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

      <ProfileModal
        open={sandiOpen}
        onClose={() => setSandiOpen(false)}
        fallbackName={user?.name}
        variant="password-only"
      />
    </div>
  );
}
