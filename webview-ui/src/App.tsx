import { useMemo, useState } from "react";

type Mode = "supportive" | "toxic";

export default function App() {
  const [mode, setMode] = useState<Mode>("supportive");

  const seed = mode === "supportive" ? "Buddy" : "ToxicSenior";
  const avatarUrl = useMemo(() => {
    const s = encodeURIComponent(seed);
    return `https://api.dicebear.com/9.x/bottts/svg?seed=${s}&backgroundColor=transparent`;
  }, [seed]);

  const text =
    mode === "supportive"
      ? "Devam! Küçük adımlarla büyük işler."
      : "Bu kodu kim yazdı? Sen mi?";

  return (
    <div className="relative h-full w-full">
      {/* vscode-pets hissi: sol-alt köşeye sabit */}
      <div className="absolute bottom-3 left-3 flex flex-col items-start gap-2">
        {/* Konuşma balonu (avatarın üstünde) */}
        <div className="relative max-w-[280px] rounded-xl border border-zinc-700 bg-zinc-900/85 px-3 py-2 text-sm text-zinc-100 shadow">
          <div className="font-mono">{text}</div>
          <div className="mt-1 text-[11px] text-zinc-400">Mode: {mode} (click avatar)</div>

          {/* Balon oku */}
          <div className="absolute -bottom-2 left-6 h-4 w-4 rotate-45 border-b border-r border-zinc-700 bg-zinc-900/85" />
        </div>
        SAAAAtest
        {/* Avatar */}
        <img
          src={avatarUrl}
          alt="Coder Buddy"
          className="w-28 h-28 cursor-pointer select-none"
          draggable={false}
          onClick={() => setMode(mode === "supportive" ? "toxic" : "supportive")}
        />
      </div>
    </div>
  );
}