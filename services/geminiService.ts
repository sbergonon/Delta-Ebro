
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, ItineraryResult, GroundingSource, ItineraryStep, Theme, Transport, Language, NearbyAttraction } from "../types";
import { TRANSLATIONS } from "../constants";

// Robust API Key retrieval function
const getApiKey = (): string => {
  let key = '';

  // 1. Try Vite standard (import.meta.env)
  // We use try-catch to prevent crashes if import.meta is undefined in some environments
  try {
    // @ts-ignore - Ignore TS warning if types aren't set up for Vite
    if (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      // @ts-ignore
      key = import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    // console.debug("Vite env not available");
  }

  // 2. Try process.env (Webpack/Node/System fallback)
  if (!key && typeof process !== 'undefined' && process.env) {
    key = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  }

  return key ? key.trim() : '';
};

const getAiClient = () => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error(
      "[ERROR DE CONFIGURACIÓN] No se ha encontrado la API Key.\n\n" +
      "SOLUCIÓN PARA RENDER:\n" +
      "1. Ve a tu Dashboard en Render > Environment.\n" +
      "2. Asegúrate de que la variable se llame: VITE_GEMINI_API_KEY\n" +
      "3. Asegúrate de que el valor comience por 'AIza...'.\n" +
      "4. IMPORTANTE: Haz un 'Manual Deploy' > 'Clear build cache & deploy' para aplicar los cambios."
    );
  }

  return new GoogleGenAI({ apiKey });
};

export const generateStepImage = async (title: string, description: string): Promise<string | null> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `Generate a high quality, photorealistic travel photography image of: ${title} in Amposta, Spain. The image should be bright, inviting, and suitable for a tourist guide. Context: ${description.slice(0, 200)}.` }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "4:3"
                }
            }
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
             if (part.inlineData) {
                 return `data:image/png;base64,${part.inlineData.data}`;
             }
        }
        return null;
    } catch (error: any) {
        // Suppress 429 Resource Exhausted errors to avoid noise, just return null
        if (error.status === 429 || error.code === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
            console.warn("Image generation skipped: Quota exceeded.");
            return null;
        }
        // Don't log 400 errors if it's just image gen failing, keep UI clean
        if (error.message?.includes('API key')) {
             console.error("API Key Error in Image Gen:", error);
        }
        return null;
    }
};

export const generateStepInstructions = async (title: string, description: string, language: Language): Promise<string[]> => {
    try {
        const ai = getAiClient();
        const langName = language === 'ca' ? 'Catalan' : language === 'es' ? 'Spanish' : 'English';
        const prompt = `Provide a concise, ordered list of 3-6 step-by-step instructions for a tourist to experience: "${title}". 
        Context: "${description}". 
        Location: Amposta/Delta de l'Ebre. 
        Language: ${langName}. 
        Format: Return ONLY the list items, one per line, starting with "- ". Do not include numbering or titles.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.3,
                maxOutputTokens: 300,
            }
        });

        const text = response.text || "";
        return text.split('\n')
                   .map(line => line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '').trim())
                   .filter(line => line.length > 0);

    } catch (error) {
        console.error("Error generating instructions:", error);
        return [];
    }
};

export const getNearbyAttractions = async (location: string, language: Language): Promise<NearbyAttraction[]> => {
    try {
        const ai = getAiClient();
        const langName = language === 'ca' ? 'Catalan' : language === 'es' ? 'Spanish' : 'English';
        
        const prompt = `Find 3 distinct interesting places (museums, landmarks, parks, or highly rated restaurants) strictly within 1000 meters walking distance of '${location}' in Amposta or the Ebro Delta. 
        Do not include '${location}' itself. 
        Language: ${langName}.
        Return strictly a JSON array.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Name of the place" },
                            type: { type: Type.STRING, description: "Category e.g. Restaurant, Park" },
                            distance: { type: Type.STRING, description: "Distance e.g. 300m or 5 min walk" }
                        },
                        required: ["name", "type", "distance"]
                    }
                }
            }
        });

        const jsonText = response.text;
        if (jsonText) {
            return JSON.parse(jsonText) as NearbyAttraction[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching nearby attractions:", error);
        return [];
    }
};

export const generateItinerary = async (prefs: UserPreferences): Promise<ItineraryResult> => {
  const modelId = 'gemini-2.5-flash';
  const t = TRANSLATIONS[prefs.language];

  let themeLabel = t.themes[prefs.theme].label;
  
  if (prefs.theme === Theme.CUSTOM) {
    if (prefs.customThemes && prefs.customThemes.length > 0) {
        const subThemeLabels = prefs.customThemes.map(th => t.themes[th].label).join(", ");
        themeLabel = `ITINERARIO PERSONALIZADO (MIX) que combine elementos de: ${subThemeLabels}. Organiza la ruta mezclando estos temas de forma lógica.`;
    } else {
        themeLabel = "Mix General: Lo mejor de Amposta (Historia, Naturaleza y Gastronomía).";
    }
  }

  const durationLabel = `${prefs.duration} ${prefs.duration === 1 ? t.label_day : t.label_days}`;
  const transportLabel = t.transports[prefs.transport];

  let transportInstruction = "";
  let locationScope = "El itinerario debe centrarse en la ciudad de Amposta y el Delta del Ebro.";
  let langInstruction = `RESPOND IN ${prefs.language === 'ca' ? 'CATALAN' : prefs.language === 'es' ? 'SPANISH' : 'ENGLISH'}.`;

  if (prefs.transport === Transport.RIVER) {
    if (prefs.includeUpriver) {
        transportInstruction = "El usuario desea una experiencia fluvial COMPLETA remontando el río Ebro. OBLIGATORIO: Dedica al menos medio día o un día entero a visitar TORTOSA (Catedral, Castillo de la Suda) o MIRAVET (Castillo Templario, Paso de Barca) llegando en barco o combinando barco/bus si es necesario. IMPRESCINDIBLE: Incluye horarios de salida de barcos desde Amposta, precios aproximados, dirección del embarcadero en Amposta y en destino.";
        locationScope = "El itinerario debe incluir Amposta y expandirse obligatoriamente río arriba hacia Tortosa o Miravet.";
    } else {
        transportInstruction = "El usuario está interesado en transporte fluvial por el Delta. INCLUYE OBLIGATORIAMENTE opciones de cruceros por la desembocadura. IMPRESCINDIBLE: En la descripción de la actividad fluvial, incluye la DIRECCIÓN EXACTA del embarcadero o punto de salida en Amposta.";
    }
  } else if (prefs.transport === Transport.BUS) {
    transportInstruction = "El usuario viaja en Autobús. IMPRESCINDIBLE: Indica claramente la dirección de la Estación de Autobuses de Amposta o las paradas específicas (ubicación de la parada) para llegar a los puntos de interés sugeridos.";
  } else if (prefs.transport === Transport.TRAIN) {
    transportInstruction = "El usuario viaja en TREN. IMPRESCINDIBLE: Ten en cuenta que la estación es 'L'Aldea-Amposta-Tortosa' (a unos km del centro). Incluye información sobre cómo llegar del tren al centro (Bus/Taxi) y coordina los tiempos.";
  } else if (prefs.transport === Transport.BIKE) {
    transportInstruction = "El usuario se mueve en BICICLETA. Prioriza rutas por carriles bici, caminos rurales del Delta (Caminos de Sirga) y la Vía Verde. Sugiere lugares donde aparcar la bici si es necesario.";
  } else if (prefs.transport === Transport.MIX) {
    if (prefs.customTransports && prefs.customTransports.length > 0) {
        const mixLabels = prefs.customTransports.map(tr => t.transports[tr]).join(", ");
        transportInstruction = `El usuario utilizará una COMBINACIÓN de transportes personalizada: ${mixLabels}. Para cada desplazamiento del itinerario, especifica explícitamente cuál de estos medios es el más lógico y eficiente (ej. "Ir a pie al castillo", "Tomar el coche para ir al Delta").`;
    } else {
        transportInstruction = "El usuario utilizará una combinación óptima de transporte (A pie por el centro, coche o taxi para distancias largas). Sugiere la mejor opción logística para cada tramo.";
    }
  } else {
    transportInstruction = `Transporte disponible: ${transportLabel}`;
  }

  let dateContext = "Fecha no especificada. Asume horarios de apertura estándar (primavera/verano).";
  
  if (prefs.startDate) {
      const date = new Date(prefs.startDate);
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const dayName = days[date.getDay()];
      
      dateContext = `
      FECHA EXACTA DE INICIO: ${prefs.startDate} (${dayName}).
      
      LOGÍSTICA TEMPORAL CRÍTICA (OBLIGATORIO):
      1. CALENDARIO REAL: Calcula qué día de la semana cae cada día del itinerario.
      2. CIERRES DE LUNES: Ten en cuenta que el "Museu de les Terres de l'Ebre" y muchos monumentos cierran los LUNES. Si el itinerario incluye un Lunes, programa actividades de naturaleza o exteriores ese día, no museos.
      3. EVENTOS LOCALES: Verifica si la fecha coincide con la "Festa del Mercat a la Plaça" (Mayo), "Festes Majors" (Agosto), "Fira de Mostres" (Diciembre) o jornadas gastronómicas (Carxofa, Arròs). Si coincide, INCLÚYELO como actividad prioritaria.
      `;
  }

  const prompt = `
    Actúa como un guía turístico experto local de Amposta y Terres de l'Ebre (Tarragona, España).
    Crea un itinerario detallado basado en las siguientes preferencias:
    
    - Idioma de respuesta: ${langInstruction}
    - Tema Principal: ${themeLabel}
    - Duración: ${durationLabel}
    - ${dateContext}
    - ${transportInstruction}
    ${prefs.additionalInfo ? `- Notas adicionales del usuario: ${prefs.additionalInfo}` : ''}

    REQUISITOS IMPORTANTES:
    1. Alcance Geográfico: ${locationScope}
    2. Usa nombres oficiales para lugares.
    3. Sugiere horarios y precios aproximados.
    
    FORMATO DE RESPUESTA OBLIGATORIO:
    Usa EXACTAMENTE este formato para cada paso:

    <<<STEP>>>
    DAY: [Número de día]
    TIME: [Momento del día]
    TITLE: [Nombre corto de la actividad]
    IMAGE: [Dejar vacío]
    DESCRIPTION: [Descripción detallada]
    <<<END_STEP>>>
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [
            { googleSearch: {} }, 
            { googleMaps: {} }
        ],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: 40.7130, // Amposta Latitude
              longitude: 0.5805 // Amposta Longitude
            }
          }
        },
        systemInstruction: `Eres un experto en turismo de las Terres de l'Ebre. ${langInstruction}`,
        temperature: 0.4,
      },
    });

    const text = response.text || "Error generating itinerary.";
    
    const steps: ItineraryStep[] = [];
    const stepRegex = /<<<STEP>>>([\s\S]*?)<<<END_STEP>>>/g;
    let match;
    let index = 0;

    while ((match = stepRegex.exec(text)) !== null) {
        const content = match[1];
        const dayMatch = content.match(/DAY:\s*(.*)/);
        const timeMatch = content.match(/TIME:\s*(.*)/);
        const titleMatch = content.match(/TITLE:\s*(.*)/);
        const descParts = content.split(/DESCRIPTION:\s*/);
        const description = descParts.length > 1 ? descParts[1].trim() : "";

        if (titleMatch && description) {
            steps.push({
                id: `step-${index++}`,
                day: dayMatch ? dayMatch[1].trim() : "1",
                timeOfDay: timeMatch ? timeMatch[1].trim() : "Varios",
                title: titleMatch ? titleMatch[1].trim() : "Actividad",
                imageUrl: undefined,
                description: description
            });
        }
    }

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) sources.push({ title: chunk.web.title, url: chunk.web.uri, type: 'web' });
        if (chunk.maps) sources.push({ title: chunk.maps.title, url: chunk.maps.uri, type: 'map' });
      });
    }

    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.url === v.url)) === i);

    return { markdown: text, steps: steps, sources: uniqueSources };

  } catch (error: any) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
};
