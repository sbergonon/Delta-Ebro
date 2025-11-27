
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ItineraryStep, Transport, Theme, Language, NearbyAttraction } from '../types';
import { THEME_ICONS, TRANSLATIONS } from '../constants';

interface ItineraryStepCardProps {
  step: ItineraryStep;
  index: number;
  totalSteps: number;
  transport: Transport;
  theme: Theme;
  language: Language;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdateNotes: (notes: string) => void;
  onGenerateImage?: (stepId: string) => Promise<void>;
  onGenerateInstructions?: (stepId: string) => Promise<void>;
  onViewBooking: () => void;
  onFetchNearby?: () => void;
  isSpecialEvent?: boolean;
  hasDirectBooking?: boolean;
  userRating?: number;
  onRate?: (rating: number) => void;
}

const THEME_GRADIENTS: Record<Theme, string> = {
  [Theme.HISTORICAL]: 'bg-gradient-to-br from-amber-100 via-stone-200 to-orange-100',
  [Theme.CIVIL_WAR]: 'bg-gradient-to-br from-stone-300 via-slate-300 to-stone-400',
  [Theme.GEOLOGICAL]: 'bg-gradient-to-br from-yellow-100 via-stone-200 to-amber-100',
  [Theme.NATURE]: 'bg-gradient-to-br from-emerald-100 via-teal-100 to-green-200',
  [Theme.GASTRONOMIC]: 'bg-gradient-to-br from-orange-100 via-red-100 to-yellow-100',
  [Theme.CUSTOM]: 'bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100',
};

// Heuristic to detect specific themes within steps (useful for Mixed/Custom itineraries)
const getEffectiveTheme = (step: ItineraryStep, globalTheme: Theme): Theme => {
  const text = (step.title + ' ' + step.description).toLowerCase();
  
  if (/(arròs|arroz|paella|fideuà|marisc|restaurant|gastro|tapa|vermut|dinar|sopar|comida|cena|tasting|degustaci)/.test(text)) return Theme.GASTRONOMIC;
  if (/(búnquer|trinxera|trinchera|refugi|guerra|batalla|front|bombardeig|civil war)/.test(text)) return Theme.CIVIL_WAR;
  if (/(roc|geol|sediment|pedra|formaci|cova|rock|geology)/.test(text)) return Theme.GEOLOGICAL;
  if (/(ocell|au |bird|flamenc|llacuna|bassa|platja|muntanya|riu|natura|delta|parc natural|encanyissada|tancada)/.test(text)) return Theme.NATURE;
  if (/(castell|torre|església|iglesia|catedral|museu|hist|romà|iber|castle|church)/.test(text)) return Theme.HISTORICAL;

  return globalTheme;
};

// Helper to clean title for Maps search queries
const cleanTitleForSearch = (title: string) => {
    // Common tourism verbs in EN, ES, CA to strip for cleaner map searches
    const verbs = [
        "Visit", "Tour", "Discover", "Explore", "Walk to", "Check-in at", "See", "View",
        "Visita", "Visitar", "Ver", "Descubrir", "Explorar", "Caminar a", "Paseo por", "Ir a", "Ruta por", "Excursión a",
        "Veure", "Descobrir", "Passeig per", "Anar a", "Ruta per", "Excursió a"
    ];
    const verbRegex = new RegExp(`^(${verbs.join('|')}) `, 'i');
    
    return title
        .replace(verbRegex, '') 
        .replace(/[:()].*$/, '') // Remove subtitles in parens/after colon
        .trim();
};

const ItineraryStepCard: React.FC<ItineraryStepCardProps> = ({ 
  step, 
  index, 
  totalSteps,
  transport,
  theme,
  language,
  onMoveUp, 
  onMoveDown,
  onUpdateNotes,
  onGenerateImage,
  onGenerateInstructions,
  onViewBooking,
  onFetchNearby,
  isSpecialEvent,
  hasDirectBooking,
  userRating,
  onRate
}) => {
  const [imgError, setImgError] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [tempNote, setTempNote] = useState(step.userNotes || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false);
  const [areInstructionsOpen, setAreInstructionsOpen] = useState(false);
  const [areNearbyOpen, setAreNearbyOpen] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = TRANSLATIONS[language];

  // Reset image error state when image URL changes
  useEffect(() => {
      setImgError(false);
  }, [step.imageUrl]);

  // Reset loading states when step data updates
  useEffect(() => {
      if (step.detailedInstructions) setIsGeneratingInstructions(false);
      if (step.nearbyAttractions) setIsLoadingNearby(false);
  }, [step.detailedInstructions, step.nearbyAttractions]);

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${step.title} Amposta hours and prices`)}`;

  let travelMode = 'driving';
  switch (transport) {
    case Transport.WALKING:
      travelMode = 'walking';
      break;
    case Transport.BUS:
    case Transport.TRAIN:
    case Transport.MIX: // Mixed transport often implies public transit or complex routing
      travelMode = 'transit';
      break;
    case Transport.BIKE:
      travelMode = 'bicycling';
      break;
    case Transport.RIVER:
    case Transport.CAR:
      travelMode = 'driving';
      break;
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${step.title}, Tarragona`)}&travelmode=${travelMode}`;

  const hasImage = step.imageUrl && !imgError;
  const effectiveTheme = getEffectiveTheme(step, theme);
  const placeholderGradient = THEME_GRADIENTS[effectiveTheme] || THEME_GRADIENTS[Theme.CUSTOM];
  const placeholderIcon = THEME_ICONS[effectiveTheme] || '🗺️';
  
  // Heuristic for "Bookable" steps
  const isBookable = (() => {
    const title = step.title.toLowerCase();
    const desc = step.description.toLowerCase();

    // Explicit exclusions
    if (title.includes('check-in') || title.includes('check-out') || title.includes('esmorzar') || title.includes('desayuno') || title.includes('breakfast')) return false;

    // Strong positive signals for attractions, restaurants, and accommodations
    const keywords = [
        'museu', 'museum', 'castell', 'castle', 'castillo', 'centre', 'centro', 'center', 'exposic',
        'restaurant', 'sopar', 'cena', 'dinner', 'dinar', 'almuerzo', 'lunch',
        'hotel', 'hostal', 'apartament', 'casa rural', 'allotjament', 'alojamiento', 'camping',
        'creuer', 'crucero', 'cruise', 'barca', 'kayak', 'lloguer', 'alquiler', 'rent',
        'tour', 'guiad', 'guided', 'visita',
        'entrada', 'ticket', 'preu', 'price', '€',
        'parc', 'parque', 'park', 'jardí', 'jardin', 'garden',
        'activitat', 'actividad', 'activity', 'món natura', 'mon natura'
    ];

    if (keywords.some(k => title.includes(k) || desc.includes(k))) return true;

    // If we have a direct booking link (detected in parent), it is definitely bookable
    if (hasDirectBooking) return true;

    return false;
  })();

  const handleSaveNote = () => {
    onUpdateNotes(tempNote);
    setIsNoteModalOpen(false);
  };

  const handleCancelNote = () => {
    setTempNote(step.userNotes || '');
    setIsNoteModalOpen(false);
  };

  const openNoteModal = () => {
    setTempNote(step.userNotes || '');
    setIsNoteModalOpen(true);
  };

  const handleGenerateClick = async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!onGenerateImage || isGenerating) return;
      setIsGenerating(true);
      await onGenerateImage(step.id);
      setIsGenerating(false);
  };

  const handleInstructionsClick = async () => {
      if (step.detailedInstructions) {
          setAreInstructionsOpen(!areInstructionsOpen);
          return;
      }
      
      if (!onGenerateInstructions || isGeneratingInstructions) return;
      
      setIsGeneratingInstructions(true);
      setAreInstructionsOpen(true); // Open section to show loading state
      await onGenerateInstructions(step.id);
      setIsGeneratingInstructions(false);
  };

  const handleNearbyClick = () => {
      if (step.nearbyAttractions && step.nearbyAttractions.length > 0) {
          setAreNearbyOpen(!areNearbyOpen);
          return;
      }

      if (!onFetchNearby || isLoadingNearby) return;

      setIsLoadingNearby(true);
      setAreNearbyOpen(true);
      onFetchNearby();
  };

  const handleCopy = async () => {
    const text = `${step.title}\n\n${step.description}`;
    try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (e) {
        console.error("Copy failed", e);
    }
  };

  const containerClasses = isSpecialEvent 
    ? "bg-white rounded-xl border-2 border-fuchsia-400 ring-4 ring-fuchsia-50 shadow-lg shadow-fuchsia-100/50 hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col md:flex-row group h-full md:min-h-[320px] relative z-10"
    : "bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col md:flex-row group h-full md:min-h-[320px]";

  // Only show button if identified as bookable or if we found a direct booking link
  const showBookingBtn = isBookable || hasDirectBooking;

  return (
    <>
      <div className={containerClasses}>
        
        {/* Time/Day Indicator */}
        <div className="bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4 md:w-32 flex flex-row md:flex-col items-center md:justify-center justify-between gap-2 text-center shrink-0">
          <div className="flex flex-col">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.results.day}</span>
             <span className="text-2xl font-black text-slate-700">{step.day}</span>
          </div>
          <div className="h-px w-8 bg-slate-300 hidden md:block"></div>
          <span className="text-sm font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
            {step.timeOfDay}
          </span>
        </div>

        {/* Image Section */}
        <div className={`relative h-72 md:h-auto md:w-5/12 lg:w-2/5 shrink-0 overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 ${!hasImage ? placeholderGradient : 'bg-slate-100'}`}>
            {hasImage ? (
                <div className="w-full h-full relative group-hover:scale-[1.02] transition-transform duration-700 ease-out">
                  <img 
                      src={step.imageUrl} 
                      alt={step.title}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setImgError(true);
                        if (onGenerateImage && step.imageUrl && !step.imageUrl.startsWith('data:')) {
                            onGenerateImage(step.id);
                        }
                      }}
                      loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
            ) : (
                <div 
                  onClick={!isGenerating && onGenerateImage ? handleGenerateClick : undefined}
                  className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden p-8 group/placeholder transition-colors ${onGenerateImage ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                >
                   <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/40 rounded-full blur-2xl"></div>
                   <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-black/5 rounded-full blur-2xl"></div>
                   
                   <span className="relative z-10 text-7xl md:text-8xl lg:text-9xl filter drop-shadow-md transform group-hover/placeholder:scale-110 transition-transform duration-500 select-none opacity-90" aria-hidden="true">
                     {placeholderIcon}
                   </span>

                   {onGenerateImage && (
                       <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px] opacity-0 group-hover/placeholder:opacity-100 transition-all duration-300 z-20">
                           <button 
                             onClick={(e) => handleGenerateClick(e)}
                             disabled={isGenerating}
                             className="bg-white text-teal-700 hover:text-teal-800 hover:scale-105 transform transition-all shadow-xl rounded-full px-5 py-3 font-bold text-sm flex items-center gap-2 border border-teal-100"
                           >
                             {isGenerating ? (
                                 <>
                                   <svg className="animate-spin h-4 w-4 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                   {t.results.generating_image}
                                 </>
                             ) : (
                                 <>
                                   <span>✨</span>
                                   {t.results.generate_image_btn}
                                 </>
                             )}
                           </button>
                       </div>
                   )}
                </div>
            )}
        </div>

        {/* Content */}
        <div className="p-6 flex-grow min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <h3 className="text-xl font-bold text-stone-800 leading-tight group-hover:text-teal-700 transition-colors">
                {step.title}
              </h3>
              {isSpecialEvent && (
                <span className="shrink-0 inline-flex items-center gap-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                  <span>🎉</span> {t.results.special_event}
                </span>
              )}
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1 mb-3" title="Rate this experience">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRate && onRate(star);
                  }}
                  className={`text-xl focus:outline-none transition-all duration-200 transform hover:scale-110 ${
                    star <= (userRating || 0) 
                      ? 'text-amber-400 drop-shadow-sm' 
                      : 'text-slate-200 hover:text-amber-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            
            <div className="text-stone-600 text-sm leading-relaxed prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                    p: ({node, ...props}) => <p className="mb-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="" {...props} />,
                    strong: ({node, ...props}) => <span className="font-semibold text-teal-700" {...props} />,
                }}
              >
                {step.description}
              </ReactMarkdown>
            </div>

            {/* Detailed Instructions Section */}
            {areInstructionsOpen && (
                <div className="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-lg animate-fade-in text-sm text-stone-700">
                    <h4 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        {t.results.instructions_title}
                    </h4>
                    {isGeneratingInstructions ? (
                        <div className="flex items-center gap-2 text-teal-600 italic">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            {t.results.loading_instructions}
                        </div>
                    ) : (
                        step.detailedInstructions && (
                            <ul className="list-decimal pl-5 space-y-1">
                                {step.detailedInstructions.map((instruction, i) => (
                                    <li key={i}>{instruction}</li>
                                ))}
                            </ul>
                        )
                    )}
                </div>
            )}

            {/* Nearby Attractions Section */}
            {areNearbyOpen && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg animate-fade-in text-sm text-stone-700">
                    <h4 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {t.results.nearby_title}
                    </h4>
                    {isLoadingNearby ? (
                        <div className="flex items-center gap-2 text-indigo-600 italic">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            {t.results.loading_nearby}
                        </div>
                    ) : (
                        step.nearbyAttractions && step.nearbyAttractions.length > 0 ? (
                            <ul className="space-y-2">
                                {step.nearbyAttractions.map((attraction, i) => (
                                    <li key={i} className="flex flex-col bg-white p-2 rounded border border-indigo-100">
                                        <span className="font-semibold text-indigo-900">{attraction.name}</span>
                                        <div className="flex justify-between text-xs text-indigo-600 mt-1">
                                            <span>{attraction.type}</span>
                                            <span>📍 {attraction.distance}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="italic text-indigo-600">{t.results.no_nearby_found}</p>
                        )
                    )}
                </div>
            )}
            
            {/* Display user notes if present */}
            {step.userNotes && (
               <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-stone-700 relative animate-fade-in">
                  <span className="block text-xs font-bold text-yellow-700 uppercase mb-1">{t.results.your_notes_label}</span>
                  <div className="whitespace-pre-wrap">{step.userNotes}</div>
                  <button onClick={openNoteModal} className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800 p-1">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </button>
               </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-start print:hidden">
              <a 
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-teal-600 transition-colors bg-slate-50 hover:bg-teal-50 px-3 py-2 rounded-lg border border-transparent hover:border-teal-100"
              >
                <svg className="w-4 h-4 text-slate-400 group-hover/btn:text-teal-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                {t.results.verify_btn}
              </a>

              <a 
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50 px-3 py-2 rounded-lg border border-transparent hover:border-blue-100"
              >
                <svg className="w-4 h-4 text-slate-400 group-hover/btn:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                </svg>
                {t.results.directions_btn}
              </a>

              {(transport === Transport.BUS || transport === Transport.RIVER) && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cleanTitleForSearch(step.title)} Amposta ${transport === Transport.BUS ? 'bus stop' : 'river pier'}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 px-3 py-2 rounded-lg border border-transparent hover:border-indigo-100"
                  title={`Find the nearest ${transport === Transport.BUS ? 'bus stop' : 'river pier'} for ${step.title}`}
                >
                  <svg className="w-4 h-4 text-slate-400 group-hover/btn:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {transport === Transport.BUS ? t.results.check_bus_stop : t.results.check_river_pier}
                </a>
              )}
              
              {showBookingBtn && (
                <button 
                  onClick={onViewBooking}
                  className={`group/btn flex items-center gap-2 text-xs font-medium transition-all px-3 py-2 rounded-lg border ${
                     hasDirectBooking 
                     ? "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-transparent shadow-md transform hover:scale-105" 
                     : "bg-teal-50 hover:bg-teal-100 border-teal-100 hover:border-teal-200 text-teal-700"
                  }`}
                >
                  {hasDirectBooking ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                  ) : (
                      <svg className="w-4 h-4 text-teal-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                  )}
                  {t.results.view_booking_btn}
                </button>
              )}

              {onGenerateInstructions && (
                  <button
                    onClick={handleInstructionsClick}
                    className={`group/btn flex items-center gap-2 text-xs font-medium transition-colors px-3 py-2 rounded-lg border ${
                        areInstructionsOpen
                        ? "bg-teal-50 border-teal-200 text-teal-800"
                        : "bg-slate-50 hover:bg-teal-50 border-transparent hover:border-teal-100 text-slate-500 hover:text-teal-600"
                    }`}
                  >
                    <svg className={`w-4 h-4 transition-colors ${areInstructionsOpen ? 'text-teal-600' : 'text-slate-400 group-hover/btn:text-teal-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    {t.results.step_by_step_btn}
                  </button>
              )}

              {onFetchNearby && (
                  <button
                    onClick={handleNearbyClick}
                    className={`group/btn flex items-center gap-2 text-xs font-medium transition-colors px-3 py-2 rounded-lg border ${
                        areNearbyOpen
                        ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                        : "bg-slate-50 hover:bg-indigo-50 border-transparent hover:border-indigo-100 text-slate-500 hover:text-indigo-600"
                    }`}
                  >
                    <svg className={`w-4 h-4 transition-colors ${areNearbyOpen ? 'text-indigo-600' : 'text-slate-400 group-hover/btn:text-indigo-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {t.results.nearby_attractions_btn}
                  </button>
              )}

              <button 
                onClick={handleCopy}
                className="group/btn flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-teal-600 transition-colors bg-slate-50 hover:bg-teal-50 px-3 py-2 rounded-lg border border-transparent hover:border-teal-100"
                title={t.results.copy_step}
              >
                 {copied ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span className="text-teal-600">{t.results.copied}</span>
                    </>
                 ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        {t.results.copy_step}
                    </>
                 )}
              </button>

              <button 
                onClick={openNoteModal}
                className="group/btn flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-amber-600 transition-colors bg-slate-50 hover:bg-amber-50 px-3 py-2 rounded-lg border border-transparent hover:border-amber-100"
              >
                <svg className="w-4 h-4 text-slate-400 group-hover/btn:text-amber-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                {step.userNotes ? t.results.edit_note_btn : t.results.add_note_btn}
              </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-2 flex md:flex-col items-center justify-center gap-2 shrink-0 print:hidden">
          <button 
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-500 hover:text-teal-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button 
            onClick={onMoveDown}
            disabled={index === totalSteps - 1}
            className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-500 hover:text-teal-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>
      </div>

      {/* Note Edit Modal */}
      {isNoteModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in print:hidden">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-stone-800">{step.userNotes ? t.results.edit_note_btn : t.results.add_note_btn}</h3>
                  <button onClick={handleCancelNote} className="text-slate-400 hover:text-slate-600">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
               </div>
               <div className="p-4">
                  <div className="mb-2 text-sm text-stone-500 font-medium">{step.title}</div>
                  <textarea 
                    value={tempNote}
                    onChange={(e) => setTempNote(e.target.value)}
                    placeholder={t.results.note_placeholder}
                    className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-stone-700"
                    autoFocus
                  />
               </div>
               <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button 
                    onClick={handleCancelNote}
                    className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
                  >
                    {t.results.cancel_note}
                  </button>
                  <button 
                    onClick={handleSaveNote}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
                  >
                    {t.results.save_note}
                  </button>
               </div>
            </div>
         </div>
      )}
    </>
  );
};

export default ItineraryStepCard;
