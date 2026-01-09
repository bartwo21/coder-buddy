import type * as vscode from "vscode";

export class GatekeeperService {
  private static _instance: GatekeeperService;
  private lastAnalysisTime: number = 0;
  private lastCodeLength: number = 0;
  private readonly COOLDOWN_MS = 10 * 1000; // 10 Seconds (Relaxed for testing) - was 5 mins


  private constructor() { }

  static get instance(): GatekeeperService {
    if (!GatekeeperService._instance) {
      GatekeeperService._instance = new GatekeeperService();
    }
    return GatekeeperService._instance;
  }

  /**
   * Decides if the AI should be triggered based on Cooldown, Diff, and RNG.
   * Note: Debounce should be handled by the caller (extension event listener).
   */

  shouldTrigger(document: vscode.TextDocument): boolean {
    const currentCode = document.getText();
    const currentTime = Date.now();

    // 1. Cooldown Check
    if (currentTime - this.lastAnalysisTime < this.COOLDOWN_MS) {
      return false;
    }

    // 2. Diff Check
    if (Math.abs(currentCode.length - this.lastCodeLength) < 10) { // Relaxed from 50
      return false;
    }

    // --- PASSED ---
    // Update state
    this.lastAnalysisTime = currentTime;
    this.lastCodeLength = currentCode.length;

    return true;
  }
}
