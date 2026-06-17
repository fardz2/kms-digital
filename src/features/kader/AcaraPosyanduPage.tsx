import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { useReminderList } from '../../queries/useReminderQueries';
import TablePagination from '../laporan/TablePagination';

const DEFAULT_PAGE_SIZE = 6;

export default function AcaraPosyanduPage() {
  const navigate = useNavigate();
  const { data: reminders, isLoading, isError, refetch } = useReminderList();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const acaraMendatang = (reminders ?? [])
    .filter((reminder) => {
      if (!reminder.tanggal_reminder) return false;
      return !dayjs(reminder.tanggal_reminder).isBefore(dayjs(), 'day');
    })
    .toSorted((a, b) =>
      (a.tanggal_reminder ?? '').localeCompare(b.tanggal_reminder ?? '')
    );

  const pageCount = Math.max(Math.ceil(acaraMendatang.length / pageSize), 1);
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageStart = safePageIndex * pageSize;
  const visibleAcara = acaraMendatang.slice(pageStart, pageStart + pageSize);
  const terdekat = acaraMendatang[0];

  return (
    <div className="min-h-screen bg-faint-fog">
      <PageHeader
        eyebrow="Kader Posyandu"
        title="Acara Posyandu"
        subtitle="Daftar agenda mendatang yang dipisahkan dari halaman kerja balita."
        dataTourId="kader-acara-header"
        action={
          <Button
            variant="default"
            size="md"
            leadingIcon={<ArrowLeft size={18} strokeWidth={2} />}
            onClick={() => navigate('/kader/balita')}
          >
            Kembali ke Beranda
          </Button>
        }
      />

      <div className="max-w-[720px] mx-auto px-[17px] md:px-[25px] py-[25px] space-y-[25px]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[13px]">
          <Card className="p-[17px]">
            <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
              Agenda
            </p>
            <div className="text-display-lg font-bold text-deep-slate tabular-nums leading-none">
              {acaraMendatang.length}
            </div>
            <p className="text-caption text-graphite mt-[6px]">acara mendatang</p>
          </Card>
          <Card className="p-[17px]">
            <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
              Terdekat
            </p>
            <div className="text-body-sm font-semibold text-deep-slate leading-relaxed min-h-[48px]">
              {terdekat
                ? dayjs(terdekat.tanggal_reminder).format('DD MMMM YYYY')
                : 'Belum ada jadwal'}
            </div>
            <p className="text-caption text-graphite mt-[6px]">agenda paling awal</p>
          </Card>
          <Card className="p-[17px]">
            <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
              Halaman
            </p>
            <div className="text-display-lg font-bold text-deep-slate tabular-nums leading-none">
              {safePageIndex + 1}
            </div>
            <p className="text-caption text-graphite mt-[6px]">
              dari {pageCount} halaman
            </p>
          </Card>
        </div>

        {isError && <ErrorState onRetry={() => refetch()} />}

        {isLoading && !isError && <SkeletonList count={3} />}

        {!isLoading && !isError && acaraMendatang.length === 0 && (
          <Card>
            <div className="text-center py-[33px] text-body-sm text-graphite">
              Belum ada acara posyandu yang dijadwalkan.
            </div>
          </Card>
        )}

        {!isLoading && !isError && acaraMendatang.length > 0 && (
          <>
            <div className="space-y-[13px]">
              {visibleAcara.map((acara) => (
                <Card key={acara.id} className="p-[21px]">
                  <div className="flex items-start gap-[17px]">
                    <span className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-polar-mist text-primary-600 shrink-0">
                      <CalendarDays size={22} strokeWidth={1.75} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-[8px]">
                        <h2 className="text-body-sm font-semibold text-deep-slate break-words m-0">
                          {acara.judul}
                        </h2>
                        <span className="inline-flex items-center rounded-full bg-polar-mist px-[10px] py-[3px] text-caption font-bold text-primary-600">
                          Mendatang
                        </span>
                      </div>
                      <div className="text-caption font-medium text-primary-600 mt-[2px]">
                        {dayjs(acara.tanggal_reminder).format('dddd, DD MMMM YYYY')}
                      </div>
                      {acara.deskripsi && (
                        <div className="text-caption text-graphite mt-[6px] break-words leading-relaxed">
                          {acara.deskripsi}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <TablePagination
              pageIndex={safePageIndex}
              pageCount={pageCount}
              pageSize={pageSize}
              pageSizeOptions={[5, 6, 10, 20]}
              onPageIndexChange={setPageIndex}
              onPageSizeChange={(nextSize) => {
                setPageSize(nextSize);
                setPageIndex(0);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
