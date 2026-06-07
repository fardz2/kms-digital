import React, { lazy, Suspense, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { ArrowLeft, Printer } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useAnakDetail } from '../../queries/useAnakQueries';
import {
  usePengukuranAnak,
  useDeletePengukuran,
} from '../../queries/usePengukuranQueries';
import { useSession } from '../auth/useSession';
import PengukuranForm from '../pengukuran/PengukuranForm';
import RiwayatCard from './RiwayatCard';
import ErrorState from '../../components/ui/ErrorState';
import { printElementToPdf } from '../../utils/printElementToPdf';
const ChartWHO = lazy(() => import('./ChartWHO'));

export default function DetailAnak() {
  const { id: idParam } = useParams();
  const id = idParam != null && idParam !== '' ? Number(idParam) : undefined;
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirmDialog();
  const { role } = useSession();

  const { data: anak, isLoading: anakLoading, isError: anakError, refetch: refetchAnak } = useAnakDetail(id);
  const { data: pengukuran, isLoading: pengukuranLoading, isError: pengukuranError, refetch: refetchPengukuran } = usePengukuranAnak(id);
  const deleteMutation = useDeletePengukuran(id);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const hasPengukuran = !!pengukuran && pengukuran.length > 0;

  const handleDownloadPdf = async () => {
    try {
      setIsPrinting(true);
      const filename = `Kartu-KMS-${(anak?.nama ?? 'anak').replace(/\s+/g, '-')}-${dayjs().format('YYYY-MM-DD')}.pdf`;
      await printElementToPdf(printRef.current, filename);
      toast.success('Kartu KMS PDF berhasil dibuat');
    } catch (err) {
      console.error('Kartu KMS PDF export error:', err);
      toast.error('Gagal membuat PDF');
    } finally {
      setIsPrinting(false);
    }
  };

  const canEdit = role === 'KADER_POSYANDU';

  const handleEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleDelete = (item) => {
    confirm({
      title: 'Hapus pengukuran?',
      icon: <ExclamationCircleOutlined />,
      content: `Data tanggal ${dayjs(item.date).format('DD MMMM YYYY')} akan dihapus.`,
      okText: 'Ya, Hapus',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteMutation.mutate(item.id, {
          onSuccess: () => toast.success('Pengukuran dihapus'),
          onError: (err) => toast.error(err?.message ?? 'Gagal menghapus'),
        });
      },
    });
  };

  const umur = anak?.tanggal_lahir
    ? dayjs().diff(dayjs(anak.tanggal_lahir), 'month')
    : null;

  return (
    <>
      {toast.contextHolder}
      <div className="min-h-screen bg-neutral-50">
        <PageHeader
          title={anakLoading ? 'Memuat...' : (anak?.nama ?? '-')}
          subtitle={
            umur != null
              ? `${umur} bulan · ${anak?.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}`
              : undefined
          }
        />

        <div className="px-4 py-6 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<ArrowLeft size={16} strokeWidth={1.75} />}
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            Kembali
          </Button>

          {(anakError || pengukuranError) && (
            <ErrorState
              onRetry={() => {
                refetchAnak();
                refetchPengukuran();
              }}
            />
          )}

          {hasPengukuran && (
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Printer size={16} strokeWidth={1.75} />}
              onClick={handleDownloadPdf}
              loading={isPrinting}
              disabled={isPrinting || anakLoading}
              className="mb-4 ml-2"
            >
              Unduh Kartu KMS (PDF)
            </Button>
          )}

          {canEdit && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleAdd}
              className="w-full mb-6"
            >
              + Ukur Pengukuran Baru
            </Button>
          )}

          <div ref={printRef} className="bg-white p-[17px]">
            <div className="mb-[17px]">
              <h1 className="text-heading font-bold text-deep-slate">
                {anak?.nama ?? '-'}
              </h1>
              <p className="text-body-sm text-graphite">
                {umur != null ? `${umur} bulan · ` : ''}
                {anak?.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>

            <h2 className="text-heading font-semibold text-deep-slate mb-[17px]">
              Riwayat Pengukuran
            </h2>

            {pengukuranLoading && !pengukuranError && (
              <div className="text-neutral-500 py-6">Memuat...</div>
            )}

            {!pengukuranLoading && !pengukuranError && (!pengukuran || pengukuran.length === 0) && (
              <div className="p-[33px] text-center bg-white border border-light-ash rounded-default text-body-sm text-graphite">
                Belum ada data pengukuran
              </div>
            )}

            <div data-tour-id="anak-detail-riwayat" className="flex flex-col gap-3 mb-10">
              {(pengukuran ?? [])
                .toSorted((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
                .map((p) => (
                  <RiwayatCard
                    key={p.id}
                    pengukuran={p}
                    canEdit={canEdit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
            </div>

            {pengukuran && pengukuran.length > 0 && (
              <>
                <h2 className="text-heading font-semibold text-deep-slate mb-[17px]">
                  Grafik Pertumbuhan (WHO)
                </h2>
                <div data-tour-id="anak-detail-chart">
                  <Suspense
                    fallback={
                      <div className="h-[300px] bg-polar-mist animate-pulse rounded-default" />
                    }
                  >
                    <ChartWHO anak={anak} pengukuran={pengukuran} />
                  </Suspense>
                </div>
              </>
            )}
          </div>
        </div>

        <PengukuranForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          anak={anak}
          existing={editing}
        />
      </div>
    </>
  );
}
