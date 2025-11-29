
export interface Subject {
  id: string;
  name: string;
  description: string;
}

export interface IssueAnalysis {
  issueName: string;
  frequency: 'High' | 'Medium' | 'Low';
  triggerFacts: string[];
  ruleFramework: string;
  commonMistakes: string[];
}

export interface GlobalSubjectStat {
  subject: string;
  frequency: number; // 0-100 percentage of appearance
  trend: 'Up' | 'Down' | 'Stable';
}

export interface Prediction {
  subject: string;
  probability: 'High' | 'Medium' | 'Low';
  reasoning: string;
  lastTested?: string;
}

export interface StudyPhase {
  id: number;
  name: string;
  weeks: string;
  focus: string;
  tasks: string[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SUBJECTS = 'SUBJECTS',
  ESSAY_LAB = 'ESSAY_LAB',
  PATTERNS = 'PATTERNS',
  STRATEGIES = 'STRATEGIES',
  PLANNER = 'PLANNER',
  RULE_MAKER = 'RULE_MAKER',
  MBE_TRACKER = 'MBE_TRACKER',
  MNEMONIC_MAKER = 'MNEMONIC_MAKER',
  CALCULATOR = 'CALCULATOR',
  PREDICTIONS = 'PREDICTIONS',
  VISUALIZER = 'VISUALIZER',
}

export interface EssayFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  missedIssues: string[];
  modelParagraph: string;
}

export interface ExamQuestionAnalysis {
  number: string;
  subject: string;
  issues: string[];
  triggerFacts: string[];
  rulesExtracted: string[];
}

export interface ExamAnalysisResult {
  examDate: string;
  questions: ExamQuestionAnalysis[];
}

export interface WeeklyPlan {
  weekNumber: number;
  startDate: string;
  phase: string;
  hours: number;
  focus: string;
  isFullTime: boolean;
}

export interface RuleGeneration {
  topic: string;
  ruleStatement: string; // "Bar Ready" memorization block
  elements: string[];
  pastExams: string[]; // e.g. ["July 2012", "Feb 2015"]
  usageNotes: string;
}

export interface MBEAnalysis {
  concept: string;
  definition: string;
  triggerFacts: string[];
  commonTraps: string[];
}

export interface MnemonicResult {
  acronym: string;
  breakdown: string[]; // Array of strings like "S - Specific Intent"
  visualHook: string; // A description of a mental image
  catchphrase: string; // A memorable phrase using the words
}
