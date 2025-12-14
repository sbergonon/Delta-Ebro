
import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { UserPreferences, Theme, Transport, AccommodationMode } from '../types';
import { THEME_ICONS, TRANSPORT_ICONS, TRANSLATIONS, THEME_POIS, POI_LOCATIONS } from '../constants';

interface PreferenceSelectorProps {
  prefs: UserPreferences;
  onChange: (newPrefs: UserPreferences) => void;
}

const PreferenceSelector: React.FC<PreferenceSelectorProps> = ({ prefs, onChange }) => {
  const t = TRANSLATIONS[prefs.language];
  const [activeLocationFilter, setActiveLocationFilter] = useState<string>('ALL');

  const handleThemeChange = (theme: Theme) => {
    // When theme changes, clear selected POIs and reset filter
    onChange({ ...prefs, theme, selectedPOIs: [] });
    setActiveLocationFilter('ALL');
  };
  
  const handleCustomThemeToggle = (subTheme: Theme) => {
    const currentCustom = prefs.customThemes || [];
    let newCustom: Theme[];
    if (currentCustom.includes(subTheme)) {
        newCustom = currentCustom.filter(t => t !== subTheme);
    } else {
        newCustom = [...currentCustom, subTheme];
    }
    onChange({ ...prefs, customThemes: newCustom });
  };

  const handlePoiToggle = (poi: string) => {
    const currentPOIs = prefs.selectedPOIs || [];
    let newPOIs: string[];
    if (currentPOIs.includes(poi)) {
        newPOIs = currentPOIs.filter(p => p !== poi);
    } else {
        newPOIs = [...currentPOIs, poi];
    }
    onChange({ ...prefs, selectedPOIs: newPOIs });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...prefs, duration: parseInt(e.target.value) });
  const handleTransportChange = (transport: Transport) => {
    // Reset upriver flag if switching away from River, but keep logic simple
    const newUpriver = transport === Transport.RIVER ? prefs.includeUpriver : false;
    onChange({ ...prefs, transport, includeUpriver: newUpriver });
  };
  
  const handleCustomTransportToggle = (subTransport: Transport) => {
    const currentCustom = prefs.customTransports || [];
    let newCustom: Transport[];
    if (currentCustom.includes(subTransport)) {
        newCustom = currentCustom.filter(t => t !== subTransport);
    } else {
        newCustom = [...currentCustom, subTransport];
    }
    onChange({ ...prefs, customTransports: newCustom });
  };

  const handleInfoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ ...prefs, additionalInfo: e.target.value });
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...prefs, startDate: e.target.value });
  const handleUpriverChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...prefs, includeUpriver: e.target.checked });
  
  const handleAccommodationModeChange = (mode: AccommodationMode) => onChange({ ...prefs, accommodationMode: mode });
  const handleBaseLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...prefs, baseLocation: e.target.value });


  // Calculate min date as today
  const today = new Date().toISOString().split('T')[0];

  // 1. Get all potential POIs based on current theme(s)
  const allPotentialPOIs = useMemo(() => {
      let flatPOIs: string[] = [];
      if (prefs.theme === Theme.CUSTOM && prefs.customThemes && prefs.customThemes.length > 0) {
          prefs.customThemes.forEach(ct => {
              if (THEME_POIS[ct]) flatPOIs = [...flatPOIs, ...THEME_POIS[ct]];
          });
          flatPOIs = [...new Set(flatPOIs)];
      } else if (THEME_POIS[prefs.theme]) {
          flatPOIs = THEME_POIS[prefs.theme];
      }
      return flatPOIs;
  }, [prefs.theme, prefs.customThemes]);

  // 2. Extract available locations from the potential POIs
  const availableLocations = useMemo(() => {
      const locations = new Set<string>();
      allPotentialPOIs.forEach(poi => {
          locations.add(POI_LOCATIONS[poi] || "Altres / General");
      });
      return Array.from(locations).sort();
  }, [allPotentialPOIs]);

  // 3. Group POIs by location, respecting the active filter
  const groupedPOIs = useMemo(() => {
      const groups: Record<string, string[]> = {};
      allPotentialPOIs.forEach(poi => {
          const loc = POI_LOCATIONS[poi] || "Altres / General";
          
          // Apply filter
          if (activeLocationFilter !== 'ALL' && loc !== activeLocationFilter) {
              return;
          }

          if (!groups[loc]) groups[loc] = [];
          groups[loc].push(poi);
      });
      return groups;
  }, [allPotentialPOIs, activeLocationFilter]);

  const hasPOIs = allPotentialPOIs.length > 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Theme Selection */}
      <section>
        <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <span className="bg-teal-100 text-teal-800 p-1.5 rounded-lg text-sm">1</span>
          {t.section_1_title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(Theme).map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 relative overflow-hidden group ${
                prefs.theme === theme 
                  ? 'border-teal-500 bg-teal-50/50 shadow-md' 
                  : 'border-slate-100 bg-white hover:border-teal-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 relative z-10">
                <span className="text-3xl filter drop-shadow-sm">{THEME_ICONS[theme]}</span>
                <div>
                  <div className={`font-semibold ${prefs.theme === theme ? 'text-teal-900' : 'text-slate-700'}`}>
                    {t.themes[theme].label}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t.themes[theme].desc}
                  </p>
                </div>
              </div>
              {prefs.theme === theme && (
                <div className="absolute top-2 right-2 text-teal-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Custom Mix Selection for Themes */}
        {prefs.theme === Theme.CUSTOM && (
            <div className="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-xl animate-fade-in">
                <h4 className="text-sm font-bold text-teal-800 mb-3">{t.label_custom_selection}</h4>
                <div className="flex flex-wrap gap-2">
                    {Object.values(Theme)
                        .filter(th => th !== Theme.CUSTOM)
                        .map(th => {
                            const isSelected = (prefs.customThemes || []).includes(th);
                            return (
                                <button
                                    key={th}
                                    onClick={() => handleCustomThemeToggle(th)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
                                        isSelected 
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm' 
                                        : 'bg-white text-stone-600 border-slate-200 hover:border-teal-300'
                                    }`}
                                >
                                    <span>{THEME_ICONS[th]}</span>
                                    {t.themes[th].label}
                                    {isSelected && <span className="ml-1 text-teal-200">✓</span>}
                                </button>
                            );
                        })
                    }
                </div>
            </div>
        )}

        {/* POI Selection Grid (Grouped by Town) */}
        {hasPOIs && (
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                   <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-800">{t.section_pois_title}</h4>
                      <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-100">{t.label_pois_hint}</span>
                   </div>
                </div>
                
                <div className="space-y-6">
                    {Object.keys(groupedPOIs).length === 0 ? (
                        <div className="text-center py-4 text-sm text-slate-400 italic bg-white rounded-lg border border-dashed border-slate-200">
                           No hay lugares para este filtro.
                        </div>
                    ) : (
                        Object.entries(groupedPOIs).map(([location, pois]) => (
                            <div key={location} className="animate-fade-in">
                                <h5 className="text-xs font-bold text-teal-700 uppercase mb-2 flex items-center gap-1 border-b border-slate-200 pb-1">
                                    📍 {location}
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(pois as string[]).map((poi, idx) => {
                                        const isSelected = (prefs.selectedPOIs || []).includes(poi);
                                        return (
                                            <label 
                                                key={idx} 
                                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                                                    isSelected 
                                                    ? 'bg-white border-teal-500 ring-1 ring-teal-500' 
                                                    : 'bg-white border-slate-200 hover:border-teal-300'
                                                }`}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected}
                                                    onChange={() => handlePoiToggle(poi)}
                                                    className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                                />
                                                <span className={`text-sm ${isSelected ? 'text-teal-900 font-medium' : 'text-slate-600'}`}>
                                                    {poi}
                                                </span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Location Filters - Moved Below Grid */}
                {availableLocations.length > 1 && (
                   <div className="mt-6 pt-4 border-t border-slate-100 animate-fade-in">
                       <div className="flex items-center gap-2 mb-2">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtrar per zona / Filter by area:</span>
                       </div>
                       <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
                           <button
                               onClick={() => setActiveLocationFilter('ALL')}
                               className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md border whitespace-nowrap transition-colors ${
                                   activeLocationFilter === 'ALL'
                                   ? 'bg-stone-600 text-white border-stone-600'
                                   : 'bg-white text-stone-500 border-slate-200 hover:bg-stone-100'
                               }`}
                           >
                               ALL
                           </button>
                           {availableLocations.map(loc => (
                               <button
                                   key={loc}
                                   onClick={() => setActiveLocationFilter(loc)}
                                   className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md border whitespace-nowrap transition-colors ${
                                       activeLocationFilter === loc
                                       ? 'bg-teal-600 text-white border-teal-600'
                                       : 'bg-white text-slate-500 border-slate-200 hover:text-teal-600 hover:border-teal-200'
                                   }`}
                               >
                                   {loc}
                               </button>
                           ))}
                       </div>
                   </div>
                )}
            </div>
        )}

      </section>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duration & Date */}
        <section className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-stone-800 mb-3 flex items-center gap-2">
                    <span className="bg-teal-100 text-teal-800 p-1.5 rounded-lg text-sm">2</span>
                    {t.section_2_title}
                </h3>
                <div className="space-y-3">
                    <div className="relative p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <label className="block text-xs font-semibold text-stone-500 mb-3 uppercase">{t.label_duration}</label>
                        <div className="flex items-center gap-4">
                           <input
                              type="range"
                              min="1"
                              max="7"
                              step="1"
                              value={prefs.duration}
                              onChange={handleDurationChange}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                           />
                           <span className="text-stone-700 font-bold text-lg min-w-[3rem] text-right whitespace-nowrap">
                              {prefs.duration} <span className="text-sm font-normal text-slate-500">{prefs.duration === 1 ? t.label_day : t.label_days}</span>
                           </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
                             <span>1</span>
                             <span>7</span>
                        </div>
                    </div>
                    
                    <div>
                         <label className="block text-xs font-semibold text-stone-500 mb-1 ml-1 uppercase">{t.label_date}</label>
                         <input 
                             type="date" 
                             min={today}
                             value={prefs.startDate || ''}
                             onChange={handleDateChange}
                             className="w-full bg-white border border-slate-200 text-slate-700 py-3 px-4 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm"
                         />
                         <p className="text-[10px] text-slate-400 mt-1 ml-1">
                           {t.label_date_hint}
                         </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Transport & Accommodation */}
        <div className="space-y-6">
            {/* Transport */}
            <section>
              <h3 className="text-lg font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <span className="bg-teal-100 text-teal-800 p-1.5 rounded-lg text-sm">3</span>
                {t.section_3_title}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(Transport).map((tr) => (
                  <button
                    key={tr}
                    onClick={() => handleTransportChange(tr)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-full ${
                        prefs.transport === tr
                        ? 'border-teal-500 bg-teal-50/50 text-teal-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200'
                    }`}
                  >
                    <span className="text-2xl mb-1">{TRANSPORT_ICONS[tr]}</span>
                    <span className="text-xs font-medium leading-tight">{t.transports[tr]}</span>
                  </button>
                ))}
              </div>

              {/* Custom Mix Selection for Transports */}
              {prefs.transport === Transport.MIX && (
                <div className="mt-3 p-3 bg-teal-50 border border-teal-100 rounded-xl animate-fade-in">
                    <h4 className="text-xs font-bold text-teal-800 mb-2">{t.label_custom_transport_selection}</h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(Transport)
                            .filter(tr => tr !== Transport.MIX)
                            .map(tr => {
                                const isSelected = (prefs.customTransports || []).includes(tr);
                                return (
                                    <button
                                        key={tr}
                                        onClick={() => handleCustomTransportToggle(tr)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                                            isSelected 
                                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm' 
                                            : 'bg-white text-stone-600 border-slate-200 hover:border-teal-300'
                                        }`}
                                    >
                                        <span>{TRANSPORT_ICONS[tr]}</span>
                                        {t.results.transport_labels[tr]}
                                        {isSelected && <span className="ml-1 text-teal-200">✓</span>}
                                    </button>
                                );
                            })
                        }
                    </div>
                </div>
              )}

              {/* Special Option for River Transport */}
              {prefs.transport === Transport.RIVER && (
                <div className="mt-3 animate-fade-in">
                  <label className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                     <input 
                       type="checkbox" 
                       checked={prefs.includeUpriver || false}
                       onChange={handleUpriverChange}
                       className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                     />
                     <div className="flex-1">
                        <span className="text-sm font-semibold text-blue-900 block">
                          {t.label_river_option}
                        </span>
                        <span className="text-xs text-blue-700 block mt-0.5">
                          <ReactMarkdown>{t.label_river_hint}</ReactMarkdown>
                        </span>
                     </div>
                  </label>
                </div>
              )}
            </section>
            
            {/* Accommodation */}
            <section>
                <h3 className="text-lg font-semibold text-stone-800 mb-3 flex items-center gap-2">
                    <span className="bg-teal-100 text-teal-800 p-1.5 rounded-lg text-sm">4</span>
                    {t.section_accommodation_title}
                </h3>
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        {Object.values(AccommodationMode).map((mode) => (
                             <button
                                key={mode}
                                onClick={() => handleAccommodationModeChange(mode)}
                                className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col ${
                                    prefs.accommodationMode === mode
                                    ? 'border-teal-500 bg-teal-50/50 text-teal-900 shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200'
                                }`}
                             >
                                <span className="text-2xl mb-1">{mode === AccommodationMode.BASE ? '🏠' : '🎒'}</span>
                                <span className="font-semibold text-sm">{t.accommodations[mode].label}</span>
                                <span className="text-[10px] opacity-75 leading-tight mt-1">{t.accommodations[mode].desc}</span>
                             </button>
                        ))}
                    </div>
                    {prefs.accommodationMode === AccommodationMode.BASE && (
                         <div className="animate-fade-in">
                             <label className="block text-xs font-semibold text-stone-500 mb-1 ml-1">{t.label_base_location}</label>
                             <input 
                                 type="text"
                                 value={prefs.baseLocation}
                                 onChange={handleBaseLocationChange}
                                 placeholder="Ej. Amposta"
                                 className="w-full bg-white border border-slate-200 text-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm"
                             />
                         </div>
                    )}
                </div>
            </section>
        </div>
      </div>

      {/* Additional Info */}
      <section>
        <h3 className="text-lg font-semibold text-stone-800 mb-3 flex items-center gap-2">
          <span className="bg-teal-100 text-teal-800 p-1.5 rounded-lg text-sm">5</span>
          {t.section_4_title}
        </h3>
        <textarea
          placeholder={t.label_extra_hint}
          value={prefs.additionalInfo || ''}
          onChange={handleInfoChange}
          className="w-full bg-white border border-slate-200 text-slate-700 py-3 px-4 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm min-h-[100px]"
        />
      </section>
    </div>
  );
};

export default PreferenceSelector;
