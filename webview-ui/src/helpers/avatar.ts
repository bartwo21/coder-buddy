export type Mood = "idle" | "thinking" | "angry" | "happy";

type DiceBearPreset = {
	eyebrows: string;
	eyes: string;
	mouth: string;
	glasses?: string;
	glassesProbability?: number; // 0-100
};

export const SEED = "Felix";

export const MOODS: Mood[] = ["idle", "thinking", "angry", "happy"];

// Mock: 5 farklı ruh hali preset'i (Felix seed sabit; mimikleri varyantlarla oynuyoruz)
export const MOOD_PRESETS: Record<Mood, DiceBearPreset> = {
	idle: {
		eyebrows: "variant10",
		eyes: "variant01",
		mouth: "variant01",
		glasses: "variant01",
		glassesProbability: 100,
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
};

export const MOOD_TEXT: Record<Mood, string> = {
	idle: "just vibing. waiting for you to cook something",
	thinking: "hold up... let me process this tea ☕️",
	angry: "bro... ain't no way you wrote this 💀",
	happy: "sheesh! absolute cinema. w code. 🔥",
};
