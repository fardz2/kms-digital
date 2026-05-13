import React, { useState } from 'react';
import moment from 'moment';
import { Modal as AntModal } from 'antd';
import { AlertTriangle, Check } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import {
  usePendingOrangTua,
  usePendingAnak,
  useApproveOrangTua,
  useApproveAnak,
  useRejectOrangTua,
  useRejectAnak,
} from '../../queries/useApproveQueries';

function confirmAction({ title, content, okText, onOk }) {
  AntModal.confirm({
    title,
    icon: <AlertTriangle size={20} className="text-danger" />,
    content,
    okText: okText ?? 'Ya',
    cancelText: 'Batal',
    onOk,
  });
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center gap-[13px] py-[50px] text-graphite">
      <Check size={32} strokeWidth={1.75} className="text-success" />
      <span className="text-body-sm">Tidak ada {label} yang menunggu persetujuan</span>
    </div>
  );
}

function OrangTuaList({ data, isLoading, onApprove, onReject }) {
  if (isLoading)
    return <div className="text-body-sm text-graphite">Memuat daftar orang tua...</div>;
  if (!data || data.length === 0) return <EmptyState label="orang tua" />;

  return (
    <div className="flex flex-col gap-[13px]">
      {data.map((ot) => (
        <Card key={ot.id}>
          <div className="text-heading-sm font-semibold text-deep-slate">
            {ot.nama ?? '-'}
          </div>
          {ot.email && (
            <div className="text-caption text-graphite mt-1">{ot.email}</div>
          )}
          {ot.alamat && (
            <div className="text-caption text-graphite">{ot.alamat}</div>
          )}
          {ot.created_at && (
            <div className="text-caption text-graphite mt-1">
              Daftar: {moment(ot.created_at).format('DD MMM YYYY')}
            </div>
          )}
          <div className="flex gap-[8px] justify-end mt-[17px]">
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                confirmAction({
                  title: 'Tolak pendaftaran?',
                  content: `${ot.nama} akan dihapus.`,
                  okText: 'Ya, Tolak',
                  onOk: () => onReject(ot.id),
                })
              }
            >
              Tolak
            </Button>
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<Check size={16} strokeWidth={1.75} />}
              onClick={() => onApprove(ot.id)}
            >
              Setujui
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AnakList({ data, isLoading, onApprove, onReject }) {
  if (isLoading)
    return <div className="text-body-sm text-graphite">Memuat daftar anak...</div>;
  if (!data || data.length === 0) return <EmptyState label="anak" />;

  return (
    <div className="flex flex-col gap-[13px]">
      {data.map((anak) => {
        const umurBulan = anak.tanggal_lahir
          ? moment().diff(moment(anak.tanggal_lahir), 'month')
          : null;
        return (
          <Card key={anak.id}>
            <div className="text-heading-sm font-semibold text-deep-slate">
              {anak.nama ?? '-'}
            </div>
            <div className="text-caption text-graphite mt-1">
              {umurBulan != null ? `${umurBulan} bulan · ` : ''}
              {anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
            </div>
            {anak.nama_ortu && (
              <div className="text-caption text-graphite">Ortu: {anak.nama_ortu}</div>
            )}
            {anak.created_at && (
              <div className="text-caption text-graphite mt-1">
                Daftar: {moment(anak.created_at).format('DD MMM YYYY')}
              </div>
            )}
            <div className="flex gap-[8px] justify-end mt-[17px]">
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  confirmAction({
                    title: 'Tolak pendaftaran?',
                    content: `${anak.nama} akan dihapus.`,
                    okText: 'Ya, Tolak',
                    onOk: () => onReject(anak.id),
                  })
                }
              >
                Tolak
              </Button>
              <Button
                variant="primary"
                size="sm"
                leadingIcon={<Check size={16} strokeWidth={1.75} />}
                onClick={() => onApprove(anak.id)}
              >
                Setujui
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function ApproveModal({ open, onClose }) {
  const [tab, setTab] = useState('ot');
  const toast = useToast();

  const { data: otList, isLoading: otLoading } = usePendingOrangTua(open);
  const { data: anakList, isLoading: anakLoading } = usePendingAnak(open);

  const approveOT = useApproveOrangTua();
  const rejectOT = useRejectOrangTua();
  const approveAnak = useApproveAnak();
  const rejectAnak = useRejectAnak();

  const otCount = otList?.length ?? 0;
  const anakCount = anakList?.length ?? 0;

  const withToast = (label) => ({
    onSuccess: () => toast.success(`${label} berhasil`),
    onError: (err) => toast.error(err?.message ?? `${label} gagal`),
  });

  return (
    <>
      {toast.contextHolder}
      <Modal title="Perlu Persetujuan" open={open} onCancel={onClose} footer={null} width={640}>
        <div className="flex gap-[8px] mb-[17px]">
          <Button
            variant={tab === 'ot' ? 'dark' : 'default'}
            size="sm"
            onClick={() => setTab('ot')}
          >
            Orang Tua · {otCount}
          </Button>
          <Button
            variant={tab === 'anak' ? 'dark' : 'default'}
            size="sm"
            onClick={() => setTab('anak')}
          >
            Anak · {anakCount}
          </Button>
        </div>

        {tab === 'ot' ? (
          <OrangTuaList
            data={otList}
            isLoading={otLoading}
            onApprove={(id) => approveOT.mutate(id, withToast('Setujui orang tua'))}
            onReject={(id) => rejectOT.mutate(id, withToast('Tolak orang tua'))}
          />
        ) : (
          <AnakList
            data={anakList}
            isLoading={anakLoading}
            onApprove={(id) => approveAnak.mutate(id, withToast('Setujui anak'))}
            onReject={(id) => rejectAnak.mutate(id, withToast('Tolak anak'))}
          />
        )}
      </Modal>
    </>
  );
}
