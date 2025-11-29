import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { EssayFeedback } from '../types';
import { SUBJECTS } from '../constants';
import { PenTool, Send, Loader2, RefreshCw, AlertTriangle, PlayCircle } from 'lucide-react';

export const EssayLab: React.FC = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(SUBJECTS[0].id);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingQ, setGeneratingQ] = useState(false);

  const handleGenerateQuestion = async () => {
    setGeneratingQ(true);
    const subName = SUBJECTS.find(s => s.id === selectedSubjectId)?.name || "Law";
    const q = await GeminiService.generateQuestion(subName);
    setQuestion(q);
    setGeneratingQ(false);
    setFeedback(null);
  };

  const handleGrade = async () => {
    if (!question || !answer) return;
    setLoading(true);
    const subName = SUBJECTS.find(s => s.id === selectedSubjectId)?.name || "Law";
    try {
      const result = await GeminiService.gradeEssay(subName, question, answer);
      setFeedback(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Input Section */}
      <div className="flex-1 flex flex-col gap-4 h-[calc(100vh-140px)]">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex-none">
          <div className="flex gap-4 mb-4">
             <select 
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button 
              onClick={handleGenerateQuestion}
              disabled={generatingQ}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
            >
              {generatingQ ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Generate Prompt
            </button>
          </div>
          <textarea
            className="w-full h-24 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Question prompt will appear here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide flex justify-between items-center">
            <span>Your Answer</span>
            <span className="text-slate-400">{answer.split(' ').filter(w => w.length > 0).length} words</span>
          </div>
          <textarea
            className="flex-1 p-6 w-full resize-none focus:outline-none font-serif text-slate-800 leading-relaxed"
            placeholder="Begin your analysis here. Remember: IRAC format."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              onClick={handleGrade}
              disabled={loading || !answer || !question}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit for Grading
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className={`lg:w-[400px] flex-none bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-140px)] transition-all ${feedback ? 'opacity-100' : 'opacity-50 grayscale'}`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-serif font-bold text-slate-800">AI Grader</h3>
        </div>
        
        {!feedback && !loading && (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
             <PenTool className="w-12 h-12 mb-4 opacity-20" />
             <p className="text-sm">Submit your essay to receive detailed feedback, scoring, and rewritten paragraphs.</p>
           </div>
        )}

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm text-slate-500">Comparing against rubric...</p>
            </div>
          </div>
        )}

        {feedback && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Score</span>
              <span className={`text-3xl font-bold ${feedback.score >= 65 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {feedback.score}<span className="text-sm text-slate-400 font-normal">/100</span>
              </span>
            </div>

            {/* Missed Issues */}
            {feedback.missedIssues.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <h4 className="text-red-800 text-xs font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-3 h-3" /> Missed Issues
                </h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {feedback.missedIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
              </div>
            )}

            {/* Strengths */}
            <div>
              <h4 className="text-emerald-600 text-xs font-bold uppercase tracking-wide mb-2">Strengths</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {feedback.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">✓</span> {s}</li>)}
              </ul>
            </div>

             {/* Weaknesses */}
             <div>
              <h4 className="text-amber-600 text-xs font-bold uppercase tracking-wide mb-2">Areas for Improvement</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {feedback.weaknesses.map((w, i) => <li key={i} className="flex gap-2"><span className="text-amber-500">!</span> {w}</li>)}
              </ul>
            </div>

            {/* Model Rewrite */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
               <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
                 <PlayCircle className="w-3 h-3" /> Model Analysis (Rewritten)
               </h4>
               <p className="text-sm text-slate-700 italic leading-relaxed">"{feedback.modelParagraph}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
