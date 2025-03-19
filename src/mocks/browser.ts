import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 为浏览器环境创建 Service Worker
export const worker = setupWorker(...handlers); 