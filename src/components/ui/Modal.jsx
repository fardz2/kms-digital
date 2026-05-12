import React from 'react';
import { Modal as AntModal } from 'antd';

export default function Modal({ title, open, onCancel, footer, width, children }) {
  return (
    <AntModal
      title={<span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>{title}</span>}
      open={open}
      onCancel={onCancel}
      footer={footer}
      width={width ?? 560}
      destroyOnClose
      maskClosable={false}
      bodyStyle={{ padding: 'var(--space-lg)', fontSize: 'var(--text-base)' }}
    >
      {children}
    </AntModal>
  );
}
