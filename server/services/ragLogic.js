
/**
 * Transforms raw weather and climate data into a text context for the LLM.
 * Applies basic heuristic logic to guide the LLM.
 */
export const transformDataForRAG = (weather, climate, locationData) => {
    const { temp, humidity, soil_moisture, soil_temp_10cm } = weather;
    const { avg_radiation } = climate;

    let alerts = [];
    let recommendations = [];

    // 1. Logic: Soil Moisture
    // Assuming 0.3 as a threshold for "Needs Water" roughly (varies by crop/soil)
    if (soil_moisture < 0.3) {
        alerts.push("CRITICO: Humedad del suelo baja.");
        recommendations.push("Se recomienda riego inmediato.");
    } else {
        recommendations.push("Niveles de humedad adecuados. Mantener monitoreo.");
    }

    // 2. Logic: Temperature / Stress
    if (temp > 30) {
        alerts.push("ALERTA: Alta temperatura, riesgo de estrés térmico.");
    } else if (temp < 5) {
        alerts.push("ALERTA: Riesgo de helada.");
    }

    // 3. Logic: Humidity & Disease
    if (humidity > 80 && temp > 20) {
        alerts.push("ALERTA: Condiciones favorables para hongos (alta humedad + calor).");
    }

    // Construct the Context String
    const ecosystemContext = `
DATOS EN TIEMPO REAL (Sensores/API):
- Ubicación: ${locationData.name || 'Desconocida'}
- Temperatura Aire: ${temp}°C
- Humedad Relativa: ${humidity}%
- Temp. Suelo (10cm): ${soil_temp_10cm.toFixed(1)}°C
- Humedad Suelo: ${(soil_moisture * 100).toFixed(0)}% (Estimado)
- Radiación Solar Promedio: ${avg_radiation} kWh/m2/day

ANÁLISIS PRELIMINAR DEL SISTEMA:
- Alertas Detectadas: ${alerts.length > 0 ? alerts.join(' | ') : 'Ninguna'}
- Sugerencias Base: ${recommendations.join(' | ')}
`;

    return ecosystemContext;
};

export const SYSTEM_PROMPT_RAG = `Eres "AgroIA", un asistente agronómico avanzado especializado en cultivos de la región andina y costa del Perú.
TU OBJETIVO: Generar una "Ficha de Acción Agrícola" basada E STRICTAMENTE en los datos proporcionados.

ESTRUCTURA DE RESPUESTA OBLIGATORIA:

# 🚜 FICHA DE ACCIÓN AGRÍCOLA
**Fecha:** [Fecha Actual]
**Estado del Cultivo:** [Resumen breve basado en datos]

## 1. 🌡️ Diagnóstico Climático
[Interpretación directa de temperatura, humedad y suelo. ¿Son ideales para el cultivo mencionado?]

## 2. 💧 Recomendación de Riego
[Directiva clara: ¿Regar hoy? ¿Cuánto? ¿A qué hora? Basado en humedad del suelo]

## 3. 🛡️ Prevención de Plagas/Enfermedades
[Basado en clima: Si hay alta humedad y calor, alertar hongos. Si es seco, otras plagas. Si no hay riesgo, dilo.]

## 4. 💡 Acciones Sugeridas (Próximas 24h)
- [Acción 1]
- [Acción 2]
- [Acción 3]

REGLAS DE OLLAMA:
- NO INVENTES DATOS. Usa los números entregados en el bloque "DATOS EN TIEMPO REAL".
- Si falta información crítica, asume valores promedio y avisa.
- Sé conciso y técnico pero accesible al agricultor.
- Idioma: Español Neutro/Peruano.
`;
