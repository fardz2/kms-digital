import React, { useState } from 'react';
import moment from 'moment';
import { Modal as AntModal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
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
    icon: <ExclamationCircleOutlined />,
    content,
    okText: okText ?? 'Ya',
    cancelText: 'Batal',
    onOk,
  });
}

function OrangTuaList({ data, isLoading, onApprove, onReject }) {
  if (isLoading) return <div className="text-neutral-500">Memuat daftar orang tua...</div>;
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Tidak ada orang tua yang menunggu persetujuan 🎉
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {data.map((ot) => (
        <Card key={ot.id} className="p-4">
          <div className="text-h3 font-display text-neutral-900">
            {ot.nama ?? '-'}
          </div>
          {ot.email && (
            <div className="text-caption text-neutral-500 mt-0.5">{ot.email}</div>
          )}
          {ot.alamat && (
            <div className="text-caption text-neutral-500">{ot.alamat}</div>
          )}
          {ot.created_at && (
            <div className="text-caption text-neutral-500 mt-1">
              Daftar: {moment(ot.created_at).format('DD MMM YYYY')}
            </div>
          )}
          <div className="flex gap-2 justify-end mt-3">
            <Button
              variant="danger"
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
            <Button variant="primary" size="sm" onClick={() => onApprove(ot.id)}>
              ✔ Setujui
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AnakList({ data, isLoading, onApprove, onReject }) {
  if (isLoading) return <div className="text-neutral-500">Memuat daftar anak...</div>;
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Tidak ada anak yang menunggu persetujuan 🎉
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {data.map((anak) => {
        const umurBulan = anak.tanggal_lahir
          ? moment().diff(moment(anak.tanggal_lahir), 'month')
          : null;
        return (
          <Card key={anak.id} className="p-4">
            <div className="text-h3 font-display text-neutral-900">
              {anak.nama ?? '-'}
            </div>
            <div className="text-caption text-neutral-500 mt-0.5">
              {umurBulan != null ? `${umurBulan} bulan · ` : ''}
              {anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
            </div>
            {anak.nama_ortu && (
              <div className="text-caption text-neutral-500">Ortu: {anak.nama_ortu}</div>
            )}
            {anak.created_at && (
              <div className="text-caption text-neutral-500 mt-1">
                Daftar: {moment(anak.created_at).format('DD MMM YYYY')}
              </div>
            )}
            <div className="flex gap-2 justify-end mt-3">
              <Button
                variant="danger"
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
              <Button variant="primary" size="sm" onClick={() => onApprove(anak.id)}>
                ✔ Setujui
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
        <div className="flex gap-2 mb-4">
          <Button
            variant={tab === 'ot' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTab('ot')}
          >
            Orang Tua ({otCount})
          </Button>
          <Button
            variant={tab === 'anak' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTab('anak')}
          >
            Anak ({anakCount})
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
