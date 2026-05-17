// @ts-nocheck
import React, { useEffect } from 'react';
import { Form, Input, Select, message } from 'antd';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import {
  useCreateOrangTua,
  useUpdateOrangTua,
} from '../../queries/useOrangTuaQueries';

const normalizeStatus = (status) => {
  if (typeof status === 'string') return status === 'true' || status === '1';
  if (typeof status === 'number') return status === 1;
  return !!status;
};

export default function FormOrangTua({
  isOpen,
  onCancel,
  mode,
  initialValues,
  idPosyandu,
  idDesa,
}) {
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
