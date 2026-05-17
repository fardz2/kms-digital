import React from 'react';
import { Modal as AntModal } from 'antd';

interface ModalProps {
  title?: React.ReactNode;
  open: boolean;
  onCancel: () => void;
  footer?: React.ReactNode;
  width?: number;
  children: React.ReactNode;
}

export default function Modal({
  title,
  open,
  onCancel,
  footer,
  width,
  children,
}: ModalProps) {
  return (
    <AntModal
      title={
        <span className="text-heading font-semibold text-deep-slate">{title}</span>
      }
      open={open}
      onCancel={onCancel}
      footer={footer}
      width={width ?? 560}
      destroyOnClose
      maskClosable={false}
    >
      {children}
    </AntModal>
  );
}
