import React from 'react';
import { Modal as AntModal } from 'antd';

export default function Modal({ title, open, onCancel, footer, width, children }) {
  return (
    <AntModal
      title={
        <span className="text-h3 font-display text-neutral-900">{title}</span>
      }
      open={open}
      onCancel={onCancel}
      footer={footer}
      width={width ?? 560}
      destroyOnClose
      maskClosable={false}
      bodyStyle={{ padding: '1.25rem', fontFamily: 'Inter, sans-serif', fontSize: '1rem' }}
    >
      {children}
    </AntModal>
  );
}
