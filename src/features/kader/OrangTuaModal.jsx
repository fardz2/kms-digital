import React, { useEffect, useState } from 'react';
import { Form, Input, Modal as AntModal, Select, message } from 'antd';
import { AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import {
  useOrangTuaList,
  useCreateOrangTua,
  useUpdateOrangTua,
  useDeleteOrangTua,
} from '../../queries/useOrangTuaQueries';
import { useSession } from '../auth/useSession';

const normalizeStatus = (status) => {
  if (typeof status === 'string') return status === 'true' || status === '1';
  if (typeof status === 'number') return status === 1;
  return !!status;
};

function FormOrangTua({ isOpen, onCancel, mode, initialValues, idPosyandu, idDesa }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const createMutation = useCreateOrangTua();
  const updateMutation = useUpdateOrangTua();

  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        nama: initialValues.nama,
        email: initialValues.email,
        alamat: initialValues.alamat,
        status: normalizeStatus(initialValues.status),
      });
    } else {
      form.resetFields();
    }
  }, [isOpen, mode, initialValues, form]);

  const close = () => {
    form.resetFields();
    onCancel();
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        if (mode === 'add') {
          createMutation.mutate(
            {
              email: values.email,
              password: values.password,
              nama: values.nama,
              alamat: values.alamat,
              status: values.status ?? false,
              id_posyandu: idPosyandu,
              id_desa: idDesa,
            },
            {
              onSuccess: () => {
                messageApi.success('Berhasil menambahkan orang tua');
                close();
              },
              onError: (err) =>
                messageApi.error(err?.message ?? 'Gagal menambahkan orang tua'),
            }
          );
        } else {
          updateMutation.mutate(
            {
              id: initialValues.id,
              payload: {
                email: values.email,
                password: values.password || undefined,
                nama: values.nama,
                alamat: values.alamat,
                status: values.status,
              },
            },
            {
              onSuccess: () => {
                messageApi.success('Berhasil memperbarui orang tua');
                close();
              },
              onError: (err) =>
                messageApi.error(err?.message ?? 'Gagal memperbarui orang tua'),
            }
          );
        }
      })
      .catch(() => {});
  };

  const isEdit = mode === 'edit';

  return (
    <>
      {contextHolder}
      <Modal
        title={isEdit ? 'Ubah Orang Tua' : 'Tambah Orang Tua'}
        open={isOpen}
        onCancel={close}
        footer={
          <div className="flex gap-[13px] justify-end">
            <Button variant="default" size="md" onClick={close} disabled={isPending}>
              Batal
            </Button>
            <Button variant="primary" size="md" onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" name="form_orang_tua">
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Nama</span>}
            name="nama"
            rules={[{ required: true, message: 'Nama masih kosong' }]}
          >
            <Input placeholder="Nama lengkap" className="h-[52px] text-base" />
          </Form.Item>

          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Email masih kosong' },
              { type: 'email', message: 'Format email tidak valid' },
            ]}
          >
            <Input placeholder="email@contoh.com" className="h-[52px] text-base" />
          </Form.Item>

          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Kata Sandi</span>}
            name="password"
            rules={
              isEdit
                ? [{ pattern: '^.{8,}$', message: 'Minimal 8 karakter' }]
                : [
                    { required: true, message: 'Kata sandi masih kosong' },
                    { pattern: '^.{8,}$', message: 'Minimal 8 karakter' },
                  ]
            }
          >
            <Input.Password
              placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'}
              className="h-[52px] text-base"
            />
          </Form.Item>

          {!isEdit && (
            <Form.Item
              label={
                <span className="text-body-sm font-medium text-deep-slate">
                  Konfirmasi Kata Sandi
                </span>
              }
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Konfirmasi kata sandi' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('Kata sandi tidak sesuai'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Ulangi kata sandi" className="h-[52px] text-base" />
            </Form.Item>
          )}

          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Alamat</span>}
            name="alamat"
            rules={[{ required: true, message: 'Alamat masih kosong' }]}
          >
            <Input.TextArea
              rows={3}
              className="text-base"
              placeholder="Alamat tempat tinggal"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Status</span>}
            name="status"
            rules={[{ required: true, message: 'Status masih kosong' }]}
          >
            <Select placeholder="Pilih status" className="h-[52px]">
              <Select.Option value={true}>Disetujui</Select.Option>
              <Select.Option value={false}>Belum Disetujui</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default function OrangTuaModal({ open, onClose }) {
  const { user } = useSession();
  const [messageApi, contextHolder] = message.useMessage();

  const [formMode, setFormMode] = useState('add');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: rawList, isLoading } = useOrangTuaList(open);
  const deleteMutation = useDeleteOrangTua();

  const orangTuaList = (rawList ?? []).map((item) => ({
    ...item,
    status: normalizeStatus(item.status),
  }));

  const openTambah = () => {
    setFormMode('add');
    setSelectedUser(null);
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setFormMode('edit');
    setSelectedUser(record);
    setFormOpen(true);
  };

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
              approved
                ? 'bg-success/10 text-success'
                : 'bg-polar-mist text-graphite'
            }`}
          >
            {approved ? 'Disetujui' : 'Belum Disetujui'}
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
    <>
      {contextHolder}
      <Modal
        title="Daftar Orang Tua"
        open={open}
        onCancel={onClose}
        footer={null}
        width={900}
      >
        <div className="flex items-start justify-between gap-[17px] flex-wrap mb-[17px]">
          <div className="min-w-0 flex-1">
            <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
              Posyandu
            </p>
            <p className="text-body-sm text-graphite">
              Kelola akun orang tua yang terdaftar di posyandu Anda.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            leadingIcon={<Plus size={20} strokeWidth={2} />}
            onClick={openTambah}
          >
            Tambah Orang Tua
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={orangTuaList}
          loading={isLoading || deleteMutation.isPending}
          rowKey="id"
          searchPlaceholder="Cari orang tua..."
          emptyText="Belum ada orang tua terdaftar"
          pageSize={5}
        />
      </Modal>

      <FormOrangTua
        isOpen={formOpen}
        onCancel={() => {
          setFormOpen(false);
          setSelectedUser(null);
        }}
        mode={formMode}
        initialValues={selectedUser}
        idPosyandu={user?.id_posyandu}
        idDesa={user?.id_desa}
      />
    </>
  );
}
