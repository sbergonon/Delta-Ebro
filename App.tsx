
import React, { useState, useEffect } from 'react';
import { UserPreferences, ItineraryResult, Language, SavedItinerary } from './types';
import { DEFAULT_PREFERENCES, TRANSLATIONS, THEME_ICONS } from './constants';
import { generateItinerary } from './services/geminiService';
import PreferenceSelector from './components/PreferenceSelector';
import ResultDisplay from './components/ResultDisplay';
import Button from './components/Button';

const App: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [result, setResult] = useState<ItineraryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSavedTrips, setShowSavedTrips] = useState(false);
  const [savedTrips, setSavedTrips] = useState<SavedItinerary[]>([]);
  
  const t = TRANSLATIONS[preferences.language];

  // Check for shared itinerary in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    if (shareParam) {
        try {
            const json = decodeURIComponent(atob(shareParam));
            const sharedPrefs = JSON.parse(json);
            if (!sharedPrefs.language) sharedPrefs.language = 'ca';
            setPreferences(sharedPrefs);
            
            setLoading(true);
            generateItinerary(sharedPrefs)
                .then(data => setResult(data))
                .catch(err => setError(err.message || "Error al cargar el itinerario compartido"))
                .finally(() => setLoading(false));

            window.history.replaceState({}, '', window.location.pathname);
        } catch (e) {
            console.error("Error parsing shared url", e);
            setError("Link broken");
        }
    }
    
    // Load saved trips from local storage
    const loadedTrips = localStorage.getItem('amposta_explorer_trips');
    if (loadedTrips) {
        try {
            setSavedTrips(JSON.parse(loadedTrips));
        } catch (e) { console.error("Error loading trips", e); }
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateItinerary(preferences);
      setResult(data);
    } catch (err: any) {
      setError(err.message || t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const handleLanguageChange = (lang: Language) => {
    setPreferences(prev => ({ ...prev, language: lang }));
  };

  const handleDeleteTrip = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const updated = savedTrips.filter(trip => trip.id !== id);
      setSavedTrips(updated);
      localStorage.setItem('amposta_explorer_trips', JSON.stringify(updated));
  };

  const handleLoadTrip = (trip: SavedItinerary) => {
      setPreferences(trip.preferences);
      setResult(trip.result);
      setShowSavedTrips(false);
  };

  const handleSaveTrip = () => {
      if (!result) return false;
      const newTrip: SavedItinerary = {
          id: Date.now().toString(),
          name: `${t.themes[preferences.theme].label.split(' ')[0]} - ${preferences.duration} ${t.label_days}`,
          createdAt: Date.now(),
          preferences: preferences,
          result: result
      };
      const updated = [newTrip, ...savedTrips];
      setSavedTrips(updated);
      localStorage.setItem('amposta_explorer_trips', JSON.stringify(updated));
      return true; // signal success
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 print:hidden shadow-sm">
        <div className="max-w-3xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2 cursor-pointer group shrink-0" onClick={handleReset}>
            <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">🌾</span>
            <div className="flex flex-col">
                <h1 className="font-bold text-sm sm:text-xl tracking-tight text-stone-800 leading-none">
                Amposta<span className="text-teal-600">Exp</span>
                </h1>
                <span className="text-[8px] sm:text-[10px] text-stone-400 font-mono tracking-widest uppercase">v2.1 AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
             {/* Restaurant Finder Button REMOVED */}

             <button 
                onClick={() => setShowSavedTrips(true)}
                className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-1.5 sm:px-3 py-1.5 rounded-full transition-all flex items-center gap-1 sm:gap-2 shadow-sm"
             >
                <span className="text-sm sm:text-lg">📂</span>
                <span className="hidden sm:inline">{t.saved_trips_btn}</span>
                <span className="bg-teal-200 text-teal-800 px-1.5 rounded-md text-[9px] sm:text-[10px]">{savedTrips.length}</span>
             </button>

             <div className="flex bg-stone-100 p-0.5 sm:p-1 rounded-lg">
                {(['ca', 'es', 'en'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-1 rounded-md transition-all uppercase ${
                      preferences.language === lang 
                      ? 'bg-white text-teal-600 shadow-sm' 
                      : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm overflow-x-auto">
             <pre className="text-sm text-red-700 whitespace-pre-wrap font-sans">{error}</pre>
          </div>
        )}

        {!result ? (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
                {t.title} <span className="text-teal-600">Explorer</span>
              </h2>
              <p className="text-lg text-stone-600 max-w-xl mx-auto leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            <div className="bg-white p-5 md:p-8 rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100">
               <PreferenceSelector prefs={preferences} onChange={setPreferences} />
               
               <div className="mt-8 pt-6 border-t border-slate-100">
                 <Button 
                    onClick={handleGenerate} 
                    isLoading={loading}
                    className="w-full text-lg shadow-xl py-4"
                  >
                    {loading ? t.generating_btn : t.generate_btn}
                 </Button>
               </div>
            </div>
          </div>
        ) : (
          <ResultDisplay 
             result={result} 
             preferences={preferences} 
             onReset={handleReset} 
             onSave={handleSaveTrip}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 mt-auto print:hidden">
        <div className="max-w-3xl mx-auto px-4 text-center text-stone-400 text-sm">
          <p>© {new Date().getFullYear()} Amposta Explorer. Powered by Google Gemini.</p>
        </div>
      </footer>

      {/* Saved Trips Modal */}
      {showSavedTrips && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-fade-in-up">
                 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                        📂 {t.saved_trips_title}
                    </h3>
                    <button onClick={() => setShowSavedTrips(false)} className="text-slate-400 hover:text-stone-600 p-2 bg-slate-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                 </div>
                 
                 <div className="overflow-y-auto p-4 space-y-3 flex-1 bg-slate-50">
                     {savedTrips.length === 0 ? (
                         <div className="text-center py-10 text-stone-400">
                             <span className="text-5xl block mb-4 opacity-50">📭</span>
                             <p className="font-medium">{t.no_saved_trips}</p>
                         </div>
                     ) : (
                         savedTrips.map(trip => (
                             <div key={trip.id} onClick={() => handleLoadTrip(trip)} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-md cursor-pointer transition-all group relative">
                                 <div className="flex justify-between items-start">
                                     <div>
                                         <div className="font-bold text-stone-800 flex items-center gap-2">
                                             <span className="text-xl">{THEME_ICONS[trip.preferences.theme]}</span>
                                             {trip.name}
                                         </div>
                                         <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                                             <span>📅 {new Date(trip.createdAt).toLocaleDateString()}</span>
                                             <span>•</span>
                                             <span>{trip.preferences.language.toUpperCase()}</span>
                                         </div>
                                     </div>
                                 </div>
                                 <button 
                                     onClick={(e) => handleDeleteTrip(trip.id, e)}
                                     className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                     title={t.delete_btn}
                                 >
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                 </button>
                             </div>
                         ))
                     )}
                 </div>
                 
                 <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl">
                     <button onClick={() => setShowSavedTrips(false)} className="w-full py-3 text-sm font-bold text-white bg-stone-800 hover:bg-stone-900 rounded-xl transition-colors shadow-lg shadow-stone-200">
                         Tancar
                     </button>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default App;
