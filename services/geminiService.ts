
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, ItineraryResult, GroundingSource, ItineraryStep, Theme, Transport, Language, NearbyAttraction, AccommodationMode, Restaurant } from "../types";
import { TRANSLATIONS } from "../constants";

// Safe API Key retrieval that won't crash
export const getApiKeySafe = (): string => {
  let apiKey = "";
  try {
    // Priority 1: process.env (Node/Compat)
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY || process.env.VITE_API_KEY || "";
    }
  } catch (e) {}

  if (!apiKey || apiKey === 'undefined') {
    try {
      // Priority 2: import.meta.env (Vite) - accessed via checking existence first to avoid syntax errors in some runtimes
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
      }
    } catch (e) {}
  }
  return apiKey === 'undefined' ? "" : apiKey;
};

const getAiClient = () => {
  const apiKey = getApiKeySafe();
  if (!apiKey || apiKey.trim() === '') {
      console.error("CRITICAL ERROR: API Key is missing.");
      throw new Error("Configuration Error: API Key missing. Please set 'VITE_API_KEY' in your environment variables.");
  }
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
        const delay = initialDelay * Math.pow(2, i); 
        console.warn(`Gemini Model Overloaded (503). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (isOverloaded) {
         throw new Error("El servidor de IA está saturado (Error 503). Inténtalo de nuevo.");
      }
      
      if ((error.status === 400 || error.status === 403) && (error.message?.includes('API key') || error.message?.includes('permission'))) {
          throw new Error("Error de API Key (400/403): Clave inválida.");
      }

      throw error;
    }
  }
  throw new Error("Service unavailable");
}

export const generateStepImage = async (title: string, description: string): Promise<string | null> => {
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
        // Silent fail for images
    }

    try {
        const prompt = encodeURIComponent(`${title} landmark in Ebro Delta Spain sunny bright photorealistic tourism`);
        const seed = Math.floor(Math.random() * 1000);
        return `https://pollinations.ai/p/${prompt}?width=800&height=600&nologo=true&seed=${seed}&model=flux`;
    } catch (e) {
        return null;
    }
};

export const generateStepInstructions = async (title: string, description: string, language: Language): Promise<string[]> => {
    return retryOperation(async () => {
        const ai = getAiClient();
        const langName = language === 'ca' ? 'Catalan' : language === 'es' ? 'Spanish' : 'English';
        const prompt = `Provide a concise list of 3-6 step-by-step instructions for: "${title}". Context: "${description}". Location: Terres de l'Ebre. Language: ${langName}. Format: List items only, starting with "- ".`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.3 }
        });

        const text = response.text || "";
        return text.split('\n')
                .map(line => line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '').trim())
                .filter(line => line.length > 0);
    });
};

export const getNearbyAttractions = async (location: string, language: Language): Promise<NearbyAttraction[]> => {
    return retryOperation(async () => {
        const ai = getAiClient();
        const langName = language === 'ca' ? 'Catalan' : language === 'es' ? 'Spanish' : 'English';
        
        const prompt = `Identify 3 distinct, real points of interest strictly within 1km of: "${location}" in Terres de l'Ebre.
        Rules: Return JSON array. Fields: name, type, distance. Language: ${langName}.`;

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
        if (jsonText) return JSON.parse(jsonText) as NearbyAttraction[];
        return [];
    });
};

export const getRestaurantsByCoordinates = async (lat: number, lng: number, language: Language): Promise<Restaurant[]> => {
    return retryOperation(async () => {
        const ai = getAiClient();
        const langName = language === 'ca' ? 'Catalan' : language === 'es' ? 'Spanish' : 'English';
        
        const prompt = `I am at ${lat}, ${lng} in Terres de l'Ebre. Recommend 4 restaurants nearby. Return JSON array with name, cuisine, rating, address. Language: ${langName}.`;

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
                            name: { type: Type.STRING },
                            cuisine: { type: Type.STRING },
                            rating: { type: Type.STRING },
                            address: { type: Type.STRING }
                        },
                        required: ["name", "cuisine", "rating", "address"]
                    }
                }
            }
        });
        
        const jsonText = response.text;
        if (jsonText) return JSON.parse(jsonText) as Restaurant[];
        return [];
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
            themeLabel = `Mix Personalizado: ${subThemeLabels}`;
        } else {
            themeLabel = "Mix General Terres de l'Ebre";
        }
      }

      const durationLabel = `${prefs.duration} ${prefs.duration === 1 ? t.label_day : t.label_days}`;
      const transportLabel = t.transports[prefs.transport];

      let accommodationInstruction = "";
      if (prefs.accommodationMode === AccommodationMode.BASE) {
          const base = prefs.baseLocation || "Amposta";
          accommodationInstruction = `ALOJAMIENTO BASE FIJO: ${base}. Cada día empieza y termina en ${base}.`;
      } else {
          accommodationInstruction = `RUTA ITINERANTE: Dormir en distintos pueblos.`;
      }

      let dateContext = prefs.startDate 
        ? `FECHA INICIO: ${prefs.startDate}. Ten en cuenta días de cierre (Lunes museos).` 
        : "Fecha no especificada.";

      let selectedPoisInstruction = "";
      if (prefs.selectedPOIs && prefs.selectedPOIs.length > 0) {
          selectedPoisInstruction = `PRIORIDAD MÁXIMA: Visitar OBLIGATORIAMENTE: ${prefs.selectedPOIs.join(", ")}.`;
      }

      const prompt = `
        Actúa como guía turístico de Terres de l'Ebre.
        Itinerario:
        - Idioma respuesta: ${prefs.language === 'ca' ? 'CATALAN' : prefs.language === 'es' ? 'SPANISH' : 'ENGLISH'}
        - Tema: ${themeLabel}
        - Duración: ${durationLabel}
        - ${dateContext}
        - Transporte: ${transportLabel} (Si es TAXI, asume coche privado rápido pero caro. Si es MIX, combina Bus/Tren y Pie).
        - ${accommodationInstruction}
        - ${selectedPoisInstruction}
        ${prefs.additionalInfo ? `- Notas: "${prefs.additionalInfo}"` : ''}

        FORMATO OBLIGATORIO (NO MARKDOWN PURO, USA TAGS):
        Para cada paso usa estrictamente este formato con los tags:
        <<<STEP>>>
        DAY: [Día numérico]
        TIME: [Hora aproximada]
        TITLE: [Título corto de la actividad]
        DESCRIPTION: [Descripción detallada, incluye logística]
        <<<END_STEP>>>
      `;

      const ai = getAiClient();
      const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }, { googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: { latitude: 40.7096, longitude: 0.5786 } } }, // Delta Coordinates
            systemInstruction: `Eres un guía experto en el Delta del Ebro, Amposta y Tortosa.`,
            temperature: 0.4,
          },
      });

      const text = response.text || "";
      const steps: ItineraryStep[] = [];
      
      // PARSING ROBUSTO
      try {
          // Improved Regex to be case insensitive and robust across lines
          const stepRegex = /<<<STEP>>>([\s\S]*?)<<<END_STEP>>>/gi;
          let match;
          let index = 0;

          while ((match = stepRegex.exec(text)) !== null) {
              const content = match[1];
              if (!content) continue;

              const dayMatch = content.match(/DAY:\s*(.*?)(?:\n|$)/i);
              const timeMatch = content.match(/TIME:\s*(.*?)(?:\n|$)/i);
              const titleMatch = content.match(/TITLE:\s*(.*?)(?:\n|$)/i);
              
              // Robust description extraction
              let description = "";
              const descSplit = content.split(/DESCRIPTION:\s*/i);
              if (descSplit.length > 1) {
                  description = descSplit[1].trim();
              }

              if (titleMatch && description) {
                  steps.push({
                      id: `step-${index++}`,
                      day: dayMatch ? dayMatch[1].trim() : "1",
                      timeOfDay: timeMatch ? timeMatch[1].trim() : "",
                      title: titleMatch ? titleMatch[1].trim() : "Activity",
                      description: description,
                      imageUrl: undefined
                  });
              }
          }

          // FALLBACK: If Regex failed completely (0 steps) but we have text, try a simpler parse or single chunk
          if (steps.length === 0 && text.length > 100) {
               console.warn("Regex parsing failed, attempting fallback parsing.");
               // Split by "Day" if possible, otherwise treat as one big block
               if (text.toLowerCase().includes('day 1') || text.toLowerCase().includes('dia 1')) {
                   // Simple Day splitter fallback
                   const days = text.split(/(?=Day \d|Dia \d)/i).filter(d => d.length > 20);
                   days.forEach((dayText, i) => {
                       steps.push({
                           id: `fallback-${i}`,
                           day: `${i + 1}`,
                           timeOfDay: "Morning",
                           title: `Ruta del Dia ${i + 1}`,
                           description: dayText.trim(),
                           imageUrl: undefined
                       });
                   });
               }
          }
      } catch (e) {
          console.error("Parsing error", e);
          // Don't crash, return empty steps, ResultDisplay will handle it
      }

      const sources: GroundingSource[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
          chunks.forEach((chunk: any) => {
            if (chunk.web) sources.push({ title: chunk.web.title, url: chunk.web.uri, type: 'web' });
            if (chunk.maps) sources.push({ title: chunk.maps.title, url: chunk.maps.uri, type: 'map' });
          });
      }

      return { markdown: text, steps: steps, sources: sources };
  });
};
