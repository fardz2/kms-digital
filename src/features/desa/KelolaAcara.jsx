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
          tanggal: moment(values.tanggal).format('YYYY-MM-DD'),
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
    (b.tanggal ?? '').localeCompare(a.tanggal ?? '')
  );

  return (
    <AppShell menu={MENU} activeKey="acara">
      {toast.contextHolder}
      <PageHeader
        title="Kelola Acara Posyandu"
        subtitle="Buat pengingat acara untuk kader dan orang tua"
      />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <Card title="Tambah Acara Baru" style={{ marginBottom: 'var(--space-lg)' }}>
          <Form form={form} layout="vertical" onFinish={onSubmit}>
            <Form.Item
              label="Judul Acara"
              name="judul"
              rules={[{ required: true, message: 'Judul masih kosong' }]}
            >
              <Input placeholder="Contoh: Posyandu Bulan Ini" style={{ height: 44 }} />
            </Form.Item>
            <Form.Item label="Deskripsi" name="deskripsi">
              <Input.TextArea rows={2} placeholder="Detail tambahan (opsional)" />
            </Form.Item>
            <Form.Item
              label="Tanggal"
              name="tanggal"
              rules={[{ required: true, message: 'Tanggal masih kosong' }]}
            >
              <DatePicker
                format="DD MMMM YYYY"
                allowClear={false}
                style={{ width: '100%', height: 44 }}
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
          {isLoading && <div>Memuat...</div>}
          {!isLoading && sorted.length === 0 && (
            <div
              style={{
                color: 'var(--color-muted)',
                textAlign: 'center',
                padding: 'var(--space-md)',
              }}
            >
              Belum ada acara
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {sorted.map((acara) => (
              <div
                key={acara.id}
                style={{
                  padding: 'var(--space-md)',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-button)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-bold)',
                    }}
                  >
                    {acara.judul}
                  </div>
                  <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
                    {acara.tanggal ? moment(acara.tanggal).format('DD MMMM YYYY') : '-'}
                  </div>
                  {acara.deskripsi && (
                    <div style={{ fontSize: 'var(--text-base)', marginTop: 'var(--space-xs)' }}>
                      {acara.deskripsi}
                    </div>
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
