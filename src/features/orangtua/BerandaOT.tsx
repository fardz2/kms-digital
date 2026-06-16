import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Plus, ChevronRight, MessageCircle, Newspaper, CalendarDays } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useSession } from '../auth/useSession';
import { useAnakList } from '../../queries/useAnakQueries';
import { useReminderList } from '../../queries/useReminderQueries';
import FormInputDataAnak from '../../components/form/FormInputDataAnak';
import { SkeletonList } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';

function QuickLink({ Icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-[17px] w-full p-[21px] bg-white border border-light-ash rounded-default text-left hover:border-graphite/30 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
    >
      <span className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-polar-mist text-primary-600 shrink-0">
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-body-sm font-semibold text-deep-slate">{title}</span>
        <span className="block text-caption text-graphite mt-1">{desc}</span>
      </span>
      <ChevronRight size={18} strokeWidth={1.75} className="text-graphite shrink-0" />
    </button>
  );
}

export default function BerandaOT() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { data: anakList, isLoading, isError, error, refetch } = useAnakList();
  const { data: reminders, isLoading: remindersLoading } = useReminderList();
  const [formOpen, setFormOpen] = useState(false);

  const acaraMendatang = (reminders ?? [])
    .filter((r) => {
      if (!r.tanggal_reminder) return false;
      return !dayjs(r.tanggal_reminder).isBefore(dayjs(), 'day');
    })
    .toSorted((a, b) =>
      (a.tanggal_reminder ?? '').localeCompare(b.tanggal_reminder ?? '')
    );

  return (
    <div className="min-h-screen bg-faint-fog">
      <Navbar isLogin />
      <PageHeader
        title={`Halo, ${user?.name ?? 'Orang Tua'}`}
        eyebrow="Orang Tua"
        subtitle="Pantau pertumbuhan anak Anda."
      />

      <div className="max-w-[720px] mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[50px]">
        <section className="space-y-[21px]">
          <div className="flex justify-between items-center gap-[13px] flex-wrap">
            <div>
              <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
                Data Anak
              </p>
              <h2 className="text-heading-lg font-bold text-deep-slate leading-[1.15] tracking-tight m-0">
                Anak Saya
              </h2>
            </div>
            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus size={20} strokeWidth={2} />}
              onClick={() => setFormOpen(true)}
              data-tour-id="ot-tambah-anak"
            >
              Tambah Anak
            </Button>
          </div>

          {isError && <ErrorState onRetry={() => refetch()} error={error} />}

          {isLoading && !isError && <SkeletonList count={2} />}

          {!isLoading && !isError && (!anakList || anakList.length === 0) && (
            <Card>
              <div className="text-center py-[33px] space-y-[13px]">
                <p className="text-body-sm text-graphite">
                  Belum ada data anak. Tambah anak pertama Anda untuk mulai mencatat pertumbuhan.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  leadingIcon={<Plus size={18} strokeWidth={2} />}
                  onClick={() => setFormOpen(true)}
                >
                  Tambah Anak Pertama
                </Button>
              </div>
            </Card>
          )}

          <div data-tour-id="ot-home-anak-area" className="flex flex-col gap-[13px]">
            {(anakList ?? []).map((anak) => {
              const umurBulan = anak.tanggal_lahir
                ? dayjs().diff(dayjs(anak.tanggal_lahir), 'month')
                : null;
              return (
                <Card
                  key={anak.id}
                  onClick={() => navigate(`/orangtua/balita/${anak.id}`)}
                >
                  <div className="flex justify-between items-center gap-[13px]">
                    <div className="min-w-0">
                      <div className="text-heading-sm font-semibold text-deep-slate truncate">
                        {anak.nama}
                      </div>
                      <div className="text-caption text-graphite mt-1">
                        {umurBulan != null ? `${umurBulan} bulan · ` : ''}
                        {anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                      </div>
                    </div>
                    <ChevronRight size={18} strokeWidth={1.75} className="text-graphite shrink-0" />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-[21px]">
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
            <Card>
              <div className="text-center py-[33px] text-body-sm text-graphite">
                Belum ada acara posyandu yang dijadwalkan.
              </div>
            </Card>
          )}

          <div className="flex flex-col gap-[13px]">
            {acaraMendatang.map((acara) => (
              <Card key={acara.id}>
                <div className="flex items-start gap-[17px]">
                  <span className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-polar-mist text-primary-600 shrink-0">
                    <CalendarDays size={22} strokeWidth={1.75} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-body-sm font-semibold text-deep-slate break-words">
                      {acara.judul}
                    </div>
                    <div className="text-caption font-medium text-primary-600 mt-[2px]">
                      {acara.tanggal_reminder
                        ? dayjs(acara.tanggal_reminder).format('dddd, DD MMMM YYYY')
                        : '-'}
                    </div>
                    {acara.deskripsi && (
                      <div className="text-caption text-graphite mt-[6px] break-words">
                        {acara.deskripsi}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-[21px]">
          <p className="text-caption font-bold uppercase tracking-[0.12em] text-graphite">
            Lainnya
          </p>
          <div className="flex flex-col gap-[8px]">
            <div data-tour-id="ot-forum">
              <QuickLink
                Icon={MessageCircle}
                title="Ajukan Pertanyaan"
                desc="Tanya tenaga kesehatan tentang anak Anda"
                onClick={() => navigate('/orangtua/forum')}
              />
            </div>
            <div data-tour-id="ot-artikel">
              <QuickLink
                Icon={Newspaper}
                title="Artikel Kesehatan"
                desc="Baca artikel edukasi gizi dan tumbuh kembang"
                onClick={() => navigate('/artikel')}
              />
            </div>
          </div>
        </section>
      </div>

      <FormInputDataAnak
        isOpen={formOpen}
        onCancel={() => {
          setFormOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
