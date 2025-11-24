

import React, { useState, useEffect } from 'react';
import { UserPreferences, ItineraryResult, Language } from './types';
import { DEFAULT_PREFERENCES, TRANSLATIONS } from './constants';
import { generateItinerary } from './services/geminiService';
import PreferenceSelector from './components/PreferenceSelector';
import ResultDisplay from './components/ResultDisplay';
import Button from './components/Button';

const App: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [result, setResult] = useState<ItineraryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[preferences.language];

  // Check for shared itinerary in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    if (shareParam) {
        try {
            const json = decodeURIComponent(atob(shareParam));
            const sharedPrefs = JSON.parse(json);
            // Ensure shared prefs have a valid language or default to 'ca'
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

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      
      {/* Navbar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 print:hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <h1 className="font-bold text-xl tracking-tight text-stone-800">
              Amposta<span className="text-teal-600">Explorer</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-stone-100 p-1 rounded-lg">
                {(['ca', 'es', 'en'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`text-xs font-bold px-2 py-1 rounded-md transition-all uppercase ${
                      preferences.language === lang 
                      ? 'bg-white text-teal-600 shadow-sm' 
                      : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
             </div>
             <div className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-1 rounded hidden sm:block">
                {t.beta}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!result ? (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
                {t.title} <span className="text-teal-600">Explorer</span>
              </h2>
              <p className="text-lg text-stone-600 max-w-xl mx-auto">
                {t.subtitle}
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100">
               <PreferenceSelector prefs={preferences} onChange={setPreferences} />
               
               <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                 <Button 
                    onClick={handleGenerate} 
                    isLoading={loading}
                    className="w-full sm:w-auto text-lg shadow-xl"
                  >
                    {loading ? t.generating_btn : t.generate_btn}
                 </Button>
               </div>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-12 opacity-70">
                <div className="p-4">
                    <div className="text-2xl mb-2">🏰</div>
                    <div className="text-sm font-semibold">{t.themes.historical.label}</div>
                </div>
                <div className="p-4">
                    <div className="text-2xl mb-2">🥘</div>
                    <div className="text-sm font-semibold">{t.themes.gastronomic.label}</div>
                </div>
                 <div className="p-4">
                    <div className="text-2xl mb-2">🦩</div>
                    <div className="text-sm font-semibold">{t.themes.nature.label}</div>
                </div>
                 <div className="p-4">
                    <div className="text-2xl mb-2">🚌</div>
                    <div className="text-sm font-semibold">{t.transports.bus}</div>
                </div>
            </div>
          </div>
        ) : (
          <ResultDisplay result={result} preferences={preferences} onReset={handleReset} />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 mt-auto print:hidden">
        <div className="max-w-3xl mx-auto px-4 text-center text-stone-400 text-sm">
          <p>© {new Date().getFullYear()} Amposta Explorer. Powered by Google Gemini.</p>
          <p className="mt-2 text-xs">{t.results.verify_warning}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;