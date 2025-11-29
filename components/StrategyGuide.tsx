import React from 'react';
import { Brain, Layers, Repeat, PenTool, Mic, CheckSquare } from 'lucide-react';

const StrategyCard = ({ icon: Icon, title, description, steps, why }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-100 transition-colors">
    <div className="flex items-start gap-4 mb-4">
      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-serif font-bold text-slate-900 text-lg">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mt-1">{description}</p>
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-lg">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Implementation</h4>
        <ul className="space-y-2">
          {steps.map((step: string, i: number) => (
            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 flex-none" />
              {step}
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">The Science</h4>
        <p className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-3">
          "{why}"
        </p>
      </div>
    </div>
  </div>
);

export const StrategyGuide: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-slate-900">Learning Science Framework</h2>
        <p className="text-slate-500 mt-3">Pass the bar by working smarter, not harder. These evidence-based techniques are built into the core of this operating system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StrategyCard 
          icon={Brain}
          title="Active Recall"
          description="The gold standard of learning. Force retrieval from memory without prompts."
          steps={[
            "Close your notes before defining a rule.",
            "Write outline segments from memory.",
            "Use the Feynman Technique: Explain it aloud to an imaginary 5-year-old."
          ]}
          why="Retrieval effort strengthens neural pathways more than re-reading. The struggle is where the learning happens."
        />

        <StrategyCard 
          icon={Repeat}
          title="Spaced Repetition"
          description="Review material at increasing intervals to combat the forgetting curve."
          steps={[
            "Review new rules after 1 day, 3 days, 1 week, 2 weeks.",
            "Use adaptive MBE sets to track spaced repetition.",
            "Prioritize weak subjects daily, strong subjects weekly."
          ]}
          why="Ebbinghaus Forgetting Curve shows memory decays exponentially unless interrupted by retrieval."
        />

        <StrategyCard 
          icon={Layers}
          title="Interleaving"
          description="Mix subjects during study sessions instead of blocking by topic."
          steps={[
            "Do not study Torts for 8 hours straight.",
            "Mix: 1hr Torts essay, 1hr Contracts MBE, 1hr Evidence review.",
            "Force your brain to constantly switch contexts."
          ]}
          why="Blocked practice creates a false sense of mastery. Interleaving improves discrimination between concepts."
        />

        <StrategyCard 
          icon={PenTool}
          title="Whiteboarding & Diagramming"
          description="Visual and kinesthetic encoding for complex frameworks."
          steps={[
            "Draw flowcharts for Jurisdiction or Hearsay.",
            "Map out the parties and relationships in fact patterns.",
            "Physically stand up and draw while talking."
          ]}
          why="Dual coding theory: Combining verbal and visual information enhances memory storage."
        />
        
        <StrategyCard 
          icon={Mic}
          title="Elaborative Interrogation"
          description="Ask 'Why?' and 'How?' for every black letter rule."
          steps={[
            "Connect new rules to existing knowledge.",
            "Ask: Why does this exception exist? What policy does it serve?",
            "Generate your own hypothetical examples."
          ]}
          why="Deep processing creates more retrieval cues than shallow memorization."
        />

        <StrategyCard 
          icon={CheckSquare}
          title="Strategic MBE Practice"
          description="Use multiple choice questions as your primary active recall engine."
          steps={[
            "Do small sets (10-15 qs) frequently throughout the day.",
            "Review *every* answer choice, especially for questions you got right.",
            "Use MBEs to test rule distinctions, not just for score."
          ]}
          why="Testing effect: Taking a test on material enhances long-term retention more than spending the same amount of time studying it."
        />
      </div>
    </div>
  );
};