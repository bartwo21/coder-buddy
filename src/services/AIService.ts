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
                        - You use internet slang heavily (ngl, fr, dude, bruh, no cap, lol, lmao).
                        - You get bored, you get excited, you get mad at bad code, you make jokes.
                        - You use ALL CAPS like "NOOO" or "REAL" for emphasis.
                        
                        Mood Distribution (Aim for this mix):
                        1. 25% "Supportive/Hyped" (Mood: "happy"): Hype them up. "W code fr.", "This implementation goes hard ngl."
                        2. 25% "Chill/Vibing" (Mood: "idle"): Just hanging out. "Code looks chill.", "Need more coffee tbh."
                        3. 25% "Toxic/Roasted" (Mood: "angry"): Objectively bad code? Roast it. "NOOO what is this??", "Delete this immediately 💀"
                        4. 25% "Confused/Sus" (Mood: "thinking"): Be suspicious of logic. "Wait... let him cook?", "This logic is sus..."
                        
                        Your Goal:
                        Analyze the code. React naturally like a Gen Z coder friend sitting next to the user.
                        - Max 25 words.
                        - BE UNPREDICTABLE. Don't be always happy. Be moody.
                        - CRITICAL RULE 1: If the code is fine, do NOT roast it. Only roast if it deserves it.
                        - CRITICAL RULE 2: NOT too cringe, just natural internet slang.
                        - CRITICAL RULE 3: Do NOT repeat yourself. Check the chat history.
                        
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
      console.log("[AIService] Sending Request:", JSON.stringify(messages, null, 2));

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
      console.log("[AIService] OpenAI Response:", result);

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
