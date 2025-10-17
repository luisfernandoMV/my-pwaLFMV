# my-pwaLFMV — Client-only PWA (React + TypeScript + Vite)

Este repositorio contiene una Progressive Web App implementada con React + TypeScript + Vite.

Nota: se eliminó el backend del proyecto. Ahora la aplicación es 100% client-side. Todas las funcionalidades de persistencia usan IndexedDB / localStorage y las notificaciones se manejan desde el cliente (Service Worker o Notification API). Esto facilita desplegarla como un sitio estático.

Principales cambios:
- Eliminado el directorio `server/` (ya no hay API ni almacenamiento remoto).
- `PushManager` y el Service Worker han sido adaptados a un modo "cliente-only" que muestra notificaciones locales y mantiene los datos en IndexedDB.

Nota de seguridad: se ha eliminado `vapid.json` del repositorio para evitar exponer claves privadas. Si tenías claves VAPID en el repo, crea nuevas y guárdalas fuera del control de versión.

Si quieres restaurar un backend o usar notificaciones push reales (VAPID/FCM), tendrás que volver a añadir un servidor que gestione suscripciones y envíe notificaciones.

## Desarrollo

Instala dependencias y arranca Vite (desarrollo):

```powershell
npm install
npm run dev
```

## Cómo probar notificaciones y sincronización local

- Habilita notificaciones desde la UI (botón "Permitir notificaciones").
- Usa "Enviar notificación de prueba" para generar una notificación local (se intenta por Service Worker primero y luego por la página).
- Las entradas/actividades se guardan en IndexedDB. El Service Worker ya no intentará enviar datos a un backend remoto.

Para más detalles técnicos revisa `src/components/PushManager.tsx` y `public/sw.js`.
