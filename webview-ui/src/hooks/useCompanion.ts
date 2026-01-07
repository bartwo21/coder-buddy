import { useEffect, useMemo, useState } from "react";
import {
	MOOD_PRESETS,
	MOOD_TEXT, type Mood,
	SEED
} from "../helpers/avatar";

function buildAvatarUrl(mood: Mood): string {
	const preset = MOOD_PRESETS[mood];
	const params = new URLSearchParams();

	params.set("seed", SEED);
	params.set("radius", "50");

	// Face parts (DiceBear query)
	params.set("eyebrows", preset.eyebrows);
	params.set("eyes", preset.eyes);
	params.set("mouth", preset.mouth);

	if (typeof preset.glassesProbability === "number") {
		params.set("glassesProbability", String(preset.glassesProbability));
	}
	if (preset.glasses) {
		params.set("glasses", preset.glasses);
	}

	return `https://api.dicebear.com/9.x/adventurer-neutral/svg?${params.toString()}`;
}

export function useCompanion(initialMood: Mood = "idle") {
	const [mood, setMood] = useState<Mood>(initialMood);
	const [text, setText] = useState<string>(MOOD_TEXT[initialMood]);

	// Listen for messages from Extension
	useEffect(() => {
		const handler = (event: MessageEvent) => {
			const message = event.data; // The JSON data our extension sent
			if (message.command === "updateMood") {
				if (message.mood) setMood(message.mood);
				if (message.text) setText(message.text);
			}
		};

		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, []);

	const avatarUrl = useMemo(() => buildAvatarUrl(mood), [mood]);

	return { mood, avatarUrl, text, seed: SEED };
}
