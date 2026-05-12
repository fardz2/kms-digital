import { message } from 'antd';

message.config({
  top: 80,
  duration: 3,
  maxCount: 3,
});

export function useToast() {
  const [api, contextHolder] = message.useMessage();

  return {
    contextHolder,
    success: (content) => api.open({ type: 'success', content, style: { fontSize: 'var(--text-lg)' } }),
    error: (content) => api.open({ type: 'error', content, style: { fontSize: 'var(--text-lg)' } }),
    info: (content) => api.open({ type: 'info', content, style: { fontSize: 'var(--text-lg)' } }),
    warning: (content) => api.open({ type: 'warning', content, style: { fontSize: 'var(--text-lg)' } }),
  };
}
