import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

// 明确标记开发环境
const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

async function prepare() {
  if (isDev) {
    console.log('Starting MSW in development mode...');
    try {
      const { worker } = await import('./mocks/browser');
      // 显式设定 Service Worker 位置
      return worker.start({
        onUnhandledRequest: 'bypass', // 对于未处理的请求直接通过
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
    } catch (error) {
      console.error('Error starting MSW:', error);
    }
  }
  return Promise.resolve();
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
  );
}); 