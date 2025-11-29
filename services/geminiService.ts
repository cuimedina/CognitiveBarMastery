import { GoogleGenAI } from "@google/genai";
import {
  SYSTEM_INSTRUCTION_ANALYZER,
  SYSTEM_INSTRUCTION_GRADER,
  SYSTEM_INSTRUCTION_EXAM_PARSER,
  SYSTEM_INSTRUCTION_RULE_MAKER,
  SYSTEM_INSTRUCTION_PLAIN_ENGLISH,
  SYSTEM_INSTRUCTION_MBE_ANALYZER,
  SYSTEM_INSTRUCTION_MNEMONIC_MAKER,
  SYSTEM_INSTRUCTION_PREDICTOR,
} from "../constants";
import {
  IssueAnalysis,
  EssayFeedback,
  ExamAnalysisResult,
  GlobalSubjectStat,
  RuleGeneration,
  MBEAnalysis,
  MnemonicResult,
  Prediction,
} from "../types";

// --------- API KEY (no hard-coding!) ----------
// At build/runtime this comes from your .env / Vercel env vars
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not defined. Set it in .env and Vercel.");
}

// Gemini client
const ai = new GoogleGenAI({ apiKey });

// ---------- JSON Schemas (no Schema/Type symbols) ----------

const issueAnalysisSchema = {
  type: "object",
  properties: {
    issueName: { type: "string" },
    frequency: { type: "string", enum: ["High", "Medium", "Low"] },
    triggerFacts: { type: "array", items: { type: "string" } },
    ruleFramework: { type: "string" },
    commonMistakes: { type: "array", items: { type: "string" } },
  },
  required: ["issueName", "frequency", "triggerFacts", "ruleFramework"],
} as const;

const essayFeedbackSchema = {
  type: "object",
  properties: {
    score: { type: "integer", description: "Score between 40 and 100" },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    missedIssues: { type: "array", items: { type: "string" } },
    modelParagraph: {
      type: "string",
      description: "A rewritten perfect paragraph for the weakest section",
    },
  },
  required: ["score", "strengths", "weaknesses", "missedIssues"],
} as const;

const examAnalysisSchema = {
  type: "object",
  properties: {
    examDate: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          number: { type: "string" },
          subject: { type: "string" },
          issues: { type: "array", items: { type: "string" } },
          triggerFacts: { type: "array", items: { type: "string" } },
          rulesExtracted: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
} as const;

const globalStatsSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      subject: { type: "string" },
      frequency: {
        type: "integer",
        description: "Percentage appearance in past 10 years (0-100)",
      },
      trend: { type: "string", enum: ["Up", "Down", "Stable"] },
    },
  },
} as const;

const ruleGenerationSchema = {
  type: "object",
  properties: {
    topic: { type: "string" },
    ruleStatement: {
      type: "string",
      description: "A concise paragraph suitable for memorization",
    },
    elements: {
      type: "array",
      items: { type: "string" },
      description: "Breakdown of elements",
    },
    pastExams: {
      type: "array",
      items: { type: "string" },
      description: "List of specific CA Bar exams (Month Year) where this was tested",
    },
    usageNotes: {
      type: "string",
      description: "Tips on when to apply this rule",
    },
  },
  required: ["ruleStatement", "elements", "pastExams"],
} as const;

const mbeAnalysisSchema = {
  type: "object",
  properties: {
    concept: { type: "string", description: "The name of the rule/concept" },
    definition: { type: "string", description: "Brief definition" },
    triggerFacts: {
      type: "array",
      items: { type: "string" },
      description: "Bullet points of facts from the question",
    },
    commonTraps: {
      type: "array",
      items: { type: "string" },
      description: "Explanation of traps or why other answers are wrong",
    },
  },
  required: ["concept", "definition", "triggerFacts", "commonTraps"],
} as const;

const mnemonicSchema = {
  type: "object",
  properties: {
    acronym: { type: "string" },
    breakdown: { type: "array", items: { type: "string" } },
    visualHook: {
      type: "string",
      description: "Description of a mental image",
    },
    catchphrase: { type: "string" },
  },
  required: ["acronym", "breakdown", "visualHook"],
} as const;

const predictionSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      subject: { type: "string" },
      probability: { type: "string", enum: ["High", "Medium", "Low"] },
      reasoning: { type: "string" },
      lastTested: { type: "string" },
    },
    required: ["subject", "probability", "reasoning"],
  },
} as const;

// ------------- Service ----------------

export const GeminiService = {
  async analyzeSubject(subjectName: string): Promise<IssueAnalysis[]> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the California Bar Exam subject: ${subjectName}. Identify the top 5 most tested issues.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ANALYZER,
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: issueAnalysisSchema,
          },
        },
      });

      const text = response.text;
      if (!text) return [];
      return JSON.parse(text) as IssueAnalysis[];
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      throw error;
    }
  },

  async gradeEssay(
    subject: string,
    question: string,
    answer: string
  ): Promise<EssayFeedback> {
    try {
      const prompt = `
      Subject: ${subject}
      Question Prompt: ${question}
      Student Answer: ${answer}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_GRADER,
          responseMimeType: "application/json",
          responseSchema: essayFeedbackSchema,
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      return JSON.parse(text) as EssayFeedback;
    } catch (error) {
      console.error("Gemini Grading Error:", error);
      throw error;
    }
  },

  async generateQuestion(subject: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a short, difficult California Bar Exam style essay prompt for ${subject}. Focus on a high-frequency issue. Just output the fact pattern.`,
      });
      return response.text || "Could not generate question.";
    } catch (error) {
      console.error("Generate Question Error:", error);
      return "Error generating question. Please try again.";
    }
  },

  async analyzeExamDump(
    text: string,
    fileData?: { inlineData: { data: string; mimeType: string } }
  ): Promise<ExamAnalysisResult> {
    try {
      const contents = fileData
        ? [{ text: `Analyze this exam text content.` }, fileData]
        : `Analyze this exam text content: ${text.substring(0, 30000)}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_EXAM_PARSER,
          responseMimeType: "application/json",
          responseSchema: examAnalysisSchema,
        },
      });

      const responseText = response.text;
      if (!responseText) throw new Error("No response from AI");
      return JSON.parse(responseText) as ExamAnalysisResult;
    } catch (error) {
      console.error("Exam Analysis Error:", error);
      throw error;
    }
  },

  async generateWeeklySchedule(
    phase: string,
    hours: number,
    subjects: string[]
  ): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create a detailed weekly schedule for a student studying for the California Bar Exam.
        
        Parameters:
        - Phase: ${phase}
        - Total Hours: ${hours} hours for this week.
        - Focus Subjects: ${subjects.join(", ")}
        - Methodology: Use Interleaving (mix subjects), Active Recall (no passive reading), and Spaced Repetition via MBEs.
        - IMPORTANT: The student prefers Multiple Choice Questions (MBE) over flashcards. Do not suggest flashcards.
        - STRATEGY: Ensure Professional Responsibility (PR) is studied at least twice this week regardless of phase.
        
        Output a simple day-by-day plan (Monday-Sunday) in Markdown format. Include specific tasks like "Timed Essay (1hr)", "MBE Practice Set (30min)".`,
      });
      return response.text || "Unable to generate schedule.";
    } catch (error) {
      console.error("Weekly Schedule Error:", error);
      return "Error generating schedule.";
    }
  },

  async getGlobalExamStats(): Promise<GlobalSubjectStat[]> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Provide a statistical analysis of the California Bar Exam essay subjects from the last 15 years. 
        Return a JSON array of objects with 'subject', 'frequency' (an estimated integer percentage of how often it appears on the exam), and 'trend' (Up, Down, Stable).
        Professional Responsibility should be very high.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: globalStatsSchema,
        },
      });
      const text = response.text;
      if (!text) return [];
      return JSON.parse(text) as GlobalSubjectStat[];
    } catch (error) {
      console.error("Global Stats Error", error);
      return [];
    }
  },

  async generateRuleWithHistory(
    topic: string,
    fileData?: { inlineData: { data: string; mimeType: string } }
  ): Promise<RuleGeneration> {
    try {
      const contents = fileData
        ? [{ text: `Generate a California Bar Exam rule for this content. Cite specific past exams.` }, fileData]
        : `Generate a California Bar Exam rule for: ${topic}. Cite specific past exams.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_RULE_MAKER,
          responseMimeType: "application/json",
          responseSchema: ruleGenerationSchema,
        },
      });
      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(text) as RuleGeneration;
    } catch (error) {
      console.error("Rule Gen Error", error);
      throw error;
    }
  },

  async getPlainEnglishExplanation(analysisJson: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Here is the legal analysis of a bar exam question: ${analysisJson}. 
        Explain the patterns found here in plain English. Why did the triggers lead to the rules? Explain the logic simply.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_PLAIN_ENGLISH,
        },
      });
      return response.text || "Could not translate.";
    } catch (error) {
      console.error("Plain English Error:", error);
      return "Error translating to plain English.";
    }
  },

  async analyzeMBEQuestion(
    questionText: string,
    fileData?: { inlineData: { data: string; mimeType: string } }
  ): Promise<MBEAnalysis> {
    try {
      const contents = fileData
        ? [{ text: `Analyze this MBE Question.` }, fileData]
        : `Analyze this MBE Question: ${questionText}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_MBE_ANALYZER,
          responseMimeType: "application/json",
          responseSchema: mbeAnalysisSchema,
        },
      });
      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(text) as MBEAnalysis;
    } catch (error) {
      console.error("MBE Analysis Error:", error);
      throw error;
    }
  },

  async generateMnemonic(
    input: string,
    fileData?: { inlineData: { data: string; mimeType: string } }
  ): Promise<MnemonicResult> {
    try {
      const contents = fileData
        ? [{ text: `Create a mnemonic for these items.` }, fileData]
        : `Create a mnemonic for these items: ${input}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_MNEMONIC_MAKER,
          responseMimeType: "application/json",
          responseSchema: mnemonicSchema,
        },
      });
      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(text) as MnemonicResult;
    } catch (error) {
      console.error("Mnemonic Error", error);
      throw error;
    }
  },

  async getExamPredictions(): Promise<Prediction[]> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Predict the essay topics for the next California Bar Exam based on historical cycles (Feb vs July patterns).
        Identify 'High Yield' (Overdue), 'Medium', and 'Low' (Recently tested).
        Professional Responsibility is always High.
        Output strict JSON.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_PREDICTOR,
          responseMimeType: "application/json",
          responseSchema: predictionSchema,
        },
      });
      const text = response.text;
      if (!text) return [];
      return JSON.parse(text) as Prediction[];
    } catch (error) {
      console.error("Prediction Error", error);
      return [];
    }
  },
};
