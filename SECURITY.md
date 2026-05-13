# Security Policy

## Reportar una vulnerabilidad

Si descubres una vulnerabilidad en AgroIA SmartPlanner, por favor **no la
publiques como issue público**. En su lugar:

1. Envía un correo a `<security@agroia.com>` (placeholder — actualizar).
2. Describe el problema, pasos para reproducir, e impacto estimado.
3. Te confirmaremos recepción en menos de 72 horas.
4. Coordinaremos un parche y un disclosure responsable.

---

## Datos sensibles que NUNCA deben commitearse

| Archivo | Contiene | Acción si fue commiteado |
|---------|----------|--------------------------|
| `.env` (raíz) | URL del backend | Bajo riesgo, pero limpiarlo |
| `backend/.env` | `SECRET_KEY`, `DATABASE_URL`, `GEMINI_API_KEY` | **CRÍTICO** — rotar todas las claves |
| `server/.env` | `OPENWEATHER_API_KEY` | Rotar la key en OpenWeatherMap |
| `*.db`, `*.sqlite` | Datos de usuarios, hashes bcrypt | Borrar del historial |

---

## Procedimiento de rotación de SECRET_KEY

La `SECRET_KEY` firma todos los JWT. Si se filtró, **todos los tokens emitidos
con ella deben considerarse comprometidos**.

### 1. Generar nueva clave

```bash
openssl rand -hex 32
```

Pega el resultado en `backend/.env` reemplazando el valor anterior.

### 2. Invalidar tokens existentes

Como la clave cambió, todos los JWT firmados con la anterior serán rechazados
automáticamente por `python-jose` con `InvalidSignatureError`. El frontend ya
maneja esto: el interceptor de `src/services/api.js` detecta el 401, limpia
`localStorage` y fuerza relogin. No hace falta nada más.

### 3. Reiniciar el backend

```bash
# Docker:
docker compose restart backend

# Manual:
# Ctrl+C en la terminal de uvicorn y volver a arrancar
```

### 4. (Opcional) Forzar logout global

Si quieres invalidar también las sesiones del navegador antes de que expiren:

```sql
-- Conectarse a la base y truncar una tabla de sesiones si existe
-- Por ahora no hay tabla de sesiones, los JWT son stateless.
-- Bastará con el cambio de SECRET_KEY.
```

---

## Procedimiento para sacar `.env` del historial de git

Si ya commiteaste un `.env` con secretos, **borrarlo con un commit normal no
es suficiente** — sigue accesible en el historial.

### Opción A — `git filter-repo` (recomendado, requiere instalar)

```bash
# Instalar (una sola vez)
pip install git-filter-repo

# Hacer backup antes (importante)
cp -r .git .git.backup

# Limpiar el archivo de TODO el historial
git filter-repo --invert-paths --path .env
git filter-repo --invert-paths --path backend/.env
git filter-repo --invert-paths --path server/.env

# Forzar push al remoto (esto reescribe el historial — coordinar con el equipo)
git push origin --force --all
git push origin --force --tags
```

### Opción B — BFG Repo-Cleaner (alternativa)

```bash
# Descargar bfg.jar de https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

### Después de limpiar

1. **Rotar todas las claves** que estuvieron expuestas (no basta con
   borrarlas del historial, los atacantes podrían haberlas copiado).
2. Notificar a todos los colaboradores que hagan `git clone` fresco (su
   copia local tiene el historial antiguo y al hacer push podrían
   re-introducir los secretos).
3. Verificar con `git log -- .env` que no queda rastro.

---

## Checklist pre-commit

Antes de commitear, verifica:

- [ ] No hay archivos `.env`, `.env.local`, etc. en `git status`.
- [ ] No hay valores hardcodeados de `SECRET_KEY`, API keys o passwords en el código.
- [ ] No hay archivos `*.db` o `*.sqlite` con datos reales.
- [ ] Los archivos `.env.example` no contienen valores reales, solo placeholders.

Recomendado: instalar `pre-commit` con un hook que busque secretos.

```bash
pip install pre-commit detect-secrets
pre-commit install
```

Y un `.pre-commit-config.yaml` mínimo:

```yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
```

---

## Variables de entorno seguras en producción

**No** uses archivos `.env` en producción. Usa el gestor de secretos del
proveedor:

| Proveedor | Mecanismo |
|-----------|-----------|
| Render | Environment variables en el panel del servicio |
| Railway | Variables en el dashboard del proyecto |
| Vercel | Project Settings → Environment Variables |
| AWS | Secrets Manager o Parameter Store |
| Docker Swarm / K8s | Docker secrets o Kubernetes secrets |

---

## Configuración mínima recomendada para producción

```bash
# Backend
SECRET_KEY=<64 chars aleatorios, generados con openssl rand -hex 32>
DATABASE_URL=postgresql://...
ENVIRONMENT=production
ACCESS_TOKEN_EXPIRE_MINUTES=30   # más corto en prod
ALGORITHM=HS256                  # o RS256 si quieres firma asimétrica
```

Además, en producción:

- HTTPS obligatorio (Render/Vercel lo dan gratis con Let's Encrypt).
- CORS restrictivo: en `backend/app/main.py`, sustituir el placeholder
  `https://tu-dominio-en-render-o-vercel.com` por el dominio real.
- Rate limiting (instalar `slowapi`).
- Considera migrar a cookies `httpOnly + Secure + SameSite=Strict` en
  lugar de `localStorage` para el JWT.

---

## Dependencias con CVEs conocidas

Auditar regularmente:

```bash
# Python
cd backend
pip install pip-audit
pip-audit

# Node
npm audit
cd server && npm audit
```

Conocidas a fecha de este documento:

- `python-jose==3.3.0` — actualizar a `3.4.0+` cuando esté disponible
  (CVE-2024-33664, denial-of-service via JWT bomb).

---

## Contacto

Equipo de seguridad: `<security@agroia.com>` (placeholder)
