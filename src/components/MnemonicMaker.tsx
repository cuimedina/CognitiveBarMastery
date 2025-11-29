import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { MnemonicResult } from '../types';
import { Brain, Wand2, Loader2, Image as ImageIcon, Sparkles, MessageSquare } from 'lucide-react';

export const MnemonicMaker: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<MnemonicResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!inputText) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await GeminiService.generateMnemonic(inputText);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-start max-w-4xl mx-auto space-y-8 p-6 pb-20 overflow-y-auto">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif font-bold text-slate-900">Mnemonic Generator</h2>
        <p className="text-slate-500">Transform complex rule lists into sticky memory hooks.</p>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6 space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Elements to Memorize</label>
          <textarea 
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-700"
            placeholder="e.g. Specific Intent, Privity, Intent to run, Notice, Touch and Concern..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading || !inputText}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          Create Memory Hook
        </button>
      </div>

      {result && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          
          {/* Acronym Card */}
          <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-indigo-100 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500" />
            <Brain className="w-12 h-12 text-indigo-200 absolute top-4 right-4 opacity-50" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">The Acronym</h3>
            <div className="text-6xl font-black text-slate-800 tracking-widest">{result.acronym}</div>
            <div className="w-full pt-6 space-y-2 text-left">
              {result.breakdown.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-lg text-slate-700 font-medium">
                  <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-none border border-indigo-100">
                    {result.acronym[i] || item.charAt(0)}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Visual Hook */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4" /> Visual Hook
              </h4>
              <p className="text-slate-700 leading-relaxed italic">
                "{result.visualHook}"
              </p>
            </div>

            {/* Catchphrase */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-md text-white">
              <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wide flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4" /> Catchphrase
              </h4>
              <p className="text-xl font-bold font-serif leading-tight">
                "{result.catchphrase}"
              </p>
            </div>
          </div>

        </div>
      )}

      {!result && !loading && (
        <div className="text-center text-slate-400 pt-8">
          <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm">Enter your rules above to generate magic.</p>
        </div>
      )}
    </div>
  );
};