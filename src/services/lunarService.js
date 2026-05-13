/**
 * src/services/lunarService.js
 * ─────────────────────────────
 * Cálculo de fase lunar puro JS. Sin API externas.
 * Algoritmo: período sinódico de 29.53059 días desde
 * una luna nueva de referencia conocida.
 */

// Luna nueva de referencia: 2000-01-06 18:14 UTC
const REFERENCIAS_LUNA_NUEVA = new Date('2000-01-06T18:14:00Z');
const PERIODO_SINODICO = 29.53059; // días

const FASES = [
    { nombre: 'Luna Nueva', emoji: '🌑', optima_siembra: false, iluminacion: 0 },
    { nombre: 'Luna Creciente', emoji: '🌒', optima_siembra: true, iluminacion: 25 },
    { nombre: 'Cuarto Creciente', emoji: '🌓', optima_siembra: true, iluminacion: 50 },
    { nombre: 'Luna Gibosa', emoji: '🌔', optima_siembra: false, iluminacion: 75 },
    { nombre: 'Luna Llena', emoji: '🌕', optima_siembra: false, iluminacion: 100 },
    { nombre: 'Gibosa Menguante', emoji: '🌖', optima_siembra: false, iluminacion: 75 },
    { nombre: 'Cuarto Menguante', emoji: '🌗', optima_siembra: false, iluminacion: 50 },
    { nombre: 'Luna Menguante', emoji: '🌘', optima_siembra: true, iluminacion: 25 },
];

/**
 * Calcula la fase lunar para una fecha dada.
 * @param {Date} fecha - Fecha a calcular (default: hoy)
 * @returns {{ nombre: string, emoji: string, illuminacion: number, optima_siembra: boolean, dia_ciclo: number }}
 */
export function calcularFaseLunar(fecha = new Date()) {
    const diff = (fecha.getTime() - REFERENCIAS_LUNA_NUEVA.getTime()) / (1000 * 60 * 60 * 24);
    const diaCiclo = ((diff % PERIODO_SINODICO) + PERIODO_SINODICO) % PERIODO_SINODICO;
    const indice = Math.floor((diaCiclo / PERIODO_SINODICO) * 8) % 8;
    const fase = FASES[indice];

    // Calcular iluminación interpolada
    const porcentajeCiclo = diaCiclo / PERIODO_SINODICO;
    let illuminacion;
    if (porcentajeCiclo <= 0.5) {
        illuminacion = Math.round(porcentajeCiclo * 2 * 100); // crece 0→100
    } else {
        illuminacion = Math.round((1 - (porcentajeCiclo - 0.5) * 2) * 100); // decrece 100→0
    }

    // Días hasta la próxima luna nueva
    const diasHastaProxima = Math.round(PERIODO_SINODICO - diaCiclo);

    return {
        ...fase,
        illuminacion,
        dia_ciclo: Math.floor(diaCiclo),
        dias_hasta_nueva: diasHastaProxima,
    };
}

/**
 * Recomendación agrícola basada en fase lunar.
 * Basado en agricultura biodinámica (Rudolf Steiner).
 */
export function recomendacionLunar(fecha = new Date()) {
    const fase = calcularFaseLunar(fecha);
    const diaciclo = fase.dia_ciclo;

    if (diaciclo <= 3 || diaciclo >= 27) {
        return { accion: 'Descanso del suelo', detalle: 'Luna nueva — evitar actividades intensas', nivel: 'neutral' };
    }
    if (diaciclo <= 7) {
        return { accion: 'Siembra recomendada', detalle: 'Luna creciente — ideal para cultivos de fruto', nivel: 'optimo' };
    }
    if (diaciclo <= 14) {
        return { accion: 'Fertilización', detalle: 'Cuarto creciente — máxima absorción de nutrientes', nivel: 'bueno' };
    }
    if (diaciclo <= 18) {
        return { accion: 'Cosecha óptima', detalle: 'Luna llena — mayor concentración de jugos', nivel: 'cosecha' };
    }
    return { accion: 'Poda y deshierbe', detalle: 'Luna menguante — energía hacia raíces', nivel: 'mantenimiento' };
}
