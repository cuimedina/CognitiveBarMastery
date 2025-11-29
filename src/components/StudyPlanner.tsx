import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Settings, TrendingUp, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { WeeklyPlan } from '../types';
import { GeminiService } from '../services/geminiService';

const PHASES = [
  { name: 'Foundation', color: 'bg-blue-500', percent: 0.25, desc: 'Rule memorization & outlining' },
  { name: 'Pattern Recognition', color: 'bg-indigo-500', percent: 0.25, desc: 'Issue spotting & essay analysis' },
  { name: 'Active Application', color: 'bg-purple-500', percent: 0.30, desc: 'Timed essays & MBE drills' },
  { name: 'Refinement', color: 'bg-emerald-500', percent: 0.20, desc: 'Simulation & weakness targeting' },
];

export const StudyPlanner: React.FC = () => {
  // Dates
  const [startDate, setStartDate] = useState('2026-03-01');
  const [examDate, setExamDate] = useState('2026-07-29');
  
  // Hours
  const [partTimeHours, setPartTimeHours] = useState(15);
  const [fullTimeHours, setFullTimeHours] = useState(40);
  
  // Logic: Weeks before exam to switch to full time
  const [weeksFullTime, setWeeksFullTime] = useState(10);

  const [selectedWeek, setSelectedWeek] = useState<WeeklyPlan | null>(null);
  const [aiSchedule, setAiSchedule] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Generate Timeline
  const schedule = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(examDate);
    const weeks: WeeklyPlan[] = [];
    
    // Calculate total weeks
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)); 
    
    // Phase boundaries
    const phase1End = Math.floor(totalWeeks * PHASES[0].percent);
    const phase2End = phase1End + Math.floor(totalWeeks * PHASES[1].percent);
    const phase3End = phase2End + Math.floor(totalWeeks * PHASES[2].percent);

    for (let i = 0; i < totalWeeks; i++) {
      const currentWeekStart = new Date(start);
      currentWeekStart.setDate(start.getDate() + (i * 7));
      
      const weeksRemaining = totalWeeks - i;
      const isFullTime = weeksRemaining <= weeksFullTime;
      const hours = isFullTime ? fullTimeHours : partTimeHours;

      let phase = PHASES[0];
      if (i >= phase1End) phase = PHASES[1];
      if (i >= phase2End) phase = PHASES[2];
      if (i >= phase3End) phase = PHASES[3];

      weeks.push({
        weekNumber: i + 1,
        startDate: currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        phase: phase.name,
        hours: hours,
        focus: phase.desc,
        isFullTime
      });
    }
    return weeks;
  }, [startDate, examDate, partTimeHours, fullTimeHours, weeksFullTime]);

  const totalHours = schedule.reduce((acc, curr) => acc + curr.hours, 0);

  const handleGenerateAiSchedule = async (week: WeeklyPlan) => {
    setLoadingAi(true);
    setAiSchedule('');
    try {
      // Determine subjects based on phase (simplified logic)
      let subjects = [];
      if (week.phase === 'Foundation') subjects = ['Torts', 'Contracts'];
      else if (week.phase === 'Pattern Recognition') subjects = ['Civ Pro', 'Evidence'];
      else subjects = ['Mixed MBE', 'Essay Practice'];

      const result = await GeminiService.generateWeeklySchedule(week.phase, week.hours, subjects);
      setAiSchedule(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Controls Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-8 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bar Exam Date</label>
          <input 
            type="date" 
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex justify-between">
            <span>Ramp Up Strategy</span>
            <span className="text-indigo-600">Switch {weeksFullTime} weeks out</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max={schedule.length} 
            value={weeksFullTime} 
            onChange={(e) => setWeeksFullTime(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>All Part-Time</span>
            <span>All Full-Time</span>
          </div>
        </div>

        <div className="flex gap-4">
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Part-Time Hrs</label>
             <input type="number" value={partTimeHours} onChange={e => setPartTimeHours(parseInt(e.target.value))} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm" />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full-Time Hrs</label>
             <input type="number" value={fullTimeHours} onChange={e => setFullTimeHours(parseInt(e.target.value))} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm" />
           </div>
        </div>

        <div className="bg-slate-900 text-white px-6 py-2 rounded-lg flex flex-col items-center justify-center">
          <span className="text-xs text-slate-400 uppercase font-bold">Total Prep</span>
          <span className="text-xl font-bold font-serif">{totalHours} hrs</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Timeline List */}
        <div className="w-full md:w-1/2 lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-y-auto">
          <div className="p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10 flex justify-between items-center">
            <h3 className="font-serif font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Strategic Roadmap
            </h3>
            <span className="text-xs text-slate-500">{schedule.length} Weeks Total</span>
          </div>
          <div className="p-4 space-y-3">
            {schedule.map((week) => (
              <div 
                key={week.weekNumber}
                onClick={() => { setSelectedWeek(week); handleGenerateAiSchedule(week); }}
                className={`group cursor-pointer rounded-xl border transition-all duration-200 p-4 relative overflow-hidden ${selectedWeek?.weekNumber === week.weekNumber ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
              >
                {/* Visual Progress Bar Background */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  week.phase === 'Foundation' ? 'bg-blue-500' :
                  week.phase === 'Pattern Recognition' ? 'bg-indigo-500' :
                  week.phase === 'Active Application' ? 'bg-purple-500' : 'bg-emerald-500'
                }`} />

                <div className="flex justify-between items-start pl-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900">Week {week.weekNumber}</span>
                      <span className="text-xs text-slate-500 font-mono">({week.startDate})</span>
                      {week.isFullTime && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Full Intensity</span>}
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        week.phase === 'Foundation' ? 'bg-blue-500' :
                        week.phase === 'Pattern Recognition' ? 'bg-indigo-500' :
                        week.phase === 'Active Application' ? 'bg-purple-500' : 'bg-emerald-500'
                      }`} />
                      {week.phase}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 pl-4">{week.focus}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-800">{week.hours}</span>
                    <span className="text-xs text-slate-400 block">hours</span>
                  </div>
                </div>
                <ChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity ${selectedWeek?.weekNumber === week.weekNumber ? 'opacity-100 text-indigo-600' : ''}`} />
              </div>
            ))}
          </div>
        </div>

        {/* AI Day Planner Detail */}
        <div className="w-full md:w-1/2 lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-serif font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              AI Daily Schedule
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedWeek ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                <Settings className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Select a week from the timeline to generate a science-backed daily plan.</p>
              </div>
            ) : loadingAi ? (
              <div className="h-full flex flex-col items-center justify-center text-indigo-600 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-medium">Designing schedule for {selectedWeek.hours} hours...</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900">Week {selectedWeek.weekNumber}</h2>
                  <p className="text-sm text-slate-500">{selectedWeek.phase} Phase</p>
                </div>
                <div className="prose prose-sm prose-indigo text-slate-600">
                  {/* Rendering simple markdown-like output */}
                  {aiSchedule.split('\n').map((line, i) => {
                    if (line.startsWith('**') || line.startsWith('#')) return <h4 key={i} className="font-bold text-slate-800 mt-4 mb-2">{line.replace(/[*#]/g, '')}</h4>;
                    if (line.startsWith('-')) return <li key={i} className="ml-4">{line.replace('-', '')}</li>;
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};