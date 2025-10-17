import { useEffect, useState } from 'react';

export default function PushManager() {
  const [status, setStatus] = useState<string>(
    typeof Notification !== 'undefined'
      ? Notification.permission
      : 'unsupported'
  );
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof Notification !== 'undefined') setStatus(Notification.permission);
  }, []);

  async function subscribe() {
    try {
      if (typeof Notification === 'undefined')
        throw new Error('Notifications API no disponible');
      const permission = await Notification.requestPermission();
      setStatus(permission);
      if (permission !== 'granted') return;
      // Guarda una marca local para indicar que el usuario aceptó (modo client-only)
      try {
        localStorage.setItem('notificationsSubscribed', '1');
      } catch (e) {
        // If localStorage is unavailable (e.g., private mode), ignore but log for debugging.
         
        console.warn('localStorage unavailable for notification flag', e);
      }
      alert('Notificaciones habilitadas (modo cliente)');
    } catch (err) {
        console.error('subscribe error', err);
        const unknownErr: unknown = err;
        const msg =
          typeof unknownErr === 'object' && unknownErr !== null && 'message' in unknownErr
            ? String((unknownErr as { message?: unknown }).message)
            : String(unknownErr);
      setLastError(msg);
      alert('Fallo al habilitar notificaciones: ' + msg);
    }
  }

  async function sendTest() {
    try {
      const title = 'Notificación de prueba';
      const options: NotificationOptions = {
        body: 'Hola desde la app (cliente-only)',
        icon: '/vite.svg',
        badge: '/vite.svg',
        data: { local: true },
      };

      // Preferir mostrar la notificación desde el Service Worker para consistencia
      if (navigator && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && typeof reg.showNotification === 'function') {
          reg.showNotification(title, options);
          alert('Notificación enviada (desde Service Worker)');
          return;
        }
      }

      // Fallback directo desde la página
      if (
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        new Notification(title, options);
        alert('Notificación enviada (desde página)');
        return;
      }

      throw new Error(
        'No es posible mostrar la notificación (permiso o soporte)'
      );
    } catch (err) {
        console.error('sendTest failed', err);
        const unknownErr: unknown = err;
        const errMsg =
          typeof unknownErr === 'object' && unknownErr !== null && 'message' in unknownErr
            ? String((unknownErr as { message?: unknown }).message)
            : String(unknownErr);
        alert('Fallo al enviar notificación: ' + errMsg);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div>
        Notificaciones: <strong>{status}</strong>
      </div>
      <button onClick={subscribe}>Permitir notificaciones</button>
      <button onClick={sendTest}>Enviar notificación de prueba</button>
      {lastError ? (
        <div style={{ color: 'crimson', marginLeft: 8 }}>
          Error: {lastError}
        </div>
      ) : null}
    </div>
  );
}
