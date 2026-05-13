"""
app/services/ai_service.py
──────────────────────────
Servicio para interactuar con Gemini 1.5 Pro.
Genera recomendaciones agronómicas basadas en el contexto del cultivo.
"""
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configurar Gemini si hay API Key
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("⚠️ GEMINI_API_KEY no configurada. Las recomendaciones IA serán simuladas.")

def obtener_recomendacion_agronomica(contexto: dict) -> str:
    """
    Genera una recomendación breve usando Gemini.
    Contexto esperado: {cultivo, fase, gdd, clima, alertas}
    """
    prompt = f"""
    Actúa como un experto agrónomo digital.
    Dada la siguiente situación de un cultivo, genera una recomendación técnica BREVE (máximo 2 líneas).
    
    CULTIVO: {contexto.get('cultivo')}
    FASE ACTUAL: {contexto.get('fase')}
    GDD ACUMULADOS: {contexto.get('gdd')}
    CLIMA ACTUAL: {contexto.get('clima')}
    ALERTAS ACTIVAS: {contexto.get('alertas')}
    
    Responde directamente con la recomendación, sin introducciones.
    """

    if not settings.GEMINI_API_KEY:
        # Simulación si no hay API Key
        return "Fase crítica detectada. Asegure riego uniforme y monitoree presencia de plagas por humedad alta."

    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Error llamando a Gemini: {e}")
        return "Error al conectar con la IA Agronómica. Por favor intente más tarde."
