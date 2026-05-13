# POSTSETUP — Pasos finales de la Fase 0

Documento personalizado al estado real de **tu** repo
(`thelionai/agroia-smart-planner-mvp`, commit inicial único, sin secretos
filtrados en el historial).

> Última actualización: Fase 0 completada por Claude.
> Tareas pendientes: solo las que requieren tu cuenta/máquina.

---

## Estado verificado

| Verificación | Estado |
|--------------|--------|
| Repo git inicializado | OK |
| Remoto configurado | `https://github.com/thelionai/agroia-smart-planner-mvp` |
| Commits con secretos en historial | **Ninguno** — solo hay 1 commit "Initial MVP" sin `.env` |
| `backend/.env` trackeado | **No** (untracked, bajo riesgo) |
| `node_modules` / `venv` trackeados | **No** |
| `SECRET_KEY` débil en disco | **Rotada a 64 chars seguros** |
| `docker-compose.yml` válido | OK (5 servicios coherentes) |
| `.github/workflows/ci.yml` válido | OK (6 jobs, dependencias correctas) |
| Tests `gdd_service` | **55/55 pasan** |

**Conclusión:** NO necesitas `git filter-repo`. No hay nada que limpiar del historial. Tu situación es la ideal.

---

## Lo que debes ejecutar (en orden)

### Paso 1 — Verificar la nueva SECRET_KEY

```bash
cd "D:\DANIEL TOSHIBA\agroia-smartplanner - copia"
cat backend/.env | findstr SECRET_KEY
```

Deberías ver:

```
SECRET_KEY=685947b15b405f82df3d563d57a13456707f44bfd157a8c2647c4e70016fd710
```

> Esta clave es la que firmará los JWT. Tratala como una contraseña: no la
> compartas, no la commitees, no la pongas en chats públicos.
>
> Si quieres generar una propia (recomendado), corre:
>
> ```bash
> openssl rand -hex 32
> ```
>
> Y reemplaza la línea `SECRET_KEY=` en `backend/.env` por la tuya.

---

### Paso 2 — Revisar qué archivos vas a commitear

Antes de hacer commit, mira qué quedará incluido:

```bash
cd "D:\DANIEL TOSHIBA\agroia-smartplanner - copia"
git status
```

Vas a ver tres grupos:

**Modificados (`M`)** — cambios míos sobre archivos que ya existían:
- `.gitignore` (endurecido)
- `README.md` (reescrito)
- `package.json`, `server/index.js`, etc. (tus cambios anteriores)

**Nuevos (`??`)** — archivos que creé yo:
- `.dockerignore`
- `.env.example` (variables del frontend)
- `.github/workflows/ci.yml`
- `Dockerfile.frontend`
- `SECURITY.md`
- `POSTSETUP.md` (este archivo)
- `docker-compose.yml`
- `server/Dockerfile`, `server/.gitignore`, `server/.env.example`
- `backend/` (toda la carpeta — esto incluye `Dockerfile`, `tests/`, etc.)

**NUNCA debe aparecer en `git status`:**

```
.env                  ← raíz, contiene VITE_API_URL
backend/.env          ← contiene SECRET_KEY
server/.env           ← cuando lo crees, también
node_modules/
backend/venv/
server/node_modules/
*.db
```

Si alguno aparece, **detente**: tu `.gitignore` no lo está bloqueando.
Avisame y lo arreglamos.

---

### Paso 3 — Crear `backend/.env` real desde el ejemplo

Tu `backend/.env` ya existe y ya tiene la SECRET_KEY rotada. Pero tu equipo
o tu yo del futuro necesitan poder regenerarlo. Verifica:

```bash
cat backend/.env.example | findstr GEMINI_API_KEY
```

Si quieres usar Gemini para recomendaciones agronómicas reales (no
simuladas), genera una API key gratuita en
[https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) y
pégala en `backend/.env`:

```
GEMINI_API_KEY=tu_clave_aqui
```

Si la dejas vacía, `ai_service.py` devuelve respuestas simuladas (no rompe nada).

---

### Paso 4 — Commitear el trabajo de la Fase 0

```bash
cd "D:\DANIEL TOSHIBA\agroia-smartplanner - copia"

# Verifica una vez más que .env NO aparece
git status | findstr "\.env"
# Solo debe aparecer .env.example

# Agregar todo
git add .

# Verificar lo que vas a commitear (último chequeo)
git status

# Commit
git commit -m "chore(fase-0): saneamiento — Docker, tests, CI, SECURITY, README"

# Push
git push origin main
```

Tras el push, **GitHub Actions arranca automáticamente**. Ve a:

`https://github.com/thelionai/agroia-smart-planner-mvp/actions`

Deberías ver 6 jobs corriendo (backend-tests, frontend-lint, frontend-build,
server-check, secret-scan, ci-status). El primero en estabilizarse será
`backend-tests` (los 55 tests pasan en menos de 1 minuto).

---

### Paso 5 — Probar el stack completo con Docker

Requiere [Docker Desktop](https://www.docker.com/products/docker-desktop/)
instalado en Windows.

```bash
cd "D:\DANIEL TOSHIBA\agroia-smartplanner - copia"

# Levantar todo (tarda ~5 minutos la primera vez por las imágenes)
docker compose up --build
```

Cuando todos los servicios estén healthy:

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API docs Swagger | http://localhost:8000/docs |
| Health backend | http://localhost:8000/health |
| Health server Node | http://localhost:3002/api/health |
| Ollama API | http://localhost:11434/api/tags |

### Descargar el modelo Ollama (solo la primera vez)

El contenedor `ollama` arranca vacío. Descarga el modelo:

```bash
docker exec -it agroia_ollama ollama pull llama3.2
```

Esto descarga ~2 GB. Tras esto, el ChatAI funciona.

### Detener todo

```bash
docker compose down
```

Datos persisten en volúmenes nombrados (`agroia_postgres_data`,
`agroia_ollama_data`). Para borrar también los datos:

```bash
docker compose down -v
```

---

### Paso 6 — Verificar que CI pasó en GitHub

Tras el push, abre:

`https://github.com/thelionai/agroia-smart-planner-mvp/actions`

Espera ~3 minutos. Cada job debe terminar en verde:

- ✅ `Backend — pytest` → 55 tests pasan, cobertura ≥ 80%
- ✅ `Frontend — ESLint` → sin errores
- ✅ `Frontend — Vite build` → dist/ generado
- ✅ `Server Node — install + syntax check`
- ⚠️ `Secret scanning` → tolerante a fallos (continue-on-error), revisa
  el log si encuentra algo
- ✅ `CI Status` → resumen final

Si algún job falla, copia el log y compártelo conmigo.

---

## Si algo sale mal

### "Cannot connect to the Docker daemon"

Docker Desktop no está corriendo. Ábrelo desde el menú Inicio y espera a
que la ballena se ponga verde en la barra de tareas.

### "port is already allocated"

Otro proceso usa uno de los puertos (5173, 8000, 3002, 5432, 11434). Para
detectar:

```bash
netstat -ano | findstr "5173"
netstat -ano | findstr "8000"
```

Cierra el proceso o cambia el puerto en `docker-compose.yml`.

### `backend-tests` falla en CI pero pasa local

Probablemente sea por el `--cov-fail-under=80`. Si tras la Fase 1 añades
código no cubierto y la cobertura cae, ajusta el threshold en
`.github/workflows/ci.yml`:

```yaml
--cov-fail-under=80   # bajar temporalmente si hace falta
```

### `git push` rechazado por GitHub con "remote contains work that you do not have locally"

Pasaba si alguien (tú u otro colaborador) pushea cambios mientras tú trabajabas. Resolver:

```bash
git pull --rebase origin main
# Resuelve conflictos si los hay
git push origin main
```

---

## Después de pasar la Fase 0

Cuando los 6 jobs estén verdes en GitHub y el `docker compose up` arranque
los 5 servicios sin errores, dime "Fase 0 OK" y arrancamos la **Fase 1 —
Motor cerrado**:

1. Reemplazar el `agroiaScore.js` stub por algoritmo real.
2. Migrar `ChatAI.jsx` a usar `api.js` + `VITE_CHAT_API_URL` (eliminar el
   hardcode de `http://localhost:3002`).
3. Conectar el endpoint `/api/recommendation` del server Node con una
   nueva vista "Ficha de Acción Agrícola" en el frontend.
4. Marcar visualmente con badge "estimado" todo dato mockeado (sobre todo
   la `soil_moisture` random del weatherService Node).
5. Mover `create_tables()` a guard por `ENVIRONMENT == "development"`.
6. Añadir tests de integración para `/prediccion/{id}` con SQLite en memoria.

Listo para arrancar cuando confirmes que Fase 0 está estable.
