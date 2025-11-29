import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { ExamAnalysisResult } from '../types';
import { FileText, Loader2, Zap, ArrowRight, BookOpen, AlertTriangle, Languages } from 'lucide-react';

export const PatternAnalysis: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<ExamAnalysisResult | null>(null);
  const [plainEnglish, setPlainEnglish] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'plain'>('standard');

  const handleAnalyze = async () => {
    if (!inputText) return;
    setLoading(true);
    setPlainEnglish(null);
    try {
      const result = await GeminiService.analyzeExamDump(inputText);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!analysis) return;
    setViewMode('plain');
    if (plainEnglish) return; // Already loaded

    setLoadingTranslation(true);
    try {
      const result = await GeminiService.getPlainEnglishExplanation(JSON.stringify(analysis));
      setPlainEnglish(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTranslation(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Input Section */}
      <div className={`w-full md:w-1/3 flex flex-col h-[calc(100vh-140px)] transition-all duration-500 ${analysis ? 'md:w-1/4' : 'md:w-1/2 mx-auto'}`}>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-serif font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Exam Ingestion
            </h3>
            <p className="text-xs text-slate-500 mt-1">Paste raw OCR text from past exams to extract the "DNA" of the test.</p>
          </div>
          
          <textarea
            className="flex-1 p-4 bg-white text-xs font-mono text-slate-600 resize-none focus:outline-none focus:bg-slate-50 transition-colors"
            placeholder="PASTE EXAM TEXT HERE...&#10;&#10;Example:&#10;JULY 2012&#10;ESSAY QUESTIONS...&#10;&#10;Question 1&#10;Pam and Patrick are residents of State A..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button
              onClick={handleAnalyze}
              disabled={loading || !inputText}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Decoding Exam DNA...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Analyze Patterns
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {analysis && (
        <div className="flex-1 flex flex-col h-[calc(100vh-140px)] animate-fade-in">
          <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-md mb-6 flex justify-between items-end">
            <div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Exam Session Detected</p>
              <h2 className="text-3xl font-serif font-bold">{analysis.examDate}</h2>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right">
                <span className="text-4xl font-bold">{analysis.questions.length}</span>
                <span className="text-indigo-200 text-sm block">Essays Analyzed</span>
              </div>
            </div>
          </div>

          {/* Toggle View */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setViewMode('standard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'standard' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Legal Analysis
            </button>
            <button 
              onClick={handleTranslate}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'plain' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Languages className="w-4 h-4" />
              Plain English Breakdown
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {viewMode === 'standard' ? (
              <div className="space-y-6">
                {analysis.questions.map((q, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                          {q.number}
                        </span>
                        <h3 className="font-bold text-slate-800">{q.subject}</h3>
                      </div>
                      <BookOpen className="w-4 h-4 text-slate-300" />
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Trigger Facts */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" /> Fact Pattern Triggers
                        </h4>
                        <div className="space-y-2">
                          {q.triggerFacts.map((fact, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-slate-700 bg-amber-50 p-2 rounded border border-amber-100">
                              <ArrowRight className="w-4 h-4 text-amber-500 flex-none mt-0.5" />
                              "{fact}"
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Issues & Rules */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Issues Tested</h4>
                          <div className="flex flex-wrap gap-2">
                            {q.issues.map((issue, i) => (
                              <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>

                        {q.rulesExtracted.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Black Letter Law (Extracted)</h4>
                            <ul className="space-y-2">
                              {q.rulesExtracted.map((rule, i) => (
                                <li key={i} className="text-sm text-slate-600 border-l-2 border-emerald-400 pl-3 italic">
                                  "{rule}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 min-h-[400px]">
                {loadingTranslation ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                    <p>Translating legal concepts to plain English...</p>
                  </div>
                ) : (
                  <div className="prose prose-slate max-w-none">
                    <h3 className="font-serif text-2xl font-bold text-slate-800 mb-6">The "Why" Behind the Exam</h3>
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                      {plainEnglish}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {!analysis && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-4 md:m-0">
          <Zap className="w-16 h-16 mb-4 text-slate-200" />
          <p className="text-sm">Analysis results will appear here</p>
        </div>
      )}
    </div>
  );
};