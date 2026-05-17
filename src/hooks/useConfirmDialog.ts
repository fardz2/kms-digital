import { App } from 'antd';
import type { ReactNode } from 'react';

interface ConfirmOptions {
  title: ReactNode;
  content?: ReactNode;
  icon?: ReactNode;
  okText?: string;
  cancelText?: string;
  okButtonProps?: { danger?: boolean };
  onOk: () => void | Promise<void>;
  onCancel?: () => void;
}

export function useConfirmDialog() {
  const { modal } = App.useApp();

  return (options: ConfirmOptions) => {
    modal.confirm({
      title: options.title,
      content: options.content,
      icon: options.icon,
      okText: options.okText ?? 'Ya',
      cancelText: options.cancelText ?? 'Batal',
      okButtonProps: options.okButtonProps,
      onOk: options.onOk,
      onCancel: options.onCancel,
    });
  };
}
