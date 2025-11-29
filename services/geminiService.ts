import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_INSTRUCTION_ANALYZER, SYSTEM_INSTRUCTION_GRADER, SYSTEM_INSTRUCTION_EXAM_PARSER, SYSTEM_INSTRUCTION_RULE_MAKER, SYSTEM_INSTRUCTION_PLAIN_ENGLISH, SYSTEM_INSTRUCTION_MBE_ANALYZER, SYSTEM_INSTRUCTION_MNEMONIC_MAKER, SYSTEM_INSTRUCTION_PREDICTOR } from "../constants";
import { IssueAnalysis, EssayFeedback, ExamAnalysisResult, GlobalSubjectStat, RuleGeneration, MBEAnalysis, MnemonicResult, Prediction } from "../types";

// Initialize Gemini
// Note: The API key is injected via vite.config.ts 'define' based on the Vercel Environment Variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const issueAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    issueName: { type: Type.STRING },
    frequency: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
    triggerFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
    ruleFramework: { type: Type.STRING },
    commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["issueName", "frequency", "triggerFacts", "ruleFramework"],
};

const essayFeedbackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "Score between 40 and 100" },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    missedIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
    modelParagraph: { type: Type.STRING, description: "A rewritten perfect paragraph for the weakest section" },
  },
  required: ["score", "strengths", "weaknesses", "missedIssues"],
};

const examAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    examDate: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          number: { type: Type.STRING },
          subject: { type: Type.STRING },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } },
          triggerFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
          rulesExtracted: { type: Type.ARRAY, items: { type: Type.STRING } },
        }
      }
    }
  }
};

const globalStatsSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING },
      frequency: { type: Type.INTEGER, description: "Percentage appearance in past 10 years (0-100)" },
      trend: { type: Type.STRING, enum: ["Up", "Down", "Stable"] }
    }
  }
};

const ruleGenerationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    ruleStatement: { type: Type.STRING, description: "A concise paragraph suitable for memorization" },
    elements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Breakdown of elements" },
    pastExams: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific CA Bar exams (Month Year) where this was tested" },
    usageNotes: { type: Type.STRING, description: "Tips on when to apply this rule" }
  },
  required: ["ruleStatement", "elements", "pastExams"]
};

const mbeAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    concept: { type: Type.STRING, description: "The name of the rule/concept" },
    definition: { type: Type.STRING, description: "Brief definition" },
    triggerFacts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Bullet points of facts from the question" },
    commonTraps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Explanation of traps or why other answers are wrong" },
  },
  required: ["concept", "definition", "triggerFacts", "commonTraps"]
};

const mnemonicSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    acronym: { type: Type.STRING },
    breakdown: { type: Type.ARRAY, items: { type: Type.STRING } },
    visualHook: { type: Type.STRING, description: "Description of a mental image" },
    catchphrase: { type: Type.STRING },
  },
  required: ["acronym", "breakdown", "visualHook"]
};

const predictionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING },
      probability: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
      reasoning: { type: Type.STRING },
      lastTested: { type: Type.STRING }
    },
    required: ["subject", "probability", "reasoning"]
  }
};

export const GeminiService = {
  /**
   * Analyzes a subject to find high-yield patterns.
   */
  async analyzeSubject(subjectName: string): Promise<IssueAnalysis[]> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the California Bar Exam subject: ${subjectName}. Identify the top 5 most tested issues.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_ANALYZER,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
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

  /**
   * Grades a user's practice essay.
   */
  async gradeEssay(subject: string, question: string, answer: string, fileData?: { inlineData: { data: string; mimeType: string } }): Promise<EssayFeedback> {
    try {
      const prompt = `
      Subject: ${subject}
      Question Prompt: ${question}
      Student Answer: ${answer}
      `;

      const contents = fileData 
        ? [{ text: prompt }, fileData] 
        : prompt;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
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

  /**
   * Generates a practice question.
   */
  async generateQuestion(subject: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a short, difficult California Bar Exam style essay prompt for ${subject}. Focus on a high-frequency issue. Just output the fact pattern.`,
      });
      return response.text || "Could not generate question.";
    } catch (error) {
      return "Error generating question. Please try again.";
    }
  },

  /**
   * Analyzes raw exam text to find patterns.
   */
  async analyzeExamDump(text: string, fileData?: { inlineData: { data: string; mimeType: string } }): Promise<ExamAnalysisResult> {
    try {
      const contents = fileData 
        ? [{ text: `Analyze this exam text content.` }, fileData] 
        : `Analyze this exam text content: ${text.substring(0, 30000)}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents, 
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_EXAM_PARSER,
          responseMimeType: "application/json",
          responseSchema: examAnalysisSchema,
        }
      });
      
      const responseText = response.text;
      if (!responseText) throw new Error("No response from AI");
      return JSON.parse(responseText) as ExamAnalysisResult;
    } catch (error) {
      console.error("Exam Analysis Error:", error);
      throw error;
    }
  },

  /**
   * Generates a weekly schedule based on phase and hours.
   */
  async generateWeeklySchedule(phase: string, hours: number, subjects: string[]): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create a detailed weekly schedule for a student studying for the California Bar Exam.
        
        Parameters:
        - Phase: ${phase}
        - Total Hours: ${hours} hours for this week.
        - Focus Subjects: ${subjects.join(', ')}
        - Methodology: Use Interleaving (mix subjects), Active Recall (no passive reading), and Spaced Repetition via MBEs.
        - IMPORTANT: The student prefers Multiple Choice Questions (MBE) over flashcards. Do not suggest flashcards. Suggest "MBE Practice Set (30min)" instead.
        - STRATEGY: Ensure Professional Responsibility (PR) is studied at least twice this week regardless of phase.
        
        Output a simple day-by-day plan (Monday-Sunday) in Markdown format. Include specific tasks like "Timed Essay (1hr)", "MBE Practice Set (30min)".`,
      });
      return response.text || "Unable to generate schedule.";
    } catch (error) {
      return "Error generating schedule.";
    }
  },

  /**
   * Gets global stats for all subjects.
   */
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
        }
      });
      const text = response.text;
      if(!text) return [];
      return JSON.parse(text) as GlobalSubjectStat[];
    } catch (error) {
      console.error("Global Stats Error", error);
      return [];
    }
  },

  /**
   * Generate a specific rule with history.
   */
  async generateRuleWithHistory(topic: string, fileData?: { inlineData: { data: string; mimeType: string } }): Promise<RuleGeneration> {
    try {
      const contents = fileData
        ? [{ text: `Generate a California Bar Exam rule for this content. Cite specific past exams.` }, fileData]
        : `Generate a California Bar Exam rule for: ${topic}. Cite specific past exams.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_RULE_MAKER,
          responseMimeType: "application/json",
          responseSchema: ruleGenerationSchema,
        }
      });
      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(text) as RuleGeneration;
    } catch (error) {
      console.error("Rule Gen Error", error);
      throw error;
    }
  },

  /**
   * Translate legal analysis to plain english.
   */
  async getPlainEnglishExplanation(analysisJson: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Here is the legal analysis of a bar exam question: ${analysisJson}. 
        Explain the patterns found here in plain English. Why did the triggers lead to the rules? Explain the logic simply.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_PLAIN_ENGLISH,
        }
      });
      return response.text || "Could not translate.";
    } catch (error) {
      return "Error translating to plain English.";
    }
  },

  /**
   * Analyze an MBE Question for Pattern Tracker
   */
  async analyzeMBEQuestion(questionText: string, fileData?: { inlineData: { data: string; mimeType: string } }): Promise<MBEAnalysis> {
    try {
      const contents = fileData
        ? [{ text: `Analyze this MBE Question.` }, fileData]
        : `Analyze this MBE Question: ${questionText}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_MBE_ANALYZER,
          responseMimeType: "application/json",
          responseSchema: mbeAnalysisSchema,
        }
      });
      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(text) as MBEAnalysis;
    } catch (error) {
      console.error("MBE Analysis Error", error);
      throw error;
    }
  },

  /**
   * Generate Mnemonic
   */
  async generateMnemonic(input: string, fileData?: { inlineData: { data: string; mimeType: string } }): Promise<MnemonicResult> {
    try {
      const contents = fileData
        ? [{ text: `Create a mnemonic for these items.` }, fileData]
        : `Create a mnemonic for these items: ${input}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_MNEMONIC_MAKER,
          responseMimeType: "application/json",
          responseSchema: mnemonicSchema,
        }
      });
      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(text) as MnemonicResult;
    } catch (error) {
      console.error("Mnemonic Error", error);
      throw error;
    }
  },

  /**
   * Get Exam Predictions
   */
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
        }
      });
      const text = response.text;
      if (!text) return [];
      return JSON.parse(text) as Prediction[];
    } catch (error) {
      console.error("Prediction Error", error);
      return [];
    }
  },

  /**
   * Generate a video to visualize a legal concept.
   */
  async generateLegalVideo(prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> {
    // Check if the user needs to select an API key first (specific to Veo)
    if (window.aistudio && window.aistudio.openSelectKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }

    // Create a fresh instance for this call as per instructions for Veo/Paid features
    const veAoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      let operation = await veAoAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A realistic and clear visual representation of the following legal concept or fact pattern for educational purposes: ${prompt}`,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: aspectRatio,
        }
      });

      // Polling loop
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
        operation = await veAoAi.operations.getVideosOperation({ operation: operation });
      }

      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!videoUri) throw new Error("No video URI returned");

      return `${videoUri}&key=${process.env.API_KEY}`;
    } catch (error) {
      console.error("Video Generation Error", error);
      throw error;
    }
  }
};
