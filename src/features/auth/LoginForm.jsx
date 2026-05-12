import React from 'react';
import { Form, Input } from 'antd';
import { MailOutlined, KeyOutlined } from '@ant-design/icons';
import Button from '../../components/ui/Button';

const ROLE_LABELS = {
  ORANG_TUA: 'Orang Tua',
  KADER_POSYANDU: 'Kader Posyandu',
  TENAGA_KESEHATAN: 'Tenaga Kesehatan',
  DESA: 'Pemerintah Desa',
  ADMIN: 'Admin',
};

export default function LoginForm({ role, onSubmit, loading, errorText }) {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit?.({ email: values.email, password: values.password, role });
  };

  return (
    <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-sm)' }}>
        Masuk sebagai {ROLE_LABELS[role] ?? 'Pengguna'}
      </h2>
      {errorText && (
        <div
          role="alert"
          style={{
            background: 'var(--color-danger)',
            color: '#FFFFFF',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-button)',
            marginBottom: 'var(--space-md)',
            fontSize: 'var(--text-base)',
          }}
        >
          {errorText}
        </div>
      )}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email masih kosong' },
            { type: 'email', message: 'Format email tidak valid' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="email@contoh.com"
            style={{ height: 48, fontSize: 'var(--text-base)' }}
          />
        </Form.Item>
        <Form.Item
          label="Kata Sandi"
          name="password"
          rules={[{ required: true, message: 'Kata sandi masih kosong' }]}
        >
          <Input.Password
            prefix={<KeyOutlined />}
            placeholder="Kata sandi"
            style={{ height: 48, fontSize: 'var(--text-base)' }}
          />
        </Form.Item>
        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%' }}>
          MASUK
        </Button>
      </Form>
    </div>
  );
}
