// // src/services/geminiService.ts
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import type { Question } from '../types/content.types';

// interface GeminiRawQuestion {
//   id: string;
//   type: 'multiple_choice' | 'true_false' | 'short_answer';
//   prompt: string;
//   options?: string[];
//   correctAnswer: string | number | boolean;
//   explanation: string;
// }

// interface GeminiApiResponse {
//   learningContent?: string;
//   questions?: GeminiRawQuestion[];
//   error?: string;
// }

// class GeminiService {
//   private static API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
//   private static MODEL = 'gemini-2.5-flash';
//   private static CACHE = new Map<string, any>();

//   /* ------------------------------------------------------------------ */
//   /*  PUBLIC API                                                       */
//   /* ------------------------------------------------------------------ */

//   static async fetchLearningContent(topic: string, levelNumber: number): Promise<string> {
//     const key = `learn_${topic}_${levelNumber}`;
//     if (this.CACHE.has(key)) {
//       console.log(`[CACHE] Learning content: ${topic} L${levelNumber}`);
//       return this.CACHE.get(key)!;
//     }

//     const prompt = `Create concise educational content (300-500 words) for "${topic}" in Machine Learning, Level ${levelNumber}. Include key concepts, formulas, and examples.`;

//     console.log('[DEBUG] Fetching learning content:', topic, levelNumber);
//     const result = await this.callGemini(prompt, { responseMimeType: 'text/plain' });
//     const content = result.learningContent ?? 'Content unavailable.';
//     this.CACHE.set(key, content);
//     return content;
//   }

//   static async fetchQuizQuestions(
//     topic: string,
//     levelNumber: number,
//     count: number = 6
//   ): Promise<Question[]> {
//     const key = `quiz_${topic}_${levelNumber}_${count}`;
//     if (this.CACHE.has(key)) {
//       console.log(`[CACHE] Quiz: ${topic} L${levelNumber}`);
//       return this.CACHE.get(key)!;
//     }

//     const prompt = `Generate exactly ${count} quiz questions for "${topic}" (ML), Level ${levelNumber}.
// Return ONLY valid JSON:
// {
//   "questions": [
//     {
//       "id": "q1",
//       "type": "multiple_choice",
//       "prompt": "What is X?",
//       "options": ["A", "B", "C", "D"],
//       "correctAnswer": 1,
//       "explanation": "..."
//     },
//     {
//       "type": "true_false",
//       "correctAnswer": true
//     },
//     {
//       "type": "short_answer",
//       "correctAnswer": "gradient descent"
//     }
//   ]
// }
// Include ~${Math.ceil(count / 3)} of each type.`;

//     console.log('[DEBUG] Fetching quiz:', { topic, levelNumber, count });

//     const result = await this.callGemini(prompt, {
//       responseMimeType: 'application/json',
//     });

//     if (!result.questions?.length) {
//       console.warn('[WARN] No questions — using demo');
//       return this.demoResponse(prompt).questions || [];
//     }

//     const transformed: Question[] = result.questions.map((q: GeminiRawQuestion, i: number): Question => ({
//       id: q.id || `gemini_${topic}_${levelNumber}_${i}`,
//       type: q.type,
//       prompt: q.prompt,
//       options: q.options,
//       correctAnswer: q.correctAnswer,
//       explanation: q.explanation,
//       hint: 'Think carefully about this ML concept!',
//       topic,
//       difficulty: levelNumber,
//       estimatedTimeSeconds:
//         q.type === 'short_answer' ? 25 :
//           q.type === 'multiple_choice' ? 20 : 15,
//     }));

//     console.log(`[SUCCESS] Generated ${transformed.length} questions`);
//     this.CACHE.set(key, transformed);
//     return transformed;
//   }
//   /* ------------------------------------------------------------------ */
//   /*  PRIVATE: CALL GEMINI                                             */
//   /* ------------------------------------------------------------------ */

//   private static async callGemini(
//     userPrompt: string,
//     config: { responseMimeType?: 'text/plain' | 'application/json' } = {}
//   ): Promise<GeminiApiResponse> {
//     if (!this.API_KEY || this.API_KEY.includes('demo')) {
//       console.warn('[DEMO] Using fallback data');
//       return this.demoResponse(userPrompt);
//     }

//     try {
//       const genAI = new GoogleGenerativeAI(this.API_KEY);
//       const model = genAI.getGenerativeModel({
//         model: this.MODEL,
//         generationConfig: {
//           temperature: 0.7,
//           maxOutputTokens: 2048,
//           responseMimeType: config.responseMimeType ?? 'text/plain',
//         },
//       });

//       const finalPrompt = config.responseMimeType === 'application/json'
//         ? `${userPrompt}\n\nRETURN ONLY VALID JSON. NO MARKDOWN. NO EXPLANATIONS.`
//         : userPrompt;

//       console.log('[GEMINI →] Prompt:', finalPrompt.slice(0, 200) + '...');

//       const result = await model.generateContent(finalPrompt);

//       // Extract text safely (Gemini JSON responses are inside parts[])
//       let text =
//         result.response.text()?.trim() ||
//         result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
//         '';

//       console.log('Raw response:', text);

//       if (config.responseMimeType === 'application/json') {
//         text = text
//           .replace(/^```json\s*/i, '')
//           .replace(/```$/i, '')
//           .trim();

//         if (!text) {
//           throw new Error('Empty JSON response from Gemini');
//         }

//         try {
//           return JSON.parse(text);
//         } catch (e) {
//           console.error('[PARSE FAIL] Raw:', text);

//           const match = text.match(/\{[\s\S]*\}/);
//           if (match) {
//             return JSON.parse(match[0]);
//           }

//           throw e;
//         }
//       }
//       return { learningContent: text };

//     } catch (err: any) {
//       console.error('[GEMINI ERROR]', err.message);
//       return this.demoResponse(userPrompt);
//     }
//   }

//   /* ------------------------------------------------------------------ */
//   /*  DEMO DATA                                                        */
//   /* ------------------------------------------------------------------ */

//   private static demoResponse(prompt: string): GeminiApiResponse {
//     if (prompt.includes('quiz questions')) {
//       return {
//         questions: [
//           {
//             id: 'demo_1',
//             type: 'multiple_choice',
//             prompt: 'What does logistic regression predict?',
//             options: ['Continuous values', 'Probabilities', 'Categories', 'Images'],
//             correctAnswer: 1,
//             explanation: 'It outputs probability between 0 and 1.',
//           },
//           {
//             id: 'demo_2',
//             type: 'true_false',
//             prompt: 'Logistic regression uses sigmoid function.',
//             correctAnswer: true,  // ← boolean
//             explanation: 'Sigmoid maps logits to [0,1].',
//           },
//           {
//             id: 'demo_3',
//             type: 'short_answer',
//             prompt: 'Name the loss function for logistic regression.',
//             correctAnswer: 'binary cross entropy',
//             explanation: 'Also called log loss.',
//           },
//         ],
//       };
//     }

//     return {
//       learningContent: `**Logistic Regression**\n\nPredicts probability of binary outcome using sigmoid function...`,
//     };
//   }
// }

// export default GeminiService;

// src/services/geminiService.ts
// Entire Gemini logic now happens in Flask backend.

// src/services/geminiService.ts
import type { Question } from "../types/content.types";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

interface GeminiRawQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  prompt: string;
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation: string;
  hint?: string;
  topic?: string;
  difficulty?: number;
  estimatedTimeSeconds?: number;
}

export default class GeminiService {
  static async fetchQuizQuestions(
    topic: string,
    level: number,
    count: number = 6
  ): Promise<Question[]> {
    try {
      const res = await fetch(`${API_BASE}/api/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, count }),
      });

      if (!res.ok) {
        console.error("Quiz API error:", res.status);
        return this.getFallbackQuestions(topic, level);
      }

      const data = await res.json();
      const rawQuestions: GeminiRawQuestion[] = data.questions || [];

      if (!rawQuestions.length) {
        return this.getFallbackQuestions(topic, level);
      }

      return rawQuestions.map((q, i) => this.normalizeQuestion(q, topic, level, i));
    } catch (err) {
      console.error("Quiz fetch failed:", err);
      return this.getFallbackQuestions(topic, level);
    }
  }

  static async downloadStudyMaterial(topic: string, level: number) {
    // SANITIZE: lowercase, replace spaces/special chars with _, trim
    const cleanTopic = topic
      .toLowerCase()
      .replace(/\s+/g, '_')           // "Linear Regression" → "linear_regression"
      .replace(/[^a-z0-9_-]/g, '')    // remove invalid chars
      .replace(/_+/g, '_')            // collapse multiple _
      .replace(/^_+|_+$/g, '')        // trim leading/trailing _

    if (!cleanTopic) {
      console.error("Invalid topic name after sanitization");
      return;
    }

    const url = `${API_BASE}/api/materials/${encodeURIComponent(cleanTopic)}/${level}/download`;
    console.log("[PDF] Downloading from:", url);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${cleanTopic}_Level_${level}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  private static normalizeQuestion(
    q: GeminiRawQuestion,
    topic: string,
    level: number,
    index: number
  ): Question {
    let correctAnswer: string | number | boolean = q.correctAnswer;

    if (q.type === 'multiple_choice') {
      if (typeof q.correctAnswer === 'string') {
        const num = parseInt(q.correctAnswer, 10);
        correctAnswer = !isNaN(num) && num >= 0 && num < (q.options?.length || 0) ? num : 0;
      }
    } else if (q.type === 'true_false') {
      correctAnswer = q.correctAnswer === true || q.correctAnswer === 'true';
    } else if (q.type === 'short_answer') {
      correctAnswer = String(q.correctAnswer).trim().toLowerCase();
    }

    const options = q.type === 'multiple_choice'
      ? (q.options && q.options.length > 0 ? q.options : ['A', 'B', 'C', 'D'])
      : undefined;

    return {
      id: q.id || `gemini_${topic}_${level}_${index}`,
      type: q.type,
      prompt: q.prompt,
      options,
      correctAnswer,
      explanation: q.explanation,
      hint: q.hint || 'Think carefully!',
      topic: q.topic || topic,
      difficulty: q.difficulty ?? level,
      estimatedTimeSeconds: q.estimatedTimeSeconds ??
        (q.type === 'short_answer' ? 25 : q.type === 'multiple_choice' ? 20 : 15),
    };
  }

  private static getFallbackQuestions(topic: string, level: number): Question[] {
    return [
      {
        id: 'fallback_1',
        type: 'multiple_choice',
        prompt: 'What is the goal of supervised learning?',
        options: ['Predict outcomes from labeled data', 'Find patterns without labels', 'Generate new data', 'Reduce dimensions'],
        correctAnswer: 0,
        explanation: 'Supervised learning uses labeled data to predict outcomes.',
        hint: 'It needs input-output pairs.',
        topic,
        difficulty: level,
        estimatedTimeSeconds: 20,
      },
      {
        id: 'fallback_2',
        type: 'true_false',
        prompt: 'Overfitting occurs when a model performs well on training data but poorly on new data.',
        correctAnswer: true,
        explanation: 'Overfitting means the model memorized noise, not patterns.',
        hint: 'Think about generalization.',
        topic,
        difficulty: level,
        estimatedTimeSeconds: 15,
      },
      {
        id: 'fallback_3',
        type: 'short_answer',
        prompt: 'Name one common activation function used in neural networks.',
        correctAnswer: 'relu',
        explanation: 'ReLU is widely used for its simplicity and performance.',
        hint: 'It’s non-linear and fast.',
        topic,
        difficulty: level,
        estimatedTimeSeconds: 25,
      },
    ];
  }
}