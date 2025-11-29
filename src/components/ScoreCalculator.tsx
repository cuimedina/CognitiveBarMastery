import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

export const ScoreCalculator: React.FC = () => {
  // State for inputs
  const [mbePercent, setMbePercent] = useState(65);
  const [essays, setEssays] = useState<number[]>([60, 60, 60, 60, 60]);
  const [ptScore, setPtScore] = useState(60);

  // Constants for CA Bar
  const PASSING_SCORE = 1390;
  
  // Scoring Logic (Approximation based on standard scaling)
  // Note: Actual scaling varies by exam difficulty.
  // MBE: ~50% of total. 
  // Written: ~50% of total. 5 Essays + 1 PT (worth 2x essay). Total units = 7.
  
  const calculations = useMemo(() => {
    // 1. Calculate Estimated Scaled MBE
    // Formula approximation: Linear fit where 65% is roughly 1400 scaled pts (on 2000 scale)
    // 1390 / 2 = 695 required per section.
    // 65% correct is often considered the "safe zone" for passing MBE.
    const estimatedMbeScaled = Math.round((mbePercent * 5.8) + 1010); 

    // 2. Calculate Written Raw Average
    const essaySum = essays.reduce((a, b) => a + b, 0);
    const weightedPt = ptScore * 2;
    const rawTotal = essaySum + weightedPt;
    const rawAvg = rawTotal / 7;

    // 3. Calculate Estimated Scaled Written
    // Formula approximation: 60-63 avg is usually passing (1390 range).
    // Slope approx: 4.8 points per raw point + base.
    const estimatedWrittenScaled = Math.round((rawAvg * 4.8) + 1095);

    const totalScore = estimatedMbeScaled * 0.5 + estimatedWrittenScaled * 0.5;
    
    return {
      mbeScaled: Math.round(estimatedMbeScaled * 0.5), // Contribution (50%)
      writtenScaled: Math.round(estimatedWrittenScaled * 0.5), // Contribution (50%)
      totalScore: Math.round(totalScore),
      rawAvg: rawAvg.toFixed(1),
      isPassing: totalScore >= PASSING_SCORE
    };
  }, [mbePercent, essays, ptScore]);

  const handleEssayChange = (index: number, value: number) => {
    const newEssays = [...essays];
    newEssays[index] = value;
    setEssays(newEssays);
  };

  const chartData = [
    { name: 'Your Score', mbe: calculations.mbeScaled, written: calculations.writtenScaled },
  ];

  return (
    <div className="h-full flex flex-col items-center max-w-6xl mx-auto space-y-8 p-6 pb-20 overflow-y-auto">
      <div className="text-center max-w-2xl">
        <h2 className="text-3xl font-serif font-bold text-slate-900 flex items-center justify-center gap-3">
          <Calculator className="w-8 h-8 text-indigo-600" />
          Score Scenario Planner
        </h2>
        <p className="text-slate-500 mt-2">
          Use this to define your approach. See how a strong PT can save a weak essay, or how MBEs buffer the written portion. 
          <span className="block text-xs mt-1 text-slate-400">*Based on California Bar Exam weighting (50% MBE / 50% Written, PT=2x). Approximations only.</span>
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Controls */}
        <div className="space-y-6">
          
          {/* MBE Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-slate-800">MBE Performance</h3>
              <span className="text-indigo-600 font-bold">{mbePercent}% Correct</span>
            </div>
            <input 
              type="range" min="30" max="100" step="1" 
              value={mbePercent}
              onChange={(e) => setMbePercent(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>Struggling (50%)</span>
              <span>Passing (~65%)</span>
              <span>Mastery (80%)</span>
            </div>
          </div>

          {/* Written Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-6 flex justify-between">
              <span>Written Portion</span>
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">Raw Avg: {calculations.rawAvg}</span>
            </h3>
            
            <div className="space-y-6">
              {/* Essays */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase">5 Essays (1-Hour Each)</p>
                <div className="grid grid-cols-5 gap-2">
                  {essays.map((score, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden group">
                        <div 
                          className={`absolute bottom-0 w-full transition-all duration-300 ${score < 55 ? 'bg-red-400' : score < 65 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                          style={{ height: `${score}%` }}
                        />
                        <input 
                          type="range" min="40" max="100" step="5"
                          value={score}
                          onChange={(e) => handleEssayChange(i, parseInt(e.target.value))}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          title={`Essay ${i+1}: ${score}`}
                        />
                        <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold text-white drop-shadow-md">
                          {score}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">Q{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PT */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    Performance Test (2x Weight)
                  </p>
                  <span className={`text-sm font-bold ${ptScore >= 65 ? 'text-emerald-600' : 'text-slate-600'}`}>{ptScore}</span>
                </div>
                <input 
                  type="range" min="40" max="100" step="5"
                  value={ptScore}
                  onChange={(e) => setPtScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Visualization */}
        <div className="flex flex-col gap-6">
          <div className={`flex-1 bg-white p-8 rounded-xl shadow-lg border-2 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 ${calculations.isPassing ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30'}`}>
            
            <div className="text-center z-10">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Scaled Score</p>
              <div className="text-6xl font-black text-slate-900 mb-2 font-serif">
                {calculations.totalScore}
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${calculations.isPassing ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {calculations.isPassing ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {calculations.isPassing ? 'PASSING' : 'BELOW PASSING'}
              </div>
            </div>

            {/* Difference Indicator */}
            <div className="mt-8 text-center">
              <span className="text-slate-500 text-sm">Target: 1390</span>
              <div className={`text-sm font-medium mt-1 ${calculations.totalScore >= 1390 ? 'text-emerald-600' : 'text-red-500'}`}>
                {calculations.totalScore >= 1390 ? `+${calculations.totalScore - 1390} Buffer` : `${calculations.totalScore - 1390} Deficit`}
              </div>
            </div>

            {/* Chart */}
            <div className="w-full h-48 mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" barSize={40}>
                  <XAxis type="number" domain={[0, 2000]} hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip cursor={false} content={<></>} />
                  <ReferenceLine x={1390} stroke="#64748b" strokeDasharray="3 3" label={{ position: 'top', value: 'PASS (1390)', fill: '#64748b', fontSize: 10 }} />
                  <Bar dataKey="mbe" stackId="a" fill="#4f46e5" radius={[4, 0, 0, 4]} />
                  <Bar dataKey="written" stackId="a" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2 text-[10px] uppercase font-bold text-slate-400">
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-600 rounded-full" /> MBE Contribution</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-full" /> Written Contribution</div>
              </div>
            </div>

          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Analysis
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {calculations.isPassing 
                ? "Great job. You have built a passing buffer. Focus on maintaining this consistency."
                : mbePercent < 60 
                  ? "Your MBE score is dragging you down. Increasing MBE accuracy by just 5% adds ~30 scaled points."
                  : ptScore < 60
                    ? "The PT is killing your score. It is worth double. Raising your PT to a 65 is equivalent to raising two separate essays by 5 points each."
                    : "You are close. Small improvements in issue spotting on 1-2 essays will push you over the line."
              }
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};