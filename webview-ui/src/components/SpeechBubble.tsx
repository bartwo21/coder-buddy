import type { Mood } from "../helpers/avatar";

type Props = {
	text: string;
	subtitle: string;
	mood: Mood;
};

export function SpeechBubble({ text, subtitle, mood }: Props) {
	let containerClasses =
		"relative max-w-[280px] rounded-xl border px-3 py-2 text-sm shadow transition-colors duration-300";
	let arrowClasses =
		"absolute -bottom-2 left-6 h-4 w-4 rotate-45 border-b border-r transition-colors duration-300";

	// Mood colors
	if (mood === "angry") {
		containerClasses += " border-red-900/50 bg-red-950/90 text-red-100";
		arrowClasses += " border-red-900/50 bg-red-950/90";
	} else if (mood === "happy") {
		containerClasses += " border-green-900/50 bg-green-950/90 text-green-100";
		arrowClasses += " border-green-900/50 bg-green-950/90";
	} else if (mood === "unimpressed") {
		containerClasses += " border-indigo-900/50 bg-indigo-950/90 text-indigo-100";
		arrowClasses += " border-indigo-900/50 bg-indigo-950/90";
	} else {
		// Default / Thinking
		containerClasses += " border-zinc-700 bg-zinc-900/85 text-zinc-100";
		arrowClasses += " border-zinc-700 bg-zinc-900/85";
	}

	return (
		<div className={containerClasses}>
			<div className="font-mono text-[10px]">{text}</div>
			<div className="mt-1 text-[9px] opacity-60">{subtitle}</div>
			<div className={arrowClasses} />
		</div>
	);
}
