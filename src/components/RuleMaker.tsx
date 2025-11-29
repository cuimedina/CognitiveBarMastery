import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { RuleGeneration } from '../types';
import { BookMarked, Search, Loader2, History, List, AlertCircle, Copy, Check } from 'lucide-react';

export const RuleMaker: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [rule, setRule] = useState<RuleGeneration | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setRule(null);
    setCopied(false);
    try {
      const result = await GeminiService.generateRuleWithHistory(topic);
      setRule(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!rule) return;
    navigator.clipboard.writeText(rule.ruleStatement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center justify-start max-w-4xl mx-auto space-y-8 p-6 pb-20">
      
      {/* Search Header */}
      <div className="w-full text-center space-y-6">
        <h2 className="text-3xl font-serif font-bold text-slate-900">California Rule Book</h2>
        <p className="text-slate-500">Generate exam-tested rules with historical context for your outline.</p>
        
        <div className="relative max-w-xl mx-auto">
          <input 
            type="text"
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
            placeholder="Enter a legal topic (e.g. 'Easement by Prescription')..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button 
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate'}
          </button>
        </div>
      </div>

      {/* Result Card */}
      {rule && (
        <div className="w-full bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-fade-in">
          <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 capitalize">{rule.topic}</h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Bar Ready</span>
          </div>

          <div className="p-8 space-y-8">
            
            {/* The Rule */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <BookMarked className="w-4 h-4" /> Rule Statement
                </h4>
                <button 
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
                <p className="text-lg text-slate-800 leading-relaxed font-serif">
                  {rule.ruleStatement}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Elements */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <List className="w-4 h-4" /> Elements Breakdown
                </h4>
                <ul className="space-y-3">
                  {rule.elements.map((el, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-indigo-600 flex-none shadow-sm">
                        {i + 1}
                      </span>
                      <span className="mt-1">{el}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* History */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <History className="w-4 h-4" /> Exam History
                </h4>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 mb-3">Tested in the following sessions:</p>
                  <div className="flex flex-wrap gap-2">
                    {rule.pastExams.map((exam, i) => (
                      <span key={i} className="bg-white px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
                        {exam}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Usage Notes */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mt-4">
                   <h5 className="text-amber-800 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
                     <AlertCircle className="w-3 h-3" /> Usage Note
                   </h5>
                   <p className="text-xs text-amber-900 leading-relaxed">
                     {rule.usageNotes}
                   </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {!rule && !loading && (
        <div className="text-center text-slate-400 pt-12">
          <BookMarked className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm">Rules you generate will appear here.</p>
        </div>
      )}

    </div>
  );
};