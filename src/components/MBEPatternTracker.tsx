import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { MBEAnalysis } from '../types';
import { Loader2, CheckCircle, AlertTriangle, XCircle, Search, ArrowRight, Zap } from 'lucide-react';

export const MBEPatternTracker: React.FC = () => {
  const [questionText, setQuestionText] = useState('');
  const [analysis, setAnalysis] = useState<MBEAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'solid' | 'shaky' | 'missed' | null>(null);

  const handleAnalyze = async () => {
    if (!questionText) return;
    setLoading(true);
    setAnalysis(null);
    setStatus(null);
    try {
      const result = await GeminiService.analyzeMBEQuestion(questionText);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Input Section */}
      <div className="w-full md:w-1/3 flex flex-col h-[calc(100vh-140px)]">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-serif font-bold text-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              MBE Question Input
            </h3>
            <p className="text-xs text-slate-500 mt-1">Paste the full question text here to detect the pattern.</p>
          </div>
          
          <textarea
            className="flex-1 p-4 bg-white text-sm text-slate-600 resize-none focus:outline-none focus:bg-slate-50 transition-colors placeholder:text-slate-300"
            placeholder="Paste your MBE Question here..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
          
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button
              onClick={handleAnalyze}
              disabled={loading || !questionText}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Pattern...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Detect Pattern
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Output - mimicking the spreadsheet look */}
      <div className="flex-1 overflow-y-auto h-[calc(100vh-140px)]">
        {analysis ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
            {/* Header / Status Bar */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">{analysis.concept}</h2>
                <p className="text-sm text-slate-500">Pattern Detected</p>
              </div>
              
              <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                <button
                  onClick={() => setStatus('solid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    status === 'solid' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle className={`w-4 h-4 ${status === 'solid' ? 'text-emerald-600' : ''}`} />
                  Solid
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button
                  onClick={() => setStatus('shaky')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    status === 'shaky' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 ${status === 'shaky' ? 'text-amber-600' : ''}`} />
                  Shaky
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button
                  onClick={() => setStatus('missed')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    status === 'missed' ? 'bg-red-100 text-red-800' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className={`w-4 h-4 ${status === 'missed' ? 'text-red-600' : ''}`} />
                  Missed
                </button>
              </div>
            </div>

            {/* Grid Layout mimicking the sheet */}
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              
              {/* Column 1: Rule */}
              <div className="p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Rule / Concept</h4>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <p className="text-indigo-900 font-medium leading-relaxed">
                    <span className="font-bold">{analysis.concept}:</span> {analysis.definition}
                  </p>
                </div>
              </div>

              {/* Column 2: Trigger Facts */}
              <div className="p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Trigger Facts (From Question)</h4>
                <ul className="space-y-3">
                  {analysis.triggerFacts.map((fact, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <ArrowRight className="w-4 h-4 text-indigo-500 flex-none mt-0.5" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Common Traps */}
              <div className="p-6 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Common Traps</h4>
                <div className="space-y-4">
                  {analysis.commonTraps.map((trap, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-none" />
                      <p className="text-sm text-slate-600 leading-relaxed">{trap}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            <Search className="w-16 h-16 mb-4 text-slate-200" />
            <p className="text-sm">Paste a question to see the breakdown</p>
          </div>
        )}
      </div>
    </div>
  );
};