import React from 'react';
import moment from 'moment';
import { Form, Input, DatePicker, Modal as AntModal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import {
  useReminderList,
  useCreateReminder,
  useDeleteReminder,
} from '../../queries/useReminderQueries';

const MENU = [
  { key: 'beranda', label: 'Laporan', path: '/desa/beranda' },
  { key: 'acara', label: 'Kelola Acara', path: '/desa/acara' },
];

export default function KelolaAcara() {
  const toast = useToast();
  const [form] = Form.useForm();
  const { data: reminders, isLoading } = useReminderList();
  const createMutation = useCreateReminder();
  const deleteMutation = useDeleteReminder();

  const onSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const payload = {
          judul: values.judul,
          deskripsi: values.deskripsi ?? '',
          tanggal_reminder: moment(values.tanggal).format('YYYY-MM-DD'),
        };
        createMutation.mutate(payload, {
          onSuccess: () => {
            toast.success('Acara ditambahkan');
            form.resetFields();
          },
          onError: (err) => toast.error(err?.message ?? 'Gagal menambahkan'),
        });
      })
      .catch(() => {});
  };

  const handleDelete = (id, judul) => {
    AntModal.confirm({
      title: 'Hapus acara?',
      icon: <ExclamationCircleOutlined />,
      content: `Acara "${judul}" akan dihapus.`,
      okText: 'Ya, Hapus',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteMutation.mutate(id, {
          onSuccess: () => toast.success('Acara dihapus'),
          onError: (err) => toast.error(err?.message ?? 'Gagal menghapus'),
        });
      },
    });
  };

  const sorted = [...(reminders ?? [])].sort((a, b) =>
    (b.tanggal_reminder ?? '').localeCompare(a.tanggal_reminder ?? '')
  );

  return (
    <AppShell menu={MENU} activeKey="acara">
      {toast.contextHolder}
      <PageHeader
        title="Kelola Acara Posyandu"
        subtitle="Buat pengingat acara untuk kader dan orang tua"
      />

      <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
        <Card title="Tambah Acara Baru">
          <Form form={form} layout="vertical" onFinish={onSubmit}>
            <Form.Item
              label={<span className="text-body-sm font-medium text-deep-slate">Judul Acara</span>}
              name="judul"
              rules={[{ required: true, message: 'Judul masih kosong' }]}
            >
              <Input placeholder="Contoh: Posyandu Bulan Ini" className="h-11" />
            </Form.Item>
            <Form.Item
              label={<span className="text-body-sm font-medium text-deep-slate">Deskripsi</span>}
              name="deskripsi"
            >
              <Input.TextArea rows={2} placeholder="Detail tambahan (opsional)" />
            </Form.Item>
            <Form.Item
              label={<span className="text-body-sm font-medium text-deep-slate">Tanggal</span>}
              name="tanggal"
              rules={[{ required: true, message: 'Tanggal masih kosong' }]}
            >
              <DatePicker
                format="DD MMMM YYYY"
                allowClear={false}
                className="w-full h-11"
              />
            </Form.Item>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={createMutation.isPending}
            >
              Simpan Acara
            </Button>
          </Form>
        </Card>

        <Card title={`Daftar Acara (${sorted.length})`}>
          {isLoading && <div className="text-neutral-500">Memuat...</div>}
          {!isLoading && sorted.length === 0 && (
            <div className="text-center py-4 text-neutral-500">
              Belum ada acara
            </div>
          )}
          <div className="flex flex-col gap-2">
            {sorted.map((acara) => (
              <div
                key={acara.id}
                className="p-[17px] bg-polar-mist rounded-default flex justify-between items-center gap-[13px]"
              >
                <div>
                  <div className="text-body-sm font-semibold text-deep-slate">
                    {acara.judul}
                  </div>
                  <div className="text-caption text-neutral-500">
                    {acara.tanggal_reminder
                      ? moment(acara.tanggal_reminder).format('DD MMMM YYYY')
                      : '-'}
                  </div>
                  {acara.deskripsi && (
                    <div className="text-base mt-1">{acara.deskripsi}</div>
                  )}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(acara.id, acara.judul)}
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
