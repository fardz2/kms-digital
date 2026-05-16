import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal as AntModal, message } from 'antd';
import { ArrowLeft, AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import {
  useOrangTuaList,
  useDeleteOrangTua,
} from '../../queries/useOrangTuaQueries';
import {
  usePendingOrangTua,
  usePendingAnak,
} from '../../queries/useApproveQueries';
import { useSession } from '../auth/useSession';
import PendingApprovalSection from './PendingApprovalSection';
import FormOrangTua from './FormOrangTua';

const TABS = [
  { key: 'pending', label: 'Menunggu Persetujuan' },
  { key: 'aktif', label: 'Daftar Aktif' },
];

const normalizeStatus = (status) => {
  if (typeof status === 'string') return status === 'true' || status === '1';
  if (typeof status === 'number') return status === 1;
  return !!status;
};

export default function AkunOrangTuaPage() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [tab, setTab] = useState('pending');
  const [messageApi, contextHolder] = message.useMessage();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selected, setSelected] = useState(null);

  const { data: pendingOT } = usePendingOrangTua(true);
  const { data: pendingAnak } = usePendingAnak(true);
  const pendingCount = (pendingOT?.length ?? 0) + (pendingAnak?.length ?? 0);

  const { data: rawList, isLoading } = useOrangTuaList(true);
  const deleteMutation = useDeleteOrangTua();

  const aktifList = useMemo(
    () =>
      (rawList ?? []).map((item) => ({
        ...item,
        status: normalizeStatus(item.status),
      })),
    [rawList]
  );

  const showDeleteConfirm = (record) => {
    AntModal.confirm({
      title: 'Hapus orang tua?',
      icon: <AlertTriangle size={20} className="text-danger" />,
      content: `${record.nama} akan dihapus dari daftar.`,
      okText: 'Ya, Hapus',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () =>
        deleteMutation.mutate(record.id, {
          onSuccess: () => messageApi.success('Orang tua berhasil dihapus'),
          onError: (err) =>
            messageApi.error(err?.message ?? 'Gagal menghapus orang tua'),
        }),
    });
  };

  const openTambah = () => {
    setFormMode('add');
    setSelected(null);
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setFormMode('edit');
    setSelected(record);
    setFormOpen(true);
  };

  const columns = [
    { accessorKey: 'nama', header: 'Nama', enableSorting: true },
    { accessorKey: 'alamat', header: 'Alamat', enableSorting: true },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ getValue }) => {
        const approved = !!getValue();
        return (
          <span
            className={`inline-flex items-center px-[13px] py-1 rounded-full text-caption font-medium ${
              approved ? 'bg-success/10 text-success' : 'bg-polar-mist text-graphite'
            }`}
          >
            {approved ? 'Disetujui' : 'Menunggu'}
          </span>
        );
      },
    },
    {
      id: 'action',
      header: 'Aksi',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex gap-[8px]">
          <Button
            variant="default"
            size="sm"
            leadingIcon={<Pencil size={16} strokeWidth={1.75} />}
            onClick={() => openEdit(row.original)}
          >
            Ubah
          </Button>
          <Button
            variant="destructive"
            size="sm"
            leadingIcon={<Trash2 size={16} strokeWidth={1.75} />}
            onClick={() => showDeleteConfirm(row.original)}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <PageHeader
        eyebrow="Kader Posyandu"
        title="Akun Orang Tua"
        subtitle="Kelola pendaftaran dan akun orang tua di posyandu Anda."
        action={
          <Button
            variant="ghost"
            size="md"
            leadingIcon={<ArrowLeft size={18} strokeWidth={2} />}
            onClick={() => navigate('/kader/balita')}
          >
            Kembali
          </Button>
        }
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[25px]">
        <div className="flex gap-[8px] border-b border-light-ash">
          {TABS.map((t) => {
            const active = t.key === tab;
            const count =
              t.key === 'pending' ? pendingCount : aktifList.length;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-[17px] py-[13px] text-body-sm font-semibold transition-colors border-b-2 -mb-px ${
                  active
                    ? 'text-primary-600 border-primary-500'
                    : 'text-graphite border-transparent hover:text-deep-slate'
                }`}
              >
                {t.label}
                <span
                  className={`ml-[8px] px-[8px] py-[1px] rounded-full text-caption tabular-nums ${
                    active
                      ? 'bg-primary-50 text-primary-600'
                      : 'bg-polar-mist text-graphite'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {tab === 'pending' && <PendingApprovalSection enabled={true} />}

        {tab === 'aktif' && (
          <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px] space-y-[17px]">
            <div className="flex items-center justify-between gap-[17px] flex-wrap">
              <h2 className="text-heading font-semibold text-deep-slate">
                Daftar Orang Tua Aktif
              </h2>
              <Button
                variant="primary"
                size="md"
                leadingIcon={<Plus size={18} strokeWidth={2} />}
                onClick={openTambah}
              >
                Tambah Orang Tua
              </Button>
            </div>
            <DataTable
              columns={columns}
              data={aktifList}
              loading={isLoading || deleteMutation.isPending}
              rowKey="id"
              searchPlaceholder="Cari orang tua..."
              emptyText="Belum ada orang tua aktif"
            />
          </div>
        )}
      </div>

      <FormOrangTua
        isOpen={formOpen}
        onCancel={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        mode={formMode}
        initialValues={selected}
        idPosyandu={user?.id_posyandu}
        idDesa={user?.id_desa}
      />
    </div>
  );
}
