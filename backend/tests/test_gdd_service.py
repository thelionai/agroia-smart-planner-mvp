"""
tests/test_gdd_service.py
─────────────────────────
Suite de tests unitarios para el motor GDD.

El motor GDD es 100% puro (sin BD ni HTTP), por lo que es ideal para
tests rápidos y deterministas. Esta suite es la red de seguridad de
todo el proyecto: si el motor GDD se rompe, las predicciones se rompen.

Cobertura objetivo: ≥ 80% de gdd_service.py.

Ejecutar:
    cd backend
    pytest tests/test_gdd_service.py -v
"""
import pytest
from datetime import date, timedelta

from app.services import gdd_service
from app.services.gdd_service import (
    DatoDiario,
    calcular_gdd_diario,
    calcular_gdd_acumulado,
    determinar_fase,
    obtener_umbral_proxima_fase,
    obtener_nombre_proxima_fase,
    estimar_fecha_por_umbral,
    estimar_fecha_futura,
    estimar_dias_restantes,
)


# ══════════════════════════════════════════════════════════════════
# calcular_gdd_diario — fórmula básica del motor
# ══════════════════════════════════════════════════════════════════

class TestCalcularGddDiario:
    """Tests para la fórmula: GDD = max((Tmax+Tmin)/2 - Tbase, 0)"""

    def test_caso_tipico(self):
        # Maíz, día templado: (25 + 15)/2 - 10 = 10.0
        assert calcular_gdd_diario(tmax=25, tmin=15, tbase=10) == 10.0

    def test_dia_frio_devuelve_cero(self):
        # Si la temperatura media es menor a Tbase, GDD debe ser 0 (no negativo)
        assert calcular_gdd_diario(tmax=5, tmin=0, tbase=10) == 0.0

    def test_dia_exactamente_en_tbase(self):
        # Si Tmedia == Tbase, GDD = 0
        assert calcular_gdd_diario(tmax=10, tmin=10, tbase=10) == 0.0

    def test_redondeo_a_dos_decimales(self):
        # (23 + 14) / 2 = 18.5, - 10 = 8.5
        assert calcular_gdd_diario(tmax=23, tmin=14, tbase=10) == 8.5

    def test_papa_tbase_baja(self):
        # Papa (Tbase=7): (20 + 8)/2 - 7 = 14 - 7 = 7
        assert calcular_gdd_diario(tmax=20, tmin=8, tbase=7) == 7.0

    def test_quinua_tbase_muy_baja(self):
        # Quinua (Tbase=3): andina, soporta frío
        assert calcular_gdd_diario(tmax=15, tmin=5, tbase=3) == 7.0

    def test_temperaturas_negativas(self):
        # Helada extrema: tmin negativa, tmax positiva
        # (10 + (-5))/2 - 5 = 2.5 - 5 = -2.5 → max(0)
        assert calcular_gdd_diario(tmax=10, tmin=-5, tbase=5) == 0.0

    def test_tmedia_apenas_supera_tbase(self):
        # Caso borde: GDD = 0.5
        # (16 + 5)/2 - 10 = 10.5 - 10 = 0.5
        assert calcular_gdd_diario(tmax=16, tmin=5, tbase=10) == 0.5


# ══════════════════════════════════════════════════════════════════
# calcular_gdd_acumulado — serie temporal
# ══════════════════════════════════════════════════════════════════

class TestCalcularGddAcumulado:
    """Tests para procesar una serie de días."""

    def test_lista_vacia(self):
        resultado = calcular_gdd_acumulado(datos_clima=[], tbase=10)
        assert resultado == []

    def test_un_solo_dia(self):
        datos = [(date(2026, 1, 1), 25, 15)]
        resultado = calcular_gdd_acumulado(datos, tbase=10)
        assert len(resultado) == 1
        assert resultado[0].gdd == 10.0
        assert resultado[0].fecha == date(2026, 1, 1)
        assert resultado[0].tmax == 25
        assert resultado[0].tmin == 15

    def test_serie_de_3_dias(self):
        datos = [
            (date(2026, 1, 1), 20, 10),   # GDD = 5
            (date(2026, 1, 2), 25, 15),   # GDD = 10
            (date(2026, 1, 3), 30, 20),   # GDD = 15
        ]
        resultado = calcular_gdd_acumulado(datos, tbase=10)
        assert len(resultado) == 3
        assert [d.gdd for d in resultado] == [5.0, 10.0, 15.0]

    def test_preserva_orden(self):
        # El servicio NO debe reordenar la lista
        datos = [
            (date(2026, 1, 3), 30, 20),
            (date(2026, 1, 1), 20, 10),
            (date(2026, 1, 2), 25, 15),
        ]
        resultado = calcular_gdd_acumulado(datos, tbase=10)
        fechas = [d.fecha for d in resultado]
        assert fechas == [date(2026, 1, 3), date(2026, 1, 1), date(2026, 1, 2)]


# ══════════════════════════════════════════════════════════════════
# determinar_fase — clasificación en 4 etapas
# ══════════════════════════════════════════════════════════════════

class TestDeterminarFase:
    """
    Umbrales para Maíz:
      umbral_floracion = 500
      umbral_madurez   = 1200
      umbral_emergencia = 500 * 0.10 = 50
    """

    UMBRAL_FLORACION = 500
    UMBRAL_MADUREZ = 1200

    def test_emergencia_gdd_bajo(self):
        # GDD = 30 < 50 → emergencia
        fase = determinar_fase(
            gdd_acumulado=30,
            umbral_floracion=self.UMBRAL_FLORACION,
            umbral_madurez=self.UMBRAL_MADUREZ,
        )
        assert fase == "emergencia"

    def test_emergencia_exactamente_cero(self):
        fase = determinar_fase(0, self.UMBRAL_FLORACION, self.UMBRAL_MADUREZ)
        assert fase == "emergencia"

    def test_frontera_emergencia_a_vegetativo(self):
        # GDD = 50 (exactamente el umbral) → ya es vegetativo
        fase = determinar_fase(50, self.UMBRAL_FLORACION, self.UMBRAL_MADUREZ)
        assert fase == "vegetativo"

    def test_vegetativo_medio(self):
        fase = determinar_fase(250, self.UMBRAL_FLORACION, self.UMBRAL_MADUREZ)
        assert fase == "vegetativo"

    def test_frontera_vegetativo_a_floracion(self):
        # GDD = 500 (exactamente el umbral_floracion) → floracion
        fase = determinar_fase(500, self.UMBRAL_FLORACION, self.UMBRAL_MADUREZ)
        assert fase == "floracion"

    def test_floracion_medio(self):
        fase = determinar_fase(800, self.UMBRAL_FLORACION, self.UMBRAL_MADUREZ)
        assert fase == "floracion"

    def test_frontera_floracion_a_madurez(self):
        # GDD = 1200 → madurez
        fase = determinar_fase(1200, self.UMBRAL_FLORACION, self.UMBRAL_MADUREZ)
        assert fase == "madurez"

    def test_madurez_excedida(self):
        fase = determinar_fase(2000, self.UMBRAL_FLORACION, self.UMBRAL_MADUREZ)
        assert fase == "madurez"

    @pytest.mark.parametrize("gdd,esperado", [
        (0,    "emergencia"),
        (10,   "emergencia"),
        (49.9, "emergencia"),
        (50,   "vegetativo"),
        (250,  "vegetativo"),
        (499,  "vegetativo"),
        (500,  "floracion"),
        (750,  "floracion"),
        (1199, "floracion"),
        (1200, "madurez"),
        (1500, "madurez"),
    ])
    def test_tabla_parametrizada_maiz(self, gdd, esperado):
        fase = determinar_fase(gdd, self.UMBRAL_FLORACION, self.UMBRAL_MADUREZ)
        assert fase == esperado


# ══════════════════════════════════════════════════════════════════
# obtener_umbral_proxima_fase / obtener_nombre_proxima_fase
# ══════════════════════════════════════════════════════════════════

class TestProximaFase:

    UMBRAL_FLORACION = 500
    UMBRAL_MADUREZ = 1200

    def test_umbral_proximo_desde_emergencia(self):
        # Desde emergencia, el siguiente umbral es 10% de floración = 50
        u = obtener_umbral_proxima_fase(
            "emergencia", self.UMBRAL_FLORACION, self.UMBRAL_MADUREZ
        )
        assert u == 50.0

    def test_umbral_proximo_desde_vegetativo(self):
        u = obtener_umbral_proxima_fase(
            "vegetativo", self.UMBRAL_FLORACION, self.UMBRAL_MADUREZ
        )
        assert u == 500

    def test_umbral_proximo_desde_floracion(self):
        u = obtener_umbral_proxima_fase(
            "floracion", self.UMBRAL_FLORACION, self.UMBRAL_MADUREZ
        )
        assert u == 1200

    def test_umbral_proximo_desde_madurez(self):
        # En madurez ya no hay próxima fase, devuelve el mismo umbral_madurez
        u = obtener_umbral_proxima_fase(
            "madurez", self.UMBRAL_FLORACION, self.UMBRAL_MADUREZ
        )
        assert u == 1200

    @pytest.mark.parametrize("actual,siguiente", [
        ("emergencia", "vegetativo"),
        ("vegetativo", "floracion"),
        ("floracion",  "madurez"),
        ("madurez",    "completado"),
    ])
    def test_nombres_secuenciales(self, actual, siguiente):
        assert obtener_nombre_proxima_fase(actual) == siguiente

    def test_nombre_fase_desconocida(self):
        # Si llega una fase inválida, devuelve "completado" (fallback seguro)
        assert obtener_nombre_proxima_fase("xxxxx") == "completado"


# ══════════════════════════════════════════════════════════════════
# estimar_fecha_por_umbral — recorrido histórico
# ══════════════════════════════════════════════════════════════════

class TestEstimarFechaPorUmbral:

    def _generar_dias(self, n: int, gdd_por_dia: float) -> list[DatoDiario]:
        """Helper: genera n DatoDiario consecutivos con GDD fijo."""
        inicio = date(2026, 1, 1)
        return [
            DatoDiario(
                fecha=inicio + timedelta(days=i),
                tmax=20, tmin=10, gdd=gdd_por_dia,
            )
            for i in range(n)
        ]

    def test_umbral_alcanzado_en_dia_exacto(self):
        # 10 días × 5 GDD/día = 50 GDD total
        dias = self._generar_dias(n=10, gdd_por_dia=5.0)
        total, fecha = estimar_fecha_por_umbral(
            datos_historicos=dias,
            tbase=10,
            umbral=50,
            fecha_inicio=date(2026, 1, 1),
        )
        assert total == 50.0
        # Día 10 (índice 9) es cuando se alcanza
        assert fecha == date(2026, 1, 10)

    def test_umbral_no_alcanzado(self):
        # 5 días × 5 GDD = 25 GDD, umbral = 100
        dias = self._generar_dias(n=5, gdd_por_dia=5.0)
        total, fecha = estimar_fecha_por_umbral(
            datos_historicos=dias,
            tbase=10,
            umbral=100,
            fecha_inicio=date(2026, 1, 1),
        )
        assert total == 25.0
        assert fecha is None

    def test_umbral_alcanzado_dia_1(self):
        # Primer día ya supera el umbral
        dias = self._generar_dias(n=10, gdd_por_dia=100.0)
        total, fecha = estimar_fecha_por_umbral(
            datos_historicos=dias,
            tbase=10,
            umbral=50,
            fecha_inicio=date(2026, 1, 1),
        )
        assert fecha == date(2026, 1, 1)

    def test_lista_vacia(self):
        total, fecha = estimar_fecha_por_umbral(
            datos_historicos=[],
            tbase=10,
            umbral=100,
            fecha_inicio=date(2026, 1, 1),
        )
        assert total == 0
        assert fecha is None


# ══════════════════════════════════════════════════════════════════
# estimar_fecha_futura — proyección hacia adelante
# ══════════════════════════════════════════════════════════════════

class TestEstimarFechaFutura:

    def test_proyeccion_normal(self):
        # Faltan 100 GDD, promedio 10 GDD/día → 10 días
        fecha = estimar_fecha_futura(
            gdd_acumulado=200,
            umbral_objetivo=300,
            gdd_promedio_diario=10,
            desde=date(2026, 1, 1),
        )
        assert fecha == date(2026, 1, 11)

    def test_ya_alcanzado_devuelve_none(self):
        fecha = estimar_fecha_futura(
            gdd_acumulado=500,
            umbral_objetivo=300,
            gdd_promedio_diario=10,
            desde=date(2026, 1, 1),
        )
        assert fecha is None

    def test_promedio_cero_usa_minimo(self):
        # Si el promedio diario es 0, internamente se asume 1 GDD/día
        # (regla de seguridad para evitar división por cero)
        fecha = estimar_fecha_futura(
            gdd_acumulado=0,
            umbral_objetivo=10,
            gdd_promedio_diario=0,
            desde=date(2026, 1, 1),
        )
        assert fecha is not None  # algún resultado, no crash

    def test_dias_minimo_uno(self):
        # Aunque el cálculo dé 0 días, el mínimo es 1
        fecha = estimar_fecha_futura(
            gdd_acumulado=299,
            umbral_objetivo=300,
            gdd_promedio_diario=1000,  # promedio enorme → dias ≈ 0
            desde=date(2026, 1, 1),
        )
        assert fecha == date(2026, 1, 2)  # mínimo 1 día


# ══════════════════════════════════════════════════════════════════
# estimar_dias_restantes
# ══════════════════════════════════════════════════════════════════

class TestEstimarDiasRestantes:

    def test_calculo_normal(self):
        # Faltan 100 GDD, promedio 10/día → 10 días
        dias = estimar_dias_restantes(
            gdd_acumulado=200,
            umbral_objetivo=300,
            tbase=10,
            gdd_promedio_diario=10,
        )
        assert dias == 10

    def test_ya_alcanzado_devuelve_cero(self):
        dias = estimar_dias_restantes(
            gdd_acumulado=500,
            umbral_objetivo=300,
            tbase=10,
            gdd_promedio_diario=10,
        )
        assert dias == 0

    def test_promedio_none_usa_default(self):
        # Sin promedio, asume 8 GDD/día
        dias = estimar_dias_restantes(
            gdd_acumulado=0,
            umbral_objetivo=80,
            tbase=10,
            gdd_promedio_diario=None,
        )
        assert dias == 10  # 80 / 8 = 10

    def test_minimo_un_dia(self):
        dias = estimar_dias_restantes(
            gdd_acumulado=299,
            umbral_objetivo=300,
            tbase=10,
            gdd_promedio_diario=100,  # 1/100 = 0, pero mínimo 1
        )
        assert dias == 1


# ══════════════════════════════════════════════════════════════════
# Tests de integración del motor completo (escenarios realistas)
# ══════════════════════════════════════════════════════════════════

class TestEscenariosRealistas:
    """
    Simulan ciclos completos de cultivos para validar el motor
    end-to-end (todavía sin BD).
    """

    def test_ciclo_completo_maiz(self):
        """
        Maíz sembrado 1 enero 2026 en clima templado constante.
        Promedio diario: 12 GDD (Tbase=10, Tmean=22°C).
        Floración a 500 GDD → ~42 días.
        Madurez a 1200 GDD → ~100 días.
        """
        TBASE = 10
        UMBRAL_FLOR = 500
        UMBRAL_MAD = 1200

        # Generar 120 días con temperaturas constantes
        datos = [
            (date(2026, 1, 1) + timedelta(days=i), 26, 18)
            for i in range(120)
        ]
        dias_calc = calcular_gdd_acumulado(datos, tbase=TBASE)

        # Cada día aporta (26+18)/2 - 10 = 12 GDD
        assert all(d.gdd == 12.0 for d in dias_calc)

        # Floración: 500/12 = ~42 días (índice 41)
        total_flor, fecha_flor = estimar_fecha_por_umbral(
            dias_calc, TBASE, UMBRAL_FLOR, date(2026, 1, 1)
        )
        assert fecha_flor == date(2026, 1, 1) + timedelta(days=41)

        # Madurez: 1200/12 = 100 días (índice 99)
        _, fecha_mad = estimar_fecha_por_umbral(
            dias_calc, TBASE, UMBRAL_MAD, date(2026, 1, 1)
        )
        assert fecha_mad == date(2026, 1, 1) + timedelta(days=99)

        # Fase tras 50 días: 50 × 12 = 600 GDD → floración
        gdd_dia_50 = 50 * 12
        assert determinar_fase(gdd_dia_50, UMBRAL_FLOR, UMBRAL_MAD) == "floracion"

    def test_ciclo_quinua_clima_andino(self):
        """
        Quinua (Tbase=3) en clima andino frío.
        Tmedia=10°C → 7 GDD/día.
        Floración a 400 GDD → ~57 días.
        """
        TBASE = 3
        UMBRAL_FLOR = 400

        datos = [
            (date(2026, 9, 1) + timedelta(days=i), 15, 5)
            for i in range(80)
        ]
        dias_calc = calcular_gdd_acumulado(datos, tbase=TBASE)

        # Cada día: (15+5)/2 - 3 = 7
        assert dias_calc[0].gdd == 7.0

        total, fecha_flor = estimar_fecha_por_umbral(
            dias_calc, TBASE, UMBRAL_FLOR, date(2026, 9, 1)
        )
        # 400 / 7 = 57.14 → día 58 (índice 57)
        assert fecha_flor == date(2026, 9, 1) + timedelta(days=57)

    def test_cultivo_no_germina_en_frio(self):
        """
        Si todos los días la temperatura media < Tbase, el GDD acumulado es 0
        y el cultivo nunca alcanza floración.
        """
        TBASE = 10

        datos = [
            (date(2026, 6, 1) + timedelta(days=i), 8, 2)  # tmedia=5 < tbase
            for i in range(60)
        ]
        dias_calc = calcular_gdd_acumulado(datos, tbase=TBASE)

        assert all(d.gdd == 0.0 for d in dias_calc)

        total, fecha = estimar_fecha_por_umbral(
            dias_calc, TBASE, 500, date(2026, 6, 1)
        )
        assert total == 0.0
        assert fecha is None  # nunca se alcanza
