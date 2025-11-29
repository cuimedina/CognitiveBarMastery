import React, { useEffect, useState } from 'react';
import { STUDY_PHASES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Brain, Clock, Target, TrendingUp, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { GlobalSubjectStat, Prediction } from '../types';

const mockData = [
  { name: 'Civ Pro', score: 65 },
  { name: 'Torts', score: 75 },
  { name: 'Contracts', score: 55 },
  { name: 'Evidence', score: 60 },
  { name: 'Con Law', score: 45 },
  { name: 'Property', score: 50 },
];

const StatCard = ({ icon: Icon, title, value, subtext, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'overview' | 'predictions'>('overview');
  const [globalStats, setGlobalStats] = useState<GlobalSubjectStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await GeminiService.getGlobalExamStats();
        // Sort by frequency descending
        const sorted = stats.sort((a, b) => b.frequency - a.frequency);
        setGlobalStats(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (viewMode === 'predictions' && predictions.length === 0) {
      setLoadingPredictions(true);
      GeminiService.getExamPredictions()
        .then(data => setPredictions(data))
        .finally(() => setLoadingPredictions(false));
    }
  }, [viewMode, predictions.length]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-serif">Mission Control</h2>
          <p className="text-slate-500 mt-2">Current Phase: <span className="font-semibold text-indigo-600">Pattern Recognition</span> (Week 6)</p>
        </div>
        
        {/* Toggle */}
        <div className="bg-slate-200 p-1 rounded-lg flex gap-1">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'overview' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('predictions')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === 'predictions' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Predictions
          </button>
        </div>
      </header>

      {/* Stats Grid - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Activity} title="Essay Avg" value="62.5" subtext="+5 points this week" color="bg-blue-500" />
        <StatCard icon={Clock} title="Study Time" value="24h" subtext="Target: 35h/week" color="bg-emerald-500" />
        <StatCard icon={Brain} title="Issues Mastered" value="42" subtext="128 remaining" color="bg-purple-500" />
        <StatCard icon={Target} title="Next Mock" value="2 Days" subtext="Contracts & Evidence" color="bg-amber-500" />
      </div>

      {viewMode === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-6">Your Performance by Subject</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={[0, 100]} />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {mockData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score >= 65 ? '#10b981' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-slate-400 mt-4">Passing Score: 65 (Green) | Needs Work (Amber)</p>
            </div>

            {/* Global Frequency Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Historical Exam Frequency (15 Years)
                </h3>
                {loadingStats && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </div>
              
              <div className="h-64">
                {loadingStats ? (
                  <div className="h-full flex items-center justify-center text-slate-400">Loading Global Statistics...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={globalStats.slice(0, 10)} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis dataKey="subject" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} />
                      <Tooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        formatter={(value: number) => [`${value}%`, 'Appearance Rate']}
                      />
                      <Bar dataKey="frequency" radius={[0, 4, 4, 0]} barSize={20}>
                        {globalStats.slice(0, 10).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#4f46e5" fillOpacity={0.8 - (index * 0.05)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <p className="text-xs text-center text-slate-400 mt-4">Top 10 Most Tested Subjects on the California Bar Exam</p>
            </div>
          </div>

          {/* Phase Tracker */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <h3 className="text-lg font-semibold mb-4">Strategic Timeline</h3>
            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:h-full before:w-0.5 before:bg-slate-100">
              {STUDY_PHASES.map((phase) => (
                <div key={phase.id} className="relative pl-10">
                  <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 ${phase.id === 2 ? 'border-indigo-600 bg-white' : phase.id < 2 ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-100 border-slate-200'}`}>
                     {phase.id < 2 && <div className="w-2 h-2 bg-white rounded-full" />}
                     {phase.id === 2 && <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${phase.id === 2 ? 'text-indigo-600' : 'text-slate-900'}`}>{phase.name}</h4>
                    <p className="text-xs text-slate-500">{phase.weeks}</p>
                    {phase.id === 2 && (
                      <ul className="mt-2 space-y-1">
                        {phase.tasks.map((task, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-center">
                            <span className="w-1 h-1 bg-slate-400 rounded-full mr-2"></span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* Predictions View */}
          <div className="mb-6 flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-none" />
            <p><strong>Disclaimer:</strong> These are algorithmic predictions based on historical patterns (cycles). The California Bar Exam can and does test wildcards. Do not skip "Low Yield" subjects.</p>
          </div>

          {loadingPredictions ? (
            <div className="h-64 flex flex-col items-center justify-center text-indigo-600">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Analyzing exam cycles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      )}
    </div>
  );
};