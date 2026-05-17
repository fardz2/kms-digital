import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { ExclamationCircleOutlined } from '@ant-design/icons';
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
import ChartWHO from './ChartWHO';

export default function DetailAnak() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirmDialog();
  const { role } = useSession();

  const { data: anak, isLoading: anakLoading } = useAnakDetail(id);
  const { data: pengukuran, isLoading: pengukuranLoading } = usePengukuranAnak(id);
  const deleteMutation = useDeletePengukuran(id);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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
      content: `Data tanggal ${moment(item.date).format('DD MMMM YYYY')} akan dihapus.`,
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
    ? moment().diff(moment(anak.tanggal_lahir), 'month')
    : null;

  return (
    <>
      {toast.contextHolder}
      <div className="min-h-screen bg-neutral-50">
        <PageHeader
          title={anakLoading ? 'Memuat...' : (anak?.nama ?? '-')}
          subtitle={
            umur != null
              ? `${umur} bulan � ${anak?.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}`
              : undefined
          }
        />

        <div className="px-4 py-6 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ? Kembali
          </Button>

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

          <h2 className="text-heading font-semibold text-deep-slate mb-[17px]">
            Riwayat Pengukuran
          </h2>

          {pengukuranLoading && (
            <div className="text-neutral-500 py-6">Memuat...</div>
          )}

          {!pengukuranLoading && (!pengukuran || pengukuran.length === 0) && (
            <div className="p-[33px] text-center bg-white border border-light-ash rounded-default text-body-sm text-graphite">
              Belum ada data pengukuran
            </div>
          )}

          <div className="flex flex-col gap-3 mb-10">
            {[...(pengukuran ?? [])]
              .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
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
              <ChartWHO anak={anak} pengukuran={pengukuran} />
            </>
          )}
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
