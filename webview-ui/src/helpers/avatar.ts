export type Mood = "idle" | "thinking" | "angry" | "happy" | "toxic";

type DiceBearPreset = {
	eyebrows: string;
	eyes: string;
	mouth: string;
	glasses?: string;
	glassesProbability?: number; // 0-100
};

export const SEED = "Felix";

export const MOODS: Mood[] = ["idle", "thinking", "angry", "happy", "toxic"];

// Mock: 5 farklı ruh hali preset'i (Felix seed sabit; mimikleri varyantlarla oynuyoruz)
export const MOOD_PRESETS: Record<Mood, DiceBearPreset> = {
	idle: {
		eyebrows: "variant10",
		eyes: "variant01",
		mouth: "variant01",
		glassesProbability: 0,
	},
	thinking: {
		eyebrows: "variant04",
		eyes: "variant09",
		mouth: "variant04",
		glassesProbability: 0,
	},
	angry: {
		eyebrows: "variant01",
		eyes: "variant14",
		mouth: "variant15",
		glassesProbability: 0,
	},
	happy: {
		eyebrows: "variant12",
		eyes: "variant23",
		mouth: "variant26",
		glassesProbability: 0,
	},
	toxic: {
		eyebrows: "variant12",
		eyes: "variant24",
		mouth: "variant23",
		glasses: "variant01",
		glassesProbability: 100,
	},
};

export const MOOD_TEXT: Record<Mood, string> = {
	idle: "I'm here. Analyzing the code flow.",
	thinking: "Hmm… This smelled. Thinking.",
	angry: "This is… We won't leave it like this.",
	happy: "Great! Like this.",
	toxic: "Who wrote this code? You?",
};
