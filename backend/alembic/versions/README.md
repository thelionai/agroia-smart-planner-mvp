## Migrations de Alembic

Las migraciones se generan y aplican con estos comandos desde `/backend`.

### Comandos clave

```bash
# Activar entorno virtual primero:
venv\Scripts\activate

# Crear migración automática (detecta cambios en los modelos):
alembic revision --autogenerate -m "descripcion_del_cambio"

# Aplicar todas las migraciones pendientes:
alembic upgrade head

# Ver historial de migraciones:
alembic history --verbose

# Revertir una migración:
alembic downgrade -1

# Ver migración actual de la BD:
alembic current
```
