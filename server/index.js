import express from 'express';
import cors from 'cors';
import { Ollama } from 'ollama';
import { getWeatherData, getClimateData } from './services/weatherService.js';
import { transformDataForRAG, SYSTEM_PROMPT_RAG } from './services/ragLogic.js';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const ollama = new Ollama({ host: 'http://localhost:11434' });

// Prompt especializado en agronomía peruana (Legacy / Chat Standard)
const SYSTEM_PROMPT = `Eres un agrónomo experto especializado en agricultura peruana, particularmente en la región andina. 

Tu expertise incluye:
- Cultivos andinos: papa, maíz, quinua, habas, kiwicha
- Clima de sierra peruana (3000-4000 msnm)
- Manejo de suelos andinos
- Control de plagas y enfermedades comunes
- Agricultura sostenible y orgánica
- Calendario agrícola andino
- Prácticas tradicionales y modernas

Respondes en español de forma clara, práctica y amigable. Das consejos específicos basados en:
- Altitud del agricultor
- Tipo de cultivo
- Época del año
- Condiciones climáticas

Si preguntan en Quechua, respondes en Quechua.

Cuando des recomendaciones técnicas:
1. Explica el POR QUÉ (científico)
2. Da pasos PRÁCTICOS
3. Menciona alternativas orgánicas cuando sea posible
4. Considera el contexto económico del pequeño agricultor

Eres empático, paciente y educativo.`;

// Endpoint de chat (Standard)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], location = '', altitude = '' } = req.body;

    // Contexto adicional del usuario
    const contextualPrompt = `
${SYSTEM_PROMPT}

Información del agricultor:
- Ubicación: ${location || 'Región andina del Perú'}
- Altitud: ${altitude || '3200 msnm'}

Conversación previa:
${history.map(h => `${h.role === 'user' ? 'Agricultor' : 'Agrónomo'}: ${h.content}`).join('\n')}

Agricultor: ${message}
Agrónomo:`;

    const response = await ollama.chat({
      model: 'llama3.2', // Ensure this model exists in user's Ollama
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message }
      ],
      stream: false
    });

    res.json({
      response: response.message.content,
      success: true
    });

  } catch (error) {
    console.error('Error al comunicarse con Ollama:', error);
    res.status(500).json({
      error: 'Error al procesar la consulta',
      details: error.message,
      success: false
    });
  }
});

// NUEVO: Endpoint RAG para Recomendaciones Climáticas
app.post('/api/recommendation', async (req, res) => {
  try {
    const { location, lat, lon, crop } = req.body;

    // 1. Fetch External Data
    console.log(`📡 Fetching data for ${location} (${lat}, ${lon})...`);
    const weatherData = await getWeatherData(lat, lon);
    const climateData = await getClimateData(lat, lon);

    // 2. Transform Data to Context
    const locationInfo = { name: location, crop: crop };
    const contextData = transformDataForRAG(weatherData, climateData, locationInfo);

    console.log('📝 Context generated:', contextData);

    // 3. Ask Ollama
    const userPrompt = `Necesito una recomendación técnica para mi cultivo de ${crop || 'Papa'}. Basa tu respuesta en los siguientes datos telemétricos.`;

    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_RAG },
        { role: 'user', content: contextData + "\n\n" + userPrompt }
      ],
      stream: false
    });

    res.json({
      success: true,
      data: {
        weather: weatherData,
        climate: climateData,
        recommendation: response.message.content
      }
    });

  } catch (error) {
    console.error('❌ RAG System Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verificar si Ollama está disponible
app.get('/api/health', async (req, res) => {
  try {
    const models = await ollama.list();
    res.json({
      status: 'ok',
      models: models.models.map(m => m.name),
      message: 'Ollama conectado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'No se pudo conectar a Ollama',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`🤖 Conectado a Ollama en http://localhost:11434`);
});
