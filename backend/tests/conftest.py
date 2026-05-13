"""
tests/conftest.py
─────────────────
Fixtures y configuración compartida para todos los tests.

Para que pytest descubra `app/` como módulo, este archivo añade el
directorio raíz del backend al sys.path.
"""
import sys
from pathlib import Path

# Añadir backend/ al path para poder importar `app.*`
BACKEND_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_ROOT))
