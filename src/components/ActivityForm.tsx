import { useState } from 'react';
import type { Activity } from '../utils/indexedDB';
import { addActivity } from '../utils/indexedDB';

// helper para registrar background sync si está disponible
async function registerSync() {
  try {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const reg = await navigator.serviceWorker.ready;
      // ServiceWorkerRegistration may not expose the sync type in this TS setup.
      // Narrow to the expected shape instead of using `any`.
      const maybeReg = reg as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> };
      };
      if (maybeReg.sync && typeof maybeReg.sync.register === 'function') {
        await maybeReg.sync.register('sync-entries');
      }
      console.log('Background sync registrado: sync-entries');
    }
  } catch (err) {
    console.warn('No se pudo registrar background sync', err);
  }
}

type Props = {
  onSave: (activity: Activity) => void;
};

export default function ActivityForm({ onSave }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const activity: Activity = {
      title: title.trim(),
      description: description.trim(),
      createdAt: Date.now(),
    };
    // guardamos en indexedDB local
    addActivity(activity)
      .then(() => {
        // si estamos offline, registramos background sync para enviar después
        if (!navigator.onLine) {
          registerSync();
        } else {
          // si estamos online, también notificamos al padre (que recargue la lista)
        }
        onSave(activity);
        setTitle('');
        setDescription('');
      })
      .catch((err) => {
        console.error('Error guardando actividad localmente', err);
      });
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título"
        aria-label="Título"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        rows={3}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit">Guardar</button>
      </div>
    </form>
  );
}
