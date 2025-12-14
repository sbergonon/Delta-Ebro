
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ItineraryStep, Transport, Theme, Language } from '../types';
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

// Heuristic to detect specific themes within steps
const getEffectiveTheme = (step: ItineraryStep, globalTheme: Theme): Theme => {
  // SAFEGUARD: Ensure strings exist
  const title = step?.title || "";
  const desc = step?.description || "";
  const text = (title + ' ' + desc).toLowerCase();
  
  if (/(arròs|arroz|paella|fideuà|marisc|restaurant|gastro|tapa|vermut|dinar|sopar|comida|cena|tasting|degustaci)/.test(text)) return Theme.GASTRONOMIC;
  if (/(búnquer|trinxera|trinchera|refugi|guerra|batalla|front|bombardeig|civil war)/.test(text)) return Theme.CIVIL_WAR;
  if (/(roc|geol|sediment|pedra|formaci|cova|rock|geology)/.test(text)) return Theme.GEOLOGICAL;
  if (/(ocell|au |bird|flamenc|llacuna|bassa|platja|muntanya|riu|natura|delta|parc natural|encanyissada|tancada)/.test(text)) return Theme.NATURE;
  if (/(castell|torre|església|iglesia|catedral|museu|hist|romà|iber|castle|church)/.test(text)) return Theme.HISTORICAL;

  return globalTheme;
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
  const [tempNote, setTempNote] = useState(step?.userNotes || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false);
  const [areInstructionsOpen, setAreInstructionsOpen] = useState(false);
  const [areNearbyOpen, setAreNearbyOpen] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasRetriedGeneration = useRef(false);
  const t = TRANSLATIONS[language];

  // Defensive Checks
  if (!step) return null;
  const safeTitle = step.title || "Activity";
  const safeDesc = step.description || "";
  const safeDay = step.day || "1";
  const safeTime = step.timeOfDay || "";

  useEffect(() => {
      setImgError(false);
      hasRetriedGeneration.current = false;
  }, [step.imageUrl]);

  useEffect(() => {
      if (step.detailedInstructions) setIsGeneratingInstructions(false);
      if (step.nearbyAttractions) setIsLoadingNearby(false);
  }, [step.detailedInstructions, step.nearbyAttractions]);

  let travelMode = 'driving';
  switch (transport) {
    case Transport.WALKING: travelMode = 'walking'; break;
    case Transport.BUS:
    case Transport.TRAIN:
    case Transport.MIX: travelMode = 'transit'; break;
    case Transport.BIKE: travelMode = 'bicycling'; break;
    case Transport.RIVER:
    case Transport.CAR: travelMode = 'driving'; break;
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${safeTitle}, Tarragona`)}&travelmode=${travelMode}`;

  const hasImage = step.imageUrl && !imgError;
  const effectiveTheme = getEffectiveTheme(step, theme);
  const placeholderGradient = THEME_GRADIENTS[effectiveTheme] || THEME_GRADIENTS[Theme.CUSTOM];
  const placeholderIcon = THEME_ICONS[effectiveTheme] || '🗺️';
  
  const isBookable = (() => {
    const title = safeTitle.toLowerCase();
    const desc = safeDesc.toLowerCase();
    if (title.includes('check-in') || title.includes('check-out') || title.includes('esmorzar') || title.includes('desayuno') || title.includes('breakfast')) return false;

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
      setAreInstructionsOpen(true);
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

  const containerClasses = isSpecialEvent 
    ? "bg-white rounded-xl border-2 border-fuchsia-400 ring-4 ring-fuchsia-50 shadow-lg shadow-fuchsia-100/50 hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col md:flex-row group h-full md:min-h-[320px] relative z-10"
    : "bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col md:flex-row group h-full md:min-h-[320px]";

  const showBookingBtn = isBookable || hasDirectBooking;

  return (
    <>
      <div className={containerClasses}>
        
        {/* IMAGE SECTION */}
        <div className={`relative h-48 md:h-auto md:w-5/12 lg:w-2/5 shrink-0 overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 ${!hasImage ? placeholderGradient : 'bg-slate-100'} order-1 md:order-2`}>
            {/* Mobile-only Day Badge */}
            <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 md:hidden flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">{t.results.day} {safeDay}</span>
                <span className="w-1 h-4 bg-slate-300"></span>
                <span className="text-xs font-bold text-teal-600">{safeTime}</span>
            </div>

            {hasImage ? (
                <div className="w-full h-full relative group-hover:scale-[1.02] transition-transform duration-700 ease-out">
                  <img 
                      src={step.imageUrl} 
                      alt={safeTitle}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setImgError(true);
                        if (onGenerateImage && !hasRetriedGeneration.current && step.imageUrl && !step.imageUrl.startsWith('data:')) {
                            hasRetriedGeneration.current = true;
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
                   <span className="relative z-10 text-6xl md:text-8xl filter drop-shadow-md transform group-hover/placeholder:scale-110 transition-transform duration-500 select-none opacity-90" aria-hidden="true">
                     {placeholderIcon}
                   </span>
                   {onGenerateImage && (
                       <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px] opacity-0 group-hover/placeholder:opacity-100 transition-all duration-300 z-20">
                           <button 
                             onClick={(e) => handleGenerateClick(e)}
                             disabled={isGenerating}
                             className="bg-white text-teal-700 hover:text-teal-800 hover:scale-105 transform transition-all shadow-xl rounded-full px-4 py-2 font-bold text-xs flex items-center gap-2 border border-teal-100"
                           >
                             {isGenerating ? t.results.generating_image : t.results.generate_image_btn}
                           </button>
                       </div>
                   )}
                </div>
            )}
        </div>

        {/* DESKTOP DAY INDICATOR */}
        <div className="hidden md:flex bg-slate-50 border-r border-slate-200 p-4 w-24 flex-col items-center justify-center gap-2 text-center shrink-0 order-1">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.results.day}</span>
             <span className="text-2xl font-black text-slate-700">{safeDay}</span>
             <div className="h-px w-8 bg-slate-300 my-2"></div>
             <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md writing-mode-vertical">
                {safeTime}
             </span>
        </div>

        {/* CONTENT SECTION */}
        <div className="p-5 flex-grow min-w-0 flex flex-col justify-between order-3">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h3 className="text-lg md:text-xl font-bold text-stone-800 leading-tight group-hover:text-teal-700 transition-colors">
                {safeTitle}
              </h3>
              {isSpecialEvent && (
                <span className="shrink-0 bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
                   {t.results.special_event}
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
                  className={`text-xl focus:outline-none transition-all duration-200 ${
                    star <= (userRating || 0) 
                      ? 'text-amber-400' 
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
                    strong: ({node, ...props}) => <span className="font-semibold text-teal-700" {...props} />,
                }}
              >
                {safeDesc}
              </ReactMarkdown>
            </div>

            {/* Expandable Sections */}
            {(areInstructionsOpen || areNearbyOpen || step.userNotes) && (
                <div className="space-y-3 mt-4">
                    {/* Instructions */}
                    {areInstructionsOpen && (
                        <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg animate-fade-in text-sm text-stone-700">
                            <h4 className="font-bold text-teal-800 mb-2 flex items-center gap-2 text-xs uppercase tracking-wide">
                                {t.results.instructions_title}
                            </h4>
                            {isGeneratingInstructions ? (
                                <div className="text-teal-600 italic text-xs">{t.results.loading_instructions}</div>
                            ) : (
                                step.detailedInstructions && (
                                    <ul className="list-decimal pl-4 space-y-1">
                                        {step.detailedInstructions.map((instruction, i) => (
                                            <li key={i}>{instruction}</li>
                                        ))}
                                    </ul>
                                )
                            )}
                        </div>
                    )}
                    {/* Nearby */}
                    {areNearbyOpen && (
                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg animate-fade-in text-sm text-stone-700">
                             <h4 className="font-bold text-indigo-800 mb-2 flex items-center gap-2 text-xs uppercase tracking-wide">
                                {t.results.nearby_title}
                            </h4>
                            {isLoadingNearby ? (
                                <div className="text-indigo-600 italic text-xs">{t.results.loading_nearby}</div>
                            ) : (
                                step.nearbyAttractions && step.nearbyAttractions.length > 0 ? (
                                    <ul className="space-y-2">
                                        {step.nearbyAttractions.map((attraction, i) => (
                                            <li key={i} className="flex justify-between items-center bg-white p-2 rounded border border-indigo-100 text-xs">
                                                <span className="font-semibold text-indigo-900">{attraction.name}</span>
                                                <span className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-600 ml-2 whitespace-nowrap">{attraction.distance}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="italic text-indigo-600 text-xs">{t.results.no_nearby_found}</p>
                                )
                            )}
                        </div>
                    )}
                    {/* Notes */}
                    {step.userNotes && (
                       <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-stone-700 relative animate-fade-in">
                          <span className="block text-[10px] font-bold text-yellow-700 uppercase mb-1">{t.results.your_notes_label}</span>
                          <div className="whitespace-pre-wrap text-xs">{step.userNotes}</div>
                          <button onClick={openNoteModal} className="absolute top-2 right-2 text-yellow-600 p-1">
                             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          </button>
                       </div>
                    )}
                </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 md:flex md:flex-wrap gap-2 print:hidden">
              <a 
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 px-3 py-2.5 rounded-lg transition-colors"
              >
                {t.results.directions_btn}
              </a>

              {showBookingBtn && (
                <button 
                  onClick={onViewBooking}
                  className={`flex items-center justify-center gap-2 text-xs font-bold px-3 py-2.5 rounded-lg transition-all ${
                     hasDirectBooking 
                     ? "bg-amber-100 text-amber-900 hover:bg-amber-200" 
                     : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                  }`}
                >
                  {t.results.view_booking_btn}
                </button>
              )}

              {onGenerateInstructions && (
                  <button
                    onClick={handleInstructionsClick}
                    className={`flex items-center justify-center gap-2 text-xs font-bold px-3 py-2.5 rounded-lg transition-colors ${
                        areInstructionsOpen ? "bg-teal-100 text-teal-800" : "bg-slate-50 text-slate-500 hover:text-teal-600 hover:bg-teal-50"
                    }`}
                  >
                    {t.results.step_by_step_btn}
                  </button>
              )}

              {onFetchNearby && (
                  <button
                    onClick={handleNearbyClick}
                    className={`flex items-center justify-center gap-2 text-xs font-bold px-3 py-2.5 rounded-lg transition-colors ${
                        areNearbyOpen ? "bg-indigo-100 text-indigo-800" : "bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    {t.results.nearby_attractions_btn}
                  </button>
              )}

              <button 
                onClick={openNoteModal}
                className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-yellow-50 hover:text-yellow-700 px-3 py-2.5 rounded-lg transition-colors"
              >
                {step.userNotes ? t.results.edit_note_btn : t.results.add_note_btn}
              </button>
          </div>
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
                  <div className="mb-2 text-sm text-stone-500 font-medium">{safeTitle}</div>
                  <textarea 
                    value={tempNote}
                    onChange={(e) => setTempNote(e.target.value)}
                    placeholder={t.results.note_placeholder}
                    className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-stone-700"
                    autoFocus
                  />
               </div>
               <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button onClick={handleCancelNote} className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 rounded-lg">{t.results.cancel_note}</button>
                  <button onClick={handleSaveNote} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg">{t.results.save_note}</button>
               </div>
            </div>
         </div>
      )}
    </>
  );
};

export default ItineraryStepCard;
