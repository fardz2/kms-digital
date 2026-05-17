import React from 'react';
import moment from 'moment';
import { AlertTriangle, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import {
  usePendingOrangTua,
  usePendingAnak,
  useApproveOrangTua,
  useApproveAnak,
  useRejectOrangTua,
  useRejectAnak,
} from '../../queries/useApproveQueries';

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center gap-[13px] py-[50px] text-graphite">
      <Check size={32} strokeWidth={1.75} className="text-success" />
      <span className="text-body-sm">Tidak ada {label} yang menunggu persetujuan</span>
    </div>
  );
}

function OrangTuaList({ data, isLoading, onApprove, onReject, askConfirm }) {
  if (isLoading) return <div className="text-body-sm text-graphite">Memuat daftar orang tua...</div>;
  if (!data || data.length === 0) return <EmptyState label="orang tua" />;
  return (
    <div className="flex flex-col gap-[13px]">
      {data.map((ot) => (
        <Card key={ot.id}>
          <div className="text-heading-sm font-semibold text-deep-slate">{ot.nama ?? '-'}</div>
          {ot.email && <div className="text-caption text-graphite mt-1">{ot.email}</div>}
          {ot.alamat && <div className="text-caption text-graphite">{ot.alamat}</div>}
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
                askConfirm({
                  title: 'Tolak pendaftaran?',
                  icon: <AlertTriangle size={20} className="text-danger" />,
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

function AnakList({ data, isLoading, onApprove, onReject, askConfirm }) {
  if (isLoading) return <div className="text-body-sm text-graphite">Memuat daftar anak...</div>;
  if (!data || data.length === 0) return <EmptyState label="anak" />;
  return (
    <div className="flex flex-col gap-[13px]">
      {data.map((anak) => {
        const umurBulan = anak.tanggal_lahir
          ? moment().diff(moment(anak.tanggal_lahir), 'month')
          : null;
        return (
          <Card key={anak.id}>
            <div className="text-heading-sm font-semibold text-deep-slate">{anak.nama ?? '-'}</div>
            <div className="text-caption text-graphite mt-1">
              {umurBulan != null ? `${umurBulan} bulan � ` : ''}
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
                  askConfirm({
                    title: 'Tolak pendaftaran?',
                    icon: <AlertTriangle size={20} className="text-danger" />,
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

export default function PendingApprovalSection({ enabled = true }) {
  const toast = useToast();
  const askConfirm = useConfirmDialog();
  const { data: otList, isLoading: otLoading } = usePendingOrangTua(enabled);
  const { data: anakList, isLoading: anakLoading } = usePendingAnak(enabled);

  const approveOT = useApproveOrangTua();
  const rejectOT = useRejectOrangTua();
  const approveAnak = useApproveAnak();
  const rejectAnak = useRejectAnak();

  const withToast = (label) => ({
    onSuccess: () => toast.success(`${label} berhasil`),
    onError: (err) => toast.error(err?.message ?? `${label} gagal`),
  });

  const empty =
    !otLoading &&
    !anakLoading &&
    (!otList || otList.length === 0) &&
    (!anakList || anakList.length === 0);

  return (
    <div className="space-y-[33px]">
      {toast.contextHolder}
      {empty ? (
        <div className="text-center py-[50px] text-body-sm text-graphite">
          Tidak ada antrean persetujuan.
        </div>
      ) : (
        <>
          <section className="space-y-[17px]">
            <h3 className="text-overline text-graphite">
              Pendaftaran Orang Tua Baru ({otList?.length ?? 0})
            </h3>
            <OrangTuaList
              data={otList}
              isLoading={otLoading}
              onApprove={(id) => approveOT.mutate(id, withToast('Setujui orang tua'))}
              onReject={(id) => rejectOT.mutate(id, withToast('Tolak orang tua'))}
              askConfirm={askConfirm}
            />
          </section>
          <section className="space-y-[17px]">
            <h3 className="text-overline text-graphite">
              Pengukuran Anak Baru ({anakList?.length ?? 0})
            </h3>
            <AnakList
              data={anakList}
              isLoading={anakLoading}
              onApprove={(id) => approveAnak.mutate(id, withToast('Setujui anak'))}
              onReject={(id) => rejectAnak.mutate(id, withToast('Tolak anak'))}
              askConfirm={askConfirm}
            />
          </section>
        </>
      )}
    </div>
  );
}
