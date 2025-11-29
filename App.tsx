
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { SubjectExplorer } from './components/SubjectExplorer';
import { EssayLab } from './components/EssayLab';
import { PatternAnalysis } from './components/PatternAnalysis';
import { StrategyGuide } from './components/StrategyGuide';
import { StudyPlanner } from './components/StudyPlanner';
import { RuleMaker } from './components/RuleMaker';
import { MBEPatternTracker } from './components/MBEPatternTracker';
import { MnemonicMaker } from './components/MnemonicMaker';
import { Predictions } from './components/Predictions';
import { ScoreCalculator } from './components/ScoreCalculator';
import { ConceptVisualizer } from './components/ConceptVisualizer';
import { AppView } from './types';
import { LayoutDashboard, BookOpen, PenTool, Lightbulb, GraduationCap, Microscope, Calendar, Bookmark, CheckSquare, BrainCircuit, Sparkles, Calculator, Video } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard />;
      case AppView.SUBJECTS: return <SubjectExplorer />;
      case AppView.ESSAY_LAB: return <EssayLab />;
      case AppView.PATTERNS: return <PatternAnalysis />;
      case AppView.STRATEGIES: return <StrategyGuide />;
      case AppView.PLANNER: return <StudyPlanner />;
      case AppView.RULE_MAKER: return <RuleMaker />;
      case AppView.MBE_TRACKER: return <MBEPatternTracker />;
      case AppView.MNEMONIC_MAKER: return <MnemonicMaker />;
      case AppView.PREDICTIONS: return <Predictions />;
      case AppView.CALCULATOR: return <ScoreCalculator />;
      case AppView.VISUALIZER: return <ConceptVisualizer />;
      default: return <Dashboard />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex-shrink-0 flex flex-col text-white">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg tracking-wide">Bar Mastery</h1>
            <p className="text-xs text-slate-400">OS v1.0</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Menu</div>
          <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem view={AppView.PLANNER} icon={Calendar} label="Adaptive Planner" />
          <NavItem view={AppView.SUBJECTS} icon={BookOpen} label="Subject Mastery" />
          <NavItem view={AppView.RULE_MAKER} icon={Bookmark} label="Rule Book" />
          <NavItem view={AppView.MNEMONIC_MAKER} icon={BrainCircuit} label="Mnemonic Maker" />
          <NavItem view={AppView.MBE_TRACKER} icon={CheckSquare} label="MBE Pattern Tracker" />
          <NavItem view={AppView.PATTERNS} icon={Microscope} label="Exam Patterns" />
          <NavItem view={AppView.ESSAY_LAB} icon={PenTool} label="Essay Lab" />
          <NavItem view={AppView.PREDICTIONS} icon={Sparkles} label="Predictions" />
          <NavItem view={AppView.CALCULATOR} icon={Calculator} label="Score Calculator" />
          <NavItem view={AppView.VISUALIZER} icon={Video} label="Concept Visualizer" />
          
          <div className="mt-8 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Resources</div>
          <NavItem view={AppView.STRATEGIES} icon={Lightbulb} label="Learning Science" />
        </nav>

        <div className="p-4 bg-slate-800 m-4 rounded-xl">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Daily Tip</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            "Don't just read the outline. Close the book and write the rule for Battery from memory. Fail? Good. Look it up and try again."
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 font-serif">
            {currentView === AppView.DASHBOARD && 'Overview'}
            {currentView === AppView.SUBJECTS && 'Subject Analysis'}
            {currentView === AppView.ESSAY_LAB && 'Active Practice Lab'}
            {currentView === AppView.PATTERNS && 'Pattern Recognition'}
            {currentView === AppView.STRATEGIES && 'Evidence-Based Strategies'}
            {currentView === AppView.PLANNER && 'Adaptive Study Schedule'}
            {currentView === AppView.RULE_MAKER && 'Rule Book'}
            {currentView === AppView.MBE_TRACKER && 'MBE Pattern Tracker'}
            {currentView === AppView.MNEMONIC_MAKER && 'Mnemonic Generator'}
            {currentView === AppView.PREDICTIONS && 'Exam Predictions'}
            {currentView === AppView.CALCULATOR && 'Score Scenario Planner'}
            {currentView === AppView.VISUALIZER && 'Legal Concept Visualizer'}
          </h2>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden md:block">
               <p className="text-sm font-medium text-slate-900">John Doe</p>
               <p className="text-xs text-slate-500">JD Candidate</p>
             </div>
             <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">JD</div>
          </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-auto p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
