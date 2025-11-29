
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { Video, Loader2, Play, Monitor, Smartphone } from 'lucide-react';

export const ConceptVisualizer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setVideoUrl(null);
    setLoadingMessage('Connecting to Veo...');
    
    // Simulating progress messages to reassure user during generation
    const messages = [
      "Analyzing fact pattern...",
      "Drafting scene composition...",
      "Generating video frames...",
      "Rendering final output..."
    ];
    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < messages.length) {
        setLoadingMessage(messages[msgIdx]);
        msgIdx++;
      }
    }, 3000);

    try {
      const url = await GeminiService.generateLegalVideo(prompt, aspectRatio);
      setVideoUrl(url);
    } catch (e) {
      console.error(e);
      alert("Failed to generate video. Please ensure you have selected a valid API Key if prompted.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center max-w-5xl mx-auto space-y-8 p-6 pb-20 overflow-y-auto">
      <div className="text-center max-w-2xl">
        <h2 className="text-3xl font-serif font-bold text-slate-900 flex items-center justify-center gap-3">
          <Video className="w-8 h-8 text-indigo-600" />
          Legal Concept Visualizer
        </h2>
        <p className="text-slate-500 mt-2">
          Use AI to turn complex fact patterns or abstract rules into concrete visual scenarios.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Fact Pattern / Concept</label>
            <textarea
              className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-700 text-sm"
              placeholder="e.g. A person negligently leaving a banana peel on the floor of a grocery store, causing another customer to slip and fall."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Aspect Ratio</label>
             <div className="grid grid-cols-2 gap-3">
               <button
                 onClick={() => setAspectRatio('16:9')}
                 className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${aspectRatio === '16:9' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}
               >
                 <Monitor className="w-6 h-6" />
                 <span className="text-xs font-medium">Landscape (16:9)</span>
               </button>
               <button
                 onClick={() => setAspectRatio('9:16')}
                 className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${aspectRatio === '9:16' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}
               >
                 <Smartphone className="w-6 h-6" />
                 <span className="text-xs font-medium">Portrait (9:16)</span>
               </button>
             </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
            {loading ? 'Generating...' : 'Visualize Scene'}
          </button>
        </div>

        {/* Display Area */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl shadow-lg overflow-hidden flex items-center justify-center min-h-[400px] relative">
          {loading ? (
            <div className="text-center space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
              <p className="text-indigo-200 font-mono text-sm animate-pulse">{loadingMessage}</p>
            </div>
          ) : videoUrl ? (
            <div className="w-full h-full flex items-center justify-center bg-black">
               <video 
                 src={videoUrl} 
                 controls 
                 autoPlay 
                 loop 
                 className={`max-h-full max-w-full shadow-2xl ${aspectRatio === '9:16' ? 'h-[500px]' : 'w-full'}`}
               />
            </div>
          ) : (
            <div className="text-center text-slate-600 p-8">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-slate-500">Your generated video scenario will appear here.</p>
            </div>
          )}
          
          {/* Branding Overlay */}
          <div className="absolute bottom-4 right-4 text-white/10 font-bold text-xs pointer-events-none select-none">
            POWERED BY VEO
          </div>
        </div>

      </div>
    </div>
  );
};
