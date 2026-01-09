import type { Mood } from "../helpers/avatar";

type Props = {
	src: string;
	alt: string;
	onClick: () => void;
	mood: Mood;
	className?: string;
};

export function Avatar({ src, alt, onClick, mood, className = "" }: Props) {
	// Base classes
	let classes = `h-12 w-12 cursor-pointer select-none rounded-full border-2 transition-all duration-300 ${className}`;

	// Mood specific styling
	switch (mood) {
		case "angry":
			classes += " border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]";
			break;
		case "happy":
			classes += " border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]";
			break;
		case "thinking":
			classes += " border-blue-400";
			break;
		default:
			classes += " border-transparent hover:scale-105";
			break;
	}

	return (
		<button type="button" className={classes} onClick={onClick}>
			<img src={src} alt={alt} className="h-full w-full" draggable={false} />
		</button>
	);
}
