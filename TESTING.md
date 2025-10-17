# Testing y publicación de My PWA

Esta guía cubre pasos prácticos para poner la PWA en HTTPS, probarla en navegadores, verificar instalación/offline/notificaciones y ejecutar Lighthouse.

## 1) Publicación en HTTPS

Plataformas que dan HTTPS por defecto:

- Vercel: arrastra tu repo o conecta GitHub → Deploy. URL con HTTPS.
- Netlify: igual que Vercel.
- GitHub Pages: también puede usarse (con `gh-pages`), pero Vercel/Netlify suelen ser más directos para apps SPA.

Recomendación rápida (Vercel):

1. Conecta tu repo en vercel.com.
2. Selecciona el proyecto y haz deploy. Vercel detecta vite y hará build automáticamente.
3. La URL proporcionada será `https://<tu-proyecto>.vercel.app` y tendrá HTTPS.

## 2) Probar la PWA en dos navegadores

Navegadores recomendados: Chrome (o Edge) y Firefox. Algunos comportamientos (Background Sync, Push) son mejores en Chromium.

Pasos básicos (Chrome):

1. Abre la URL HTTPS del deploy.
2. Abre DevTools → Application → Service Workers. Confirma que el SW está activo y que `/offline.html` y otros activos están cacheados.
3. Prueba offline: DevTools → Network → Offline. Prueba crear entradas con el formulario y recarga.
4. Comprueba que las entradas aparecen desde IndexedDB (Application → IndexedDB) y que el SW las sincroniza cuando vuelvas online.
5. Prueba instalar la app: Chrome mostrará un botón “Install” o un icono en la omnibox para añadir a pantalla de inicio.

Pasos (Firefox):

- Firefox no soporta Background Sync igual que Chromium. Prueba offline y la persistencia de IndexedDB y la carga desde cache. Las notificaciones Push pueden funcionar si configuras FCM o VAPID correctamente.

## 3) Verificaciones a realizar

- Instalación en pantalla de inicio:
  - En Chrome/Edge: busca el botón de Install o en DevTools → Application → Manifest → "Display: standalone" y prueba "Install".
- Operación offline del formulario:
  - Ir a Network → Offline, crear acciones con el formulario. Verificar en Application → IndexedDB que las entradas están.
  - Volver online y verificar que los datos permanecen en IndexedDB. No hay sincronización remota en este build.
- Recepción de notificaciones (modo cliente-only):
  - Otorgar permiso desde la UI (botón "Permitir notificaciones").
  - Usar el botón "Enviar notificación de prueba" para generar notificaciones locales.
  - Nota: ya no existe el endpoint `POST /api/push-test` porque el proyecto no incluye backend.

## 4) Lighthouse (auditoría automática)

Local (en Chrome):

1. Abre la app en Chrome.
2. DevTools → Lighthouse.
3. Selecciona Mobile o Desktop, marca "Progressive Web App" y pulsa "Generate report".

En CI (opcional):

- Puedes usar GitHub Actions con LHCI para ejecutar pruebas periódicas (ejemplo: `.github/workflows/lighthouse.yml`).

## 5) Script CI (opcional)

- Si quieres, puedo añadir un workflow que haga `npm run build` y ejecute Lighthouse CI contra la carpeta `dist`.

---

Si quieres que implemente el workflow de GitHub Actions (Lighthouse CI) o que despliegue automáticamente a Vercel desde este repo, dime y lo preparo.
