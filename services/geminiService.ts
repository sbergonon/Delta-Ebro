
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, ItineraryResult, GroundingSource, ItineraryStep, Theme, Transport, Language, NearbyAttraction, AccommodationMode } from "../types";
import { TRANSLATIONS } from "../constants";

const getAiClient = () => {
  let apiKey = "";

  // 1. Try process.env (Node/System standard, often polyfilled)
  try {
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY || process.env.VITE_API_KEY || "";
    }
  } catch (e) {
    // Ignore reference errors
  }

  // 2. Try import.meta.env (Vite standard)
  if (!apiKey || apiKey === 'undefined') {
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
      }
    } catch (e) {
      // Ignore reference errors
    }
  }

  // Clean up potential string "undefined"
  if (apiKey === 'undefined') apiKey = "";

  if (!apiKey || apiKey.trim() === '') {
      console.error("CRITICAL ERROR: API Key is missing in both process.env and import.meta.env");
      throw new Error("Configuration Error: API Key missing. Please set 'VITE_API_KEY' in your Render Environment Variables.");
  }

  // Debug log to verify key is loaded (masked)
  console.log(`Gemini Client Initialized. Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

  return new GoogleGenAI({ apiKey });
};

// Helper function to retry operations on 503 (Overloaded) errors
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, initialDelay = 2000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      const isOverloaded = error.status === 503 || error.code === 503 || error.message?.includes('503') || error.message?.includes('overloaded');
      
      if (isOverloaded && i < retries - 1) {
        const delay = initialDelay * Math.pow(2, i); // Exponential backoff: 2s, 4s, 8s...
        console.warn(`Gemini Model Overloaded (503). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If it's the last attempt or not a 503, throw properly formatted error
      if (isOverloaded) {
         throw new Error("El servidor de IA está saturado en este momento (Error 503). Por favor, inténtalo de nuevo en unos segundos.");
      }
      
      // Handle API Key errors specifically
      // Check for 400 Bad Request which often means invalid key, OR 403 which means permission denied
      if ((error.status === 400 || error.status === 403) && (error.message?.includes('API key') || error.message?.includes('permission') || error.message?.includes('valid'))) {
          console.error("API Key Error Details:", error);
          throw new Error("Error de API Key (400/403): La clave no es válida o ha sido rechazada por Google. Verifica que la variable 'VITE_API_KEY' en Render sea correcta y no tenga espacios extra.");
      }

      throw error;
    }
  }
  throw new Error("Service unavailable");
}

export const generateStepImage = async (title: string, description: string): Promise<string | null> => {
    // 1. Try Gemini Image Generation first (High Quality)
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `Generate a high quality, photorealistic travel photography image of: ${title} in Terres de l'Ebre / Amposta / Tortosa / Miravet, Spain. The image should be bright, inviting, and suitable for a tourist guide. Context: ${description.slice(0, 200)}.` }]
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
    } catch (error: any) {
        // Log but don't stop, we will fallback
        const isQuota = error.status === 429 || error.code === 429 || error.message?.includes('429');
        const isOverloaded = error.status === 503 || error.code === 503;
        
        if (isQuota) console.warn("Gemini Image Quota Exceeded. Switching to fallback.");
        else if (isOverloaded) console.warn("Gemini Image Model Overloaded. Switching to fallback.");
        else console.warn("Gemini Image Generation Failed:", error.message);
    }

    // 2. Fallback Strategy: Use Pollinations.ai (Free, No Auth) to ensure an image always appears
    try {
        console.log(`Using fallback image generator for: ${title}`);
        const prompt = encodeURIComponent(`${title} landmark in Ebro Delta Spain sunny bright photorealistic tourism`);
        const seed = Math.floor(Math.random() * 1000);
        return `https://pollinations.ai/p/${prompt}?width=800&height=600&nologo=true&seed=${seed}&model=flux`;
    } catch (e) {
        console.error("Fallback image generation failed", e);
        return null;
    }
};

export const generateStepInstructions = async (title: string, description: string, language: Language): Promise<string[]> => {
    return retryOperation(async () => {
        try {
            const ai = getAiClient();
            const langName = language === 'ca' ? 'Catalan' : language === 'es' ? 'Spanish' : 'English';
            const prompt = `Provide a concise, ordered list of 3-6 step-by-step instructions for a tourist to experience: "${title}". 
            Context: "${description}". 
            Location: Terres de l'Ebre (Amposta, Tortosa, Delta). 
            Language: ${langName}. 
            Format: Return ONLY the list items, one per line, starting with "- ". Do not include numbering or titles.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.3,
                }
            });

            const text = response.text || "";
            return text.split('\n')
                    .map(line => line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '').trim())
                    .filter(line => line.length > 0);

        } catch (error) {
            console.error("Error generating instructions:", error);
            throw error;
        }
    });
};

export const getNearbyAttractions = async (location: string, language: Language): Promise<NearbyAttraction[]> => {
    return retryOperation(async () => {
        try {
            const ai = getAiClient();
            const langName = language === 'ca' ? 'Catalan' : language === 'es' ? 'Spanish' : 'English';
            
            // Note: Removed googleMaps tool because it cannot be combined with responseSchema.
            // Using the model's knowledge which is sufficient for major POIs in these towns.
            const prompt = `You are a local expert guide for Terres de l'Ebre (South Catalonia).
            Identify exactly 3 distinct, real, and interesting points of interest (museums, landmarks, historical sites, or top-rated restaurants) strictly within a 1km (10-15 min walk) radius of: "${location}".
            
            Rules:
            1. The places MUST be real and currently existing in Amposta, Tortosa, Miravet, or the Ebro Delta.
            2. Do NOT include "${location}" itself.
            3. Provide the name, a short category type (e.g. "Museum", "Tapas Bar"), and estimated walking distance/time.
            4. Language: ${langName}.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                type: { type: Type.STRING },
                                distance: { type: Type.STRING }
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
            throw error;
        }
    });
};

export const generateItinerary = async (prefs: UserPreferences): Promise<ItineraryResult> => {
  return retryOperation(async () => {
      const modelId = 'gemini-2.5-flash';
      const t = TRANSLATIONS[prefs.language];

      let themeLabel = t.themes[prefs.theme].label;
      
      if (prefs.theme === Theme.CUSTOM) {
        if (prefs.customThemes && prefs.customThemes.length > 0) {
            const subThemeLabels = prefs.customThemes.map(th => t.themes[th].label).join(", ");
            themeLabel = `ITINERARIO PERSONALIZADO (MIX) que combine elementos de: ${subThemeLabels}. Organiza la ruta mezclando estos temas de forma lógica.`;
        } else {
            themeLabel = "Mix General: Lo mejor de Terres de l'Ebre (Historia, Naturaleza y Gastronomía).";
        }
      }

      const durationLabel = `${prefs.duration} ${prefs.duration === 1 ? t.label_day : t.label_days}`;
      const transportLabel = t.transports[prefs.transport];

      let transportInstruction = "";
      let locationScope = "El itinerario debe centrarse en la ciudad de Amposta, Tortosa, Miravet y el Delta del Ebro.";
      let langInstruction = `RESPOND IN ${prefs.language === 'ca' ? 'CATALAN' : prefs.language === 'es' ? 'SPANISH' : 'ENGLISH'}.`;

      // ACCOMMODATION LOGIC
      let accommodationInstruction = "";
      if (prefs.accommodationMode === AccommodationMode.BASE) {
          const base = prefs.baseLocation || "Amposta";
          accommodationInstruction = `
          ESTRATEGIA DE ALOJAMIENTO (MUY IMPORTANTE): CAMPO BASE EN ${base}.
          1. El usuario duerme TODAS las noches en ${base}.
          2. Cada día debe empezar saliendo de ${base} y terminar regresando a ${base}.
          3. NO sugieras hacer "check-in" o dormir en hoteles de otros pueblos (Tortosa, Miravet, etc).
          4. Al final de la tarde, incluye siempre el trayecto de vuelta a ${base}.
          `;
      } else {
          accommodationInstruction = `
          ESTRATEGIA DE ALOJAMIENTO: RUTA ITINERANTE.
          El usuario puede dormir en distintos pueblos a medida que avanza la ruta. Sugiere hoteles en el destino final del día.
          `;
      }

      // LOGISTICA DE TRANSPORTE REGIONAL
      if (prefs.transport === Transport.RIVER) {
         transportInstruction = "Transporte Fluvial: Incluye rutas en barco (Miravet, Delta). Para conectar entre pueblos (Amposta-Tortosa), sugiere Barco si existe línea regular, o Bus/Taxi como alternativa para llegar al embarcadero.";
      } else if (prefs.transport === Transport.MIX) {
         if (prefs.customTransports && prefs.customTransports.length > 0) {
             const mixLabels = prefs.customTransports.map(tr => t.transports[tr]).join(", ");
             transportInstruction = `
             LOGÍSTICA DE TRANSPORTE MIXTO:
             El usuario usará estos medios: ${mixLabels}.
             REGLAS CRÍTICAS DE MOVILIDAD ENTRE PUEBLOS:
             1. Si hay que ir de Amposta a Tortosa o l'Aldea: Sugiere BUS (Hife) o TREN (Renfe l'Aldea). No se puede ir andando.
             2. Si hay que ir a Miravet: Sugiere Coche o combinación Tren+Taxi (Móra la Nova).
             3. DENTRO de los cascos urbanos (Tortosa/Amposta): Sugiere ir "A PIE".
             4. Delta: Sugiere "BICICLETA" o Coche/Bus.
             `;
         } else {
             transportInstruction = "Uso combinado de transporte. Sugiere Tren/Bus para moverte entre Amposta y Tortosa, y A PIE dentro de las ciudades.";
         }
      } else if (prefs.transport === Transport.WALKING) {
         transportInstruction = "A PIE: El usuario quiere caminar mucho, pero SI el itinerario cambia de pueblo (ej. Amposta a Tortosa), DEBES sugerir tomar el BUS/TREN para el enlace interurbano, y luego caminar en destino.";
      } else {
         transportInstruction = `Transporte disponible: ${transportLabel}`;
      }

      let dateContext = "Fecha no especificada. Asume horarios de apertura estándar.";
      
      if (prefs.startDate) {
          const startDate = new Date(prefs.startDate);
          const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          
          let scheduleTable = "";
          for (let i = 0; i < prefs.duration; i++) {
              const currentDate = new Date(startDate);
              currentDate.setDate(startDate.getDate() + i);
              const dayName = daysOfWeek[currentDate.getDay()];
              const dateStr = currentDate.toLocaleDateString();
              scheduleTable += `- Día ${i+1}: ${dateStr} es ${dayName}\n`;
          }

          dateContext = `
          FECHA EXACTA DE INICIO: ${prefs.startDate}.
          
          CALENDARIO REAL DE VIAJE:
          ${scheduleTable}

          ⚠️ REGLAS CRÍTICAS DE HORARIOS (SEGÚN EL DÍA DE LA SEMANA):
          1. SI UN DÍA CAE EN LUNES: La mayoría de museos (Catedral Tortosa, Castell Miravet, Museus Amposta) ESTÁN CERRADOS. Programa actividades de exterior (Delta, Murallas, Paseos) ese día.
          2. SI UN DÍA ES DOMINGO TARDE: Muchos sitios cierran a las 14:00 o 15:00.
          3. COMPRUEBA SI ES FESTIVO: Si coincide con festivos nacionales, avisa de posibles cierres especiales.
          4. COMIDAS: En pueblos pequeños (Miravet/Terra Alta), avisar que hay que reservar mesa si es fin de semana.
          `;
      }

      // Logic for user-selected specific Places of Interest (POIs)
      let selectedPoisInstruction = "";
      if (prefs.selectedPOIs && prefs.selectedPOIs.length > 0) {
          const poiList = prefs.selectedPOIs.join(", ");
          selectedPoisInstruction = `
          INSTRUCCIÓN DE PRIORIDAD MÁXIMA (PARADAS OBLIGATORIAS):
          El usuario ha marcado que QUIERE visitar: [${poiList}].
          
          1. ESTRUCTURA EL ITINERARIO ALREDEDOR DE ESTOS PUEBLOS/LUGARES.
          2. Si ha elegido lugares en pueblos diferentes (ej. Amposta y Miravet), dedica un día (o medio) a cada zona y explica cómo ir de uno a otro.
          3. Incluye TODOS los seleccionados.
          `;
      }

      const prompt = `
        Actúa como un guía turístico experto de las "Terres de l'Ebre" (Sur de Cataluña).
        Crea un itinerario detallado basado en las siguientes preferencias:
        
        - Idioma: ${langInstruction}
        - Tema: ${themeLabel}
        - Duración: ${durationLabel}
        - ${dateContext}
        - ${transportInstruction}
        - ${accommodationInstruction}
        ${selectedPoisInstruction}
        ${prefs.additionalInfo ? `- Notas usuario: ${prefs.additionalInfo}` : ''}

        REQUISITOS:
        1. Alcance: ${locationScope}. No te limites solo a Amposta si el usuario pide ver Tortosa o Miravet.
        2. IMPORTANTE: Ten muy en cuenta los días de la semana calculados para evitar recomendar museos cerrados.
        3. Logística: Se realista con los tiempos de desplazamiento entre pueblos.
        
        FORMATO DE RESPUESTA OBLIGATORIO:
        Usa EXACTAMENTE este formato para cada paso:

        <<<STEP>>>
        DAY: [Número de día]
        TIME: [Momento del día]
        TITLE: [Nombre corto de la actividad]
        IMAGE: [Dejar vacío]
        DESCRIPTION: [Descripción detallada. Si es un desplazamiento entre pueblos, indica el medio de transporte recomendado.]
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
                  latitude: 40.8125, // Tortosa Latitude (More central for region)
                  longitude: 0.5216 // Tortosa Longitude
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
  });
};
