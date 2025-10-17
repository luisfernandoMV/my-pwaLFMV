# Backend de ejemplo para My PWA

Pequeño backend Express que recibe entradas sincronizadas desde la PWA y las guarda en Postgres.

Prerequisitos:
- Node.js (>=18 recomendado)
- Postgres local

Pasos rápidos:

1. Crear la base de datos (ejemplo usando psql):

```sh
createdb pwa_db
psql -d pwa_db -f sql/schema.sql
```

2. Copiar `.env.example` a `.env` y ajustar `PG_CONNECTION` si es necesario.

3. Instalar dependencias y arrancar:

```powershell
cd server
npm install
npm run dev
```

El servidor escuchará en el puerto `PORT` (por defecto 4000) y expondrá `POST /api/sync-entries`.

Payload esperado:

```json
{ "entries": [ { "title": "Tarea 1", "description": "texto", "createdAt": 169" } ] }
```
