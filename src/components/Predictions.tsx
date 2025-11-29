import React, { useEffect, useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { Prediction } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

export const Predictions: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GeminiService.getExamPredictions()
      .then(data => setPredictions(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full flex flex-col animate-fade-in">
        {/* Header */}
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 font-serif">Exam Predictions</h2>
            <p className="text-slate-500 mt-2">AI-driven forecast based on historical subject frequency cycles.</p>
        </div>

        {/* Disclaimer */}
        <div className="mb-6 flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm">
        <AlertCircle className="w-5 h-5 flex-none" />
        <p><strong>Disclaimer:</strong> These are algorithmic predictions based on historical patterns (cycles). The California Bar Exam can and does test wildcards. Do not skip "Low Yield" subjects.</p>
        </div>

        {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-indigo-600">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Analyzing exam cycles...</p>
        </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20">
            {/* High Probability */}
            <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                High Yield (Overdue)
            </h3>
            {predictions.filter(p => p.probability === 'High').map((p, i) => (
                <div key={i} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 border-y border-r border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800">{p.subject}</h4>
                    {p.lastTested && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">Last: {p.lastTested}</span>}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{p.reasoning}</p>
                </div>
            ))}
            </div>

            {/* Medium Probability */}
            <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Medium Probability
            </h3>
            {predictions.filter(p => p.probability === 'Medium').map((p, i) => (
                <div key={i} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-amber-500 border-y border-r border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800">{p.subject}</h4>
                    {p.lastTested && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">Last: {p.lastTested}</span>}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{p.reasoning}</p>
                </div>
            ))}
            </div>

            {/* Low Probability */}
            <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Low Yield (Recently Tested)
            </h3>
            {predictions.filter(p => p.probability === 'Low').map((p, i) => (
                <div key={i} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 border-y border-r border-slate-100 hover:shadow-md transition-shadow opacity-80">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800">{p.subject}</h4>
                    {p.lastTested && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">Last: {p.lastTested}</span>}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{p.reasoning}</p>
                </div>
            ))}
            </div>
        </div>
        )}
    </div>
  );
};