import { message } from 'antd';

message.config({
  top: 80,
  duration: 3,
  maxCount: 3,
});

const style = { fontSize: '1rem', fontFamily: 'Inter, sans-serif' };

export function useToast() {
  const [api, contextHolder] = message.useMessage();
  return {
    contextHolder,
    success: (content) => api.open({ type: 'success', content, style }),
    error:   (content) => api.open({ type: 'error',   content, style }),
    info:    (content) => api.open({ type: 'info',    content, style }),
    warning: (content) => api.open({ type: 'warning', content, style }),
  };
}
