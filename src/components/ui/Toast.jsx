import { message } from 'antd';

const style = { fontSize: '1rem', fontFamily: 'Inter, sans-serif' };

export function useToast() {
  const [api, contextHolder] = message.useMessage();
  return {
    contextHolder,
    success: (content) => api.open({ type: 'success', content, duration: 3, style }),
    error: (content) => api.open({ type: 'error', content, duration: 3, style }),
    info: (content) => api.open({ type: 'info', content, duration: 3, style }),
    warning: (content) => api.open({ type: 'warning', content, duration: 3, style }),
  };
}
