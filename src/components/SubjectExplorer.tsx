import React, { useState, useMemo } from 'react';
import { Subject, IssueAnalysis } from '../types';
import { SUBJECTS } from '../constants';
import { GeminiService } from '../services/geminiService';
import { Search, ChevronRight, AlertCircle, CheckCircle, Loader2, PieChart as IconPieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export const SubjectExplorer: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [analysis, setAnalysis] = useState<IssueAnalysis[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubjectClick = async (subject: Subject) => {
    setSelectedSubject(subject);
    setAnalysis(null);
    setLoading(true);
    try {
      const data = await GeminiService.analyzeSubject(subject.name);
      setAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!analysis) return [];
    // Map frequency string to number for charting
    return analysis.map(item => ({
      name: item.issueName.length > 15 ? item.issueName.substring(0, 15) + '...' : item.issueName,
      fullName: item.issueName,
      value: item.frequency === 'High' ? 100 : item.frequency === 'Medium' ? 60 : 30,
      frequency: item.frequency
    }));
  }, [analysis]);

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Subject List Sidebar */}
      <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-serif font-bold text-slate-800">Subjects</h3>
          <p className="text-xs text-slate-500">Select to reveal exam patterns</p>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {SUBJECTS.map((sub) => (
            <button
              key={sub.id}
              onClick={() => handleSubjectClick(sub)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center justify-between group ${
                selectedSubject?.id === sub.id
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="block">{sub.name}</span>
                <span className="text-xs text-slate-400 font-normal truncate max-w-[200px] block opacity-0 group-hover:opacity-100 transition-opacity">
                  {sub.description}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 ${selectedSubject?.id === sub.id ? 'text-indigo-500' : 'text-slate-300'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Analysis View */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        {!selectedSubject ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <Search className="w-16 h-16 mb-4 text-slate-200" />
            <h3 className="text-lg font-medium text-slate-600">Select a Subject</h3>
            <p className="max-w-md mt-2">Choose a subject from the left to access AI-driven analysis of historical exam patterns, trigger facts, and rule frameworks.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">{selectedSubject.name}</h2>
                <p className="text-sm text-slate-500">AI Pattern Recognition</p>
              </div>
              {loading && <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading ? (
                 <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="animate-pulse flex space-x-4">
                       <div className="flex-1 space-y-4 py-1">
                         <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                         <div className="space-y-2">
                           <div className="h-4 bg-slate-200 rounded"></div>
                           <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                         </div>
                       </div>
                     </div>
                   ))}
                   <p className="text-center text-sm text-slate-400 italic mt-8">Analyzing 15+ years of exams...</p>
                 </div>
              ) : analysis ? (
                <>
                  {/* Issue Chart */}
                  <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <IconPieChart className="w-4 h-4" /> Relative Importance of Topics
                    </h4>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                          <Tooltip 
                            cursor={{fill: 'transparent'}}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg">
                                    <p className="font-bold">{data.fullName}</p>
                                    <p>Frequency: {data.frequency}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.frequency === 'High' ? '#ef4444' : entry.frequency === 'Medium' ? '#f59e0b' : '#3b82f6'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* List of Issues */}
                  {analysis.map((issue, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                      <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          {idx + 1}. {issue.issueName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          issue.frequency === 'High' ? 'bg-red-100 text-red-700' :
                          issue.frequency === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {issue.frequency} Yield
                        </span>
                      </div>
                      <div className="p-6 space-y-6">
                        
                        {/* Triggers */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Trigger Facts
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {issue.triggerFacts.map((trigger, tIdx) => (
                              <span key={tIdx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm border border-indigo-100">
                                "{trigger}"
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Framework */}
                        <div className="bg-slate-900 rounded-lg p-4 text-slate-300 font-mono text-sm relative">
                          <div className="absolute top-2 right-2 text-xs text-slate-500 font-sans">Analytical Framework</div>
                          <pre className="whitespace-pre-wrap font-sans">{issue.ruleFramework}</pre>
                        </div>

                        {/* Mistakes */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3" /> Common Pitfalls
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                            {issue.commonMistakes.map((mistake, mIdx) => (
                              <li key={mIdx}>{mistake}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center text-red-500">Failed to load analysis.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};