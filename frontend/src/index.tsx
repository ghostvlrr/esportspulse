import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Service Worker'ı kaydet
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      // Bildirim izinlerini kontrol et ve iste
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }

      // Push bildirimleri için abone ol
      registration.pushManager.getSubscription().then(subscription => {
        if (!subscription) {
          registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Backend'den alınacak
          }).then(subscription => {
            // Backend'e subscription bilgisini gönder
            fetch('/api/notifications/subscribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(subscription)
            });
          }).catch(error => {
            console.error('Push notification subscription failed:', error);
          });
        }
      });
    }).catch(error => {
      console.error('ServiceWorker registration failed:', error);
    });
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
