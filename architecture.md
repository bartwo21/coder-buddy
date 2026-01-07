# 🏗 Coder Buddy Architecture & Technical Guide
> **Last Updated:** 2026-01-07
> **Version:** 1.0 (Refined Logic)

This document serves as the **single source of truth** for the technical implementation of Coder Buddy. It is designed to help AI agents and developers understand the codebase, logic flows, and project structure instantly.

## 🎯 Project Overview

**Coder Buddy** is a VS Code extension that provides a "Bipolar AI Companion" living in the sidebar.
-   **Type:** Webview-based VS Code Extension.
-   **Core Philosophy:** Client-side only. BYOK (Bring Your Own Key). Privacy-focused. "Chaotic Neutral" Personality.
-   **Main Tech Stack:**
    -   **Extension Host:** TypeScript
    -   **UI:** React (Vite) + Tailwind CSS
    -   **AI:** OpenAI (`gpt-4o-mini`)
    -   **Communication:** `postMessage` (Webview <-> Extension)

## 📂 Folder Structure

```
coder-buddy/
├── .vscode/               # VS Code launch & task configs
├── src/                   # 🧠 EXTENSION BACKEND (Node.js environment)
│   ├── extension.ts       # Entry point. Activates extension, registers providers.
│   └── services/
│       ├── SecretStorageService.ts # Custom service for secure API key storage.
│       ├── GatekeeperService.ts    # Decides WHEN to trigger the AI (Debounce/Cost Control).
│       └── AIService.ts            # Handles OpenAI calls, History/Memory, and Persona.
├── webview-ui/            # 🎨 UI FRONTEND (Browser environment)
│   ├── build/             # Output of Vite build (served to VS Code)
│   ├── src/
│   │   ├── components/    # React components (AvatarButton, SpeechBubble)
│   │   ├── helpers/       # UI helper functions
│   │   ├── hooks/         # Custom hooks (useCompanion.ts for logic)
│   │   ├── App.tsx        # Main component & Animation Logic
│   │   └── index.css      # Finite CSS Animations (Bounce/Shake)
│   └── vite.config.ts     # Vite configuration
├── package.json           # Extension manifest (activations, contributes)
└── architecture.md        # Technical Documentation (YOU ARE HERE)
```

## 🔄 Data Flow & Logic

### 1. Initialization Flow
1.  **Extension Activation (`src/extension.ts`):**
    -   Extension activates on `onView:aiCompanion.sidebar`.
    -   `SecretStorageService` initializes.
    -   Checks for stored OpenAI API Key (Prompt user if missing).
2.  **Webview Initialization:**
    -   `AICompanionViewProvider` resolves the webview view.
    -   Loads `index.html`.
    -   Sets strictly Content-Security-Policy (CSP).

### 2. "The Gatekeeper" (Cost Implementation)
Located in `src/services/GatekeeperService.ts`. Filters events to prevent spamming the AI.

**The Filter Pipeline:**
1.  **Debounce:** Wait for user to stop typing (3s).
2.  **Diff Check:** Code must change by >50 characters.
3.  **Cooldown:** **10 Seconds** minimum between requests.
4.  **RNG:** **80% Chance** to pass (20% random skip).

### 3. "The Brain" (AI Service)
Located in `src/services/AIService.ts`.

-   **Model:** `gpt-4o-mini` (Cost-effective).
-   **Context Window:** Truncated to **4,000 characters** to save tokens.
-   **Memory:** Sliding window of last 10 messages.
    -   *Optimization:* Truncates old code snippets in history to `[Code snippet: Truncated]` to prevent token inflation.
-   **Persona System:**
    -   **Prompt Engineering:** Enforces a "Chaotic Neutral" personality.
    -   **Mood Distribution:**
        -   **25% Supportive:** Genuine tips.
        -   **25% Chill/Funny:** Jokes/Sarcasm.
        -   **25% Toxic/Blunt:** Roasts bad code ("O(n^2)? Really?").
        -   **25% Cryptic/Confused:** Mysterious riddles.
    -   **Rules:** Do NOT roast valid code. Do NOT repeat previous comments.

### 4. UI & Animations
Located in `webview-ui/src/App.tsx` and `index.css`.

-   **Finite Animations:**
    -   **Happy (Bounce):** CSS `animation-iteration-count: 5` (3.0s).
    -   **Angry (Shake):** CSS `animation-iteration-count: 8` (~3.2s).
    -   **Thinking (Pulse):** Infinite loop until response arrives.
-   **Smooth Endings:**
    -   Uses `animation-fill-mode: forwards` to stay at the final frame (grounded).
    -   Uses React `key` prop (`key={mood-text}`) to force-remount the container on new messages, ensuring animations restart cleanly from frame 0 without snapping.
-   **Targeting:**
    -   Thinking Pulse -> Avatar Only.
    -   Bounce/Shake -> Entire Container (Avatar + Bubble).

## 🔑 Key Components

### Extension Side (`src/`)
-   **`extension.ts`**: Orchestrator. Connects VS Code Events -> Gatekeeper -> AI Service -> Webview.
-   **`GatekeeperService.ts`**: The bouncer. Decides if we talk.
-   **`AIService.ts`**: The mind. Talks to OpenAI, manages history.

### UI Side (`webview-ui/src/`)
-   **`App.tsx`**: State machine for Mood and Animation.
-   **`AvatarButton.tsx`**: The face. Accepts `className` for targeted animations.
-   **`SpeechBubble.tsx`**: The voice.

## 🛠 Development Workflow

1.  **Webview:** Built with Vite (`npm run build:watch`).
2.  **Extension:** Built with TSC (`npm run watch`).
3.  **Run All:** `npm run dev:all`.

> **Tip:** If changing `App.tsx`, `Cmd+R` the Extension Host window to reload the webview cache.

## ⚠️ Critical Rules for AI Changes
1.  **Privacy:** Never send code unless Gatekeeper passes.
2.  **Cost:** Keep context < 4000 chars. Use `gpt-4o-mini`.
3.  **Persona:** Maintain the "Bipolar" vibe. Avoid being generic/robotic.
