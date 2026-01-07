import { useEffect, useRef, useState } from "react";
import { AvatarButton } from "./components/AvatarButton";
import { SpeechBubble } from "./components/SpeechBubble";
import { useCompanion } from "./hooks/useCompanion";

export default function App() {
	const { mood, avatarUrl, text } = useCompanion("idle");

	// Determines which animation is currently active.
	const [activeAnimation, setActiveAnimation] = useState<string>("");

	const prevTextRef = useRef(text);

	useEffect(() => {
		const isNewMessage = text !== prevTextRef.current;
		prevTextRef.current = text;

		let nextAnim = "";
		switch (mood) {
			case "angry":
			case "toxic":
				nextAnim = "animate-shake";
				break;
			case "happy":
				nextAnim = "animate-bounce-custom";
				break;
			case "thinking":
				nextAnim = "animate-pulse-ring";
				break;
			default:
				break;
		}

		if (nextAnim) {
			setActiveAnimation(nextAnim);

			// Exception: Pulse (Thinking) should loop forever until mood changes
			if (mood === "thinking") {
				return;
			}

			// For Shake/Bounce (finite CSS loops), we rely on CSS to stop it.
			// We do NOT use setTimeout to clear it, because that causes snapping.
			// Instead, we let it sit at the final frame (via animation-fill-mode: forwards).
			// When a NEW message comes, the 'key' prop below will force a re-render, restarting it.
		} else {
			setActiveAnimation("");
		}
	}, [mood, text]);

	const isAvatarOnlyAnim = activeAnimation === "animate-pulse-ring";
	const containerAnim = isAvatarOnlyAnim ? "" : activeAnimation;
	const avatarAnim = isAvatarOnlyAnim ? activeAnimation : "";

	// Generate a key to force re-mounting when text/mood updates.
	// This ensures animation restarts from 0 even if the class is the same.
	const animationKey = `${mood}-${text.substring(0, 10)}`;

	return (
		<div className="relative h-full w-full">
			<div className="absolute bottom-3 left-3 flex flex-col items-start gap-2">
				{/* Mood Animation Wrapper (Container Level) */}
				<div
					key={animationKey}
					className={containerAnim}
					onAnimationEnd={() => {
						// Optional: Clear state if desired, but keeping it ensures fill-mode:forwards stays valid.
						// If we clear it, it snaps back. So we leave it!
						// The 'key' update on next message will handle the restart.
					}}
				>
					<SpeechBubble text={text} mood={mood} subtitle="Coder Buddy AI" />
					<AvatarButton
						src={avatarUrl}
						alt="Coder Buddy"
						onClick={() => {}}
						mood={mood}
						className={avatarAnim} // Pass pulse here
					/>
				</div>
			</div>
		</div>
	);
}
