The original `server/` folder was intended to be removed when converting the repo to client-only. If these files are still present, please either delete the `server/` folder or move it to this `archive/` directory.

Files that should be removed or archived:

- server/index.js
- server/db.js
- server/vapid.json
- server/.env
- server/.env.example
- server/package.json
- server/package-lock.json
- server/sql/schema.sql

Reason: the project is now client-only. Keeping backend files in the main repo may expose secrets and confuse deployment.

If you want, I can move the server files here, but the environment may block filesystem moves; consider running locally:

```powershell
# move the server folder to archive
Move-Item -Path .\server -Destination .\archive\server -Force
```
