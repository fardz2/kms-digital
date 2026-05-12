import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Modal as AntModal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
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
  const { role } = useSession();

  const { data: anak, isLoading: anakLoading } = useAnakDetail(id);
  const { data: pengukuran, isLoading: pengukuranLoading } = usePengukuranAnak(id);
  const deleteMutation = useDeletePengukuran(id);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const canEdit = role === 'KADER_POSYANDU' || role === 'ORANG_TUA';

  const handleEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleDelete = (item) => {
    AntModal.confirm({
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
      <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
        <PageHeader
          title={anakLoading ? 'Memuat...' : (anak?.nama ?? '-')}
          subtitle={
            umur != null
              ? `${umur} bulan · ${anak?.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}`
              : undefined
          }
        />

        <div style={{ padding: 'var(--space-lg)', maxWidth: 960, margin: '0 auto' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            style={{ marginBottom: 'var(--space-md)' }}
          >
            ← Kembali
          </Button>

          {canEdit && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleAdd}
              style={{ width: '100%', marginBottom: 'var(--space-lg)' }}
            >
              + Ukur Pengukuran Baru
            </Button>
          )}

          <h2
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--space-md)',
            }}
          >
            Riwayat Pengukuran
          </h2>

          {pengukuranLoading && <div style={{ padding: 'var(--space-lg)' }}>Memuat...</div>}

          {!pengukuranLoading && (!pengukuran || pengukuran.length === 0) && (
            <div
              style={{
                padding: 'var(--space-xl)',
                textAlign: 'center',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                color: 'var(--color-muted)',
              }}
            >
              Belum ada data pengukuran
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
              marginBottom: 'var(--space-xl)',
            }}
          >
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
              <h2
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--space-md)',
                }}
              >
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
