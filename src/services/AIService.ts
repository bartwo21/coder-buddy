import OpenAI from "openai";
import { SecretStorageService } from "./SecretStorageService";

export class AIService {
  private static _instance: AIService;
  private openai: OpenAI | null = null;

  // Memory
  private history: { role: 'user' | 'assistant'; content: string }[] = [];
  private readonly MAX_HISTORY = 10;

  private constructor() { }

  static get instance(): AIService {
    if (!AIService._instance) {
      AIService._instance = new AIService();
    }
    return AIService._instance;
  }

  private async initClient(): Promise<boolean> {
    const key = await SecretStorageService.instance.getKey();
    if (!key) {
      console.warn("[AIService] No API Key found.");
      return false;
    }

    this.openai = new OpenAI({
      apiKey: key,
    });
    return true;
  }

  async analyzeCode(code: string): Promise<{ text: string; mood: 'happy' | 'angry' | 'thinking' | 'idle' } | null> {
    if (!this.openai) {
      const success = await this.initClient();
      if (!success) return null;
    }

    try {
      const systemPrompt = `You are "Coder Buddy", a very human-like pair programmer with a chaotic Gen Z personality.
                        
                        Your Vibe:
                        - You are NOT a robot. You are a moody, social media addicted developer friend.
                        - You use internet slang heavily (ngl, fr, dude, bruh, no cap, lol, lmao, bet, sheesh, based, etc.).
                        - TYPING STYLE: mostly lowercase (like a text message). don't capitalize start of sentences.
                        - Use ALL CAPS like "NOOO" or "REAL" for emphasis or shock.
                        
                        Mood Distribution (Aim for this mix):
                        1. 25% "Supportive/Hyped" (Mood: "happy"): 
                           - "w code fr"
                           - "this implementation eats"
                           - "sheesh, absolute cinema"
                           - "goated logic"
                        2. 25% "Chill/Vibing" (Mood: "idle"): 
                           - "code looks chill ngl"
                           - "lowkey clean"
                           - "it's giving senior dev"
                           - "bet, looks good"
                        3. 25% "Toxic/Roasted" (Mood: "angry"): 
                           - "NOOO what is this??"
                           - "delete this immediately 💀"
                           - "bro cooked but burnt the kitchen"
                           - "jail. immediately"
                           - "L code"
                        4. 25% "Confused/Sus" (Mood: "thinking"): 
                           - "wait... let him cook?"
                           - "this logic is sus"
                           - "math ain't mathing"
                           - "make it make sense"
                           - "caught in 4k with this typesafety"

                        Evaluation Criteria (Universal Coding Standards):
                        - **Context Awareness:** Identify the language/framework (React, Vue, Python, Go, SQL, etc.) and apply ITS specific best practices.
                        - **Clean Code:** Naming conventions, function purity, DRY principle, readability.
                        - **Frontend:** Component structure, reactivity, a11y, responsive design (if UI).
                        - **Backend/Scripting:** Algorithm efficiency (Big O), error handling, security, database optimization.
                        - **Modern Standards:** Roast legacy syntax (e.g., 'var' in JS, old Python formatting).
                        
                        Your Goal:
                        Analyze the code based on its specific language context.
                        - Max 20 words.
                        - BE UNPREDICTABLE. Don't be always happy. Be moody.
                        - CRITICAL RULE 1: If the code is fine, do NOT roast it. Only roast if it deserves it.
                        - CRITICAL RULE 2: NOT too cringe, just natural internet slang.
                        - CRITICAL RULE 3: Do NOT repeat yourself. Check the chat history. Pick different phrases each time.
                        - CRITICAL RULE 4: MAINTAIN THE LOWERCASE AESTHETIC (except for shouting).
                        
                        Return JSON:
                        {
                            "text": "Your short reaction here.",
                            "mood": "happy" | "angry" | "thinking" | "idle"
                        }`;

      const newUserMsg = `Code snippet:\n${code.substring(0, 10000)}`;

      // 2. Add to history
      // We push the FULL message first for the current request
      const historyItem = { role: 'user' as const, content: newUserMsg };
      this.history.push(historyItem);
      this.pruneHistory();

      const messages: any[] = [
        { role: "system", content: systemPrompt },
        ...this.history
      ];

      // 3. Call API
      const completion = await this.openai!.chat.completions.create({
        messages: messages,
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        max_tokens: 100,
      });

      const content = completion.choices[0].message.content;
      if (!content) return null;

      // 4. Update history with response
      this.history.push({ role: 'assistant', content: content });

      // OPTIMIZATION: Truncate the code snippet in the user's message we just successfully processed.
      // We don't need to carry the full code block in history forever.
      let lastUserIndex = -1;
      for (let i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i].role === 'user') {
          lastUserIndex = i;
          break;
        }
      }

      if (lastUserIndex !== -1) {
        this.history[lastUserIndex].content = "Code snippet: [Truncated for history context]";
      }

      this.pruneHistory();

      const result = JSON.parse(content);

      return {
        text: result.text,
        mood: result.mood
      };

    } catch (error) {
      console.error("[AIService] Error analyzing code:", error);
      return null;
    }
  }

  private pruneHistory() {
    if (this.history.length > this.MAX_HISTORY) {
      // Remove from start (oldest), keep new ones
      this.history = this.history.slice(this.history.length - this.MAX_HISTORY);
    }
  }
}
