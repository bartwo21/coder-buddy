import * as vscode from "vscode";
import { AIService } from "./services/AIService";
import { GatekeeperService } from "./services/GatekeeperService";
import { SecretStorageService } from "./services/SecretStorageService";

const VIEW_ID = "aiCompanion.sidebar";
const WEBVIEW_DIST_DIR = "webview-ui/build";
const DEBOUNCE_DELAY = 1000; // 1 second

let debounceTimer: NodeJS.Timeout | undefined;

export async function activate(context: vscode.ExtensionContext) {
	// 1. Init Services
	SecretStorageService.init(context);
	const secretStorage = SecretStorageService.instance;
	const gatekeeper = GatekeeperService.instance;
	const aiService = AIService.instance;

	const provider = new AICompanionViewProvider(context.extensionUri);

	// 2. Register Webview
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(VIEW_ID, provider, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	);

	// 3. Register Commands
	context.subscriptions.push(
		vscode.commands.registerCommand("coderBuddy.setApiKey", async () => {
			const apiKey = await vscode.window.showInputBox({
				title: "Enter your OpenAI API Key",
				prompt: "Starts with sk-...",
				ignoreFocusOut: true,
				password: true,
				validateInput: (value) => {
					if (!value.startsWith("sk-")) {
						return "API Key must start with 'sk-'";
					}
					return null;
				},
			});

			if (apiKey) {
				await secretStorage.storeKey(apiKey);
				vscode.window.showInformationMessage("API Key saved securely! 🤖");

				provider.sendMessage({
					command: "updateMood",
					mood: "idle",
					text: "just vibing. waiting for you to cook something"
				});
			}
		}),
		vscode.commands.registerCommand("coderBuddy.removeApiKey", async () => {
			const choice = await vscode.window.showWarningMessage(
				"Are you sure you want to remove your OpenAI API Key? Coder Buddy will stop working.",
				"Yes, Remove It",
				"Cancel"
			);

			if (choice === "Yes, Remove It") {
				await secretStorage.deleteKey();
				vscode.window.showInformationMessage("API Key removed. Coder Buddy is now dormant. 😴");
			}
		}),
	);

	// 4. Check for Key on Startup
	// 4. Check for Key on Startup (Non-blocking)
	secretStorage.getKey().then((key) => {
		if (!key) {
			vscode.window
				.showInformationMessage(
					"Coder Buddy needs an OpenAI API Key to work.",
					"Enter Key",
					"How to Get?",
				)
				.then((result) => {
					if (result === "Enter Key") {
						vscode.commands.executeCommand("coderBuddy.setApiKey");
					} else if (result === "How to Get?") {
						vscode.env.openExternal(
							vscode.Uri.parse("https://platform.openai.com/api-keys"),
						);
					}
				});
		}
	});

	// 5. Watch for Code Changes (The Brain)
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument((event) => {
			const editor = vscode.window.activeTextEditor;
			if (!editor || editor.document !== event.document) {
				return;
			}

			// Clear existing timer
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}

			// Set new timer (Debounce)
			debounceTimer = setTimeout(async () => {

				// 1. Gatekeeper Check
				if (gatekeeper.shouldTrigger(event.document)) {
					// 2. AI Analysis
					const result = await aiService.analyzeCode(event.document.getText());

					// 3. UI Update
					if (result) {
						provider.sendMessage({
							command: "updateMood",
							mood: result.mood,
							text: result.text,
						});
					}
				}
			}, DEBOUNCE_DELAY);
		}),
	);
}

class AICompanionViewProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;

	constructor(private readonly extensionUri: vscode.Uri) { }

	public resolveWebviewView(webviewView: vscode.WebviewView): void {
		this._view = webviewView;
		const webview = webviewView.webview;

		webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this.extensionUri, WEBVIEW_DIST_DIR),
			],
		};

		this.setWebviewHtml(webview);
	}

	public sendMessage(message: any) {
		if (this._view) {
			this._view.webview.postMessage(message);
		}
	}

	private async setWebviewHtml(webview: vscode.Webview) {
		try {
			const indexPath = vscode.Uri.joinPath(
				this.extensionUri,
				WEBVIEW_DIST_DIR,
				"index.html",
			);
			const bytes = await vscode.workspace.fs.readFile(indexPath);
			const html = new TextDecoder("utf-8").decode(bytes);
			webview.html = this.withWebviewCsp(html, webview);

			setTimeout(async () => {
				const key = await SecretStorageService.instance.getKey();
				if (!key) {
					this.sendMessage({
						command: "updateMood",
						mood: "angry",
						text: "where is the api key? 💀 press CTRL+SHIFT+P and run 'Coder Buddy: Set API Key'"
					});
				}
			}, 4000);
		} catch {
			webview.html = this.withWebviewCsp(this.getMissingBuildHtml(), webview);
		}
	}

	private withWebviewCsp(html: string, webview: vscode.Webview): string {
		const csp = [
			"default-src 'none';",
			`img-src ${webview.cspSource} https: data:;`,
			`style-src ${webview.cspSource} 'unsafe-inline';`,
			`script-src ${webview.cspSource} 'unsafe-inline';`,
			`font-src ${webview.cspSource} data:;`,
		].join(" ");

		const meta = `<meta http-equiv="Content-Security-Policy" content="${csp}">`;

		if (html.includes('http-equiv="Content-Security-Policy"')) {
			return html.replace(
				/<meta\s+http-equiv="Content-Security-Policy"[^>]*>/i,
				meta,
			);
		}
		return html.replace(/<\/head>/i, `${meta}\n</head>`);
	}

	private getMissingBuildHtml(): string {
		return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Coder Buddy</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 12px; }
      code { background: rgba(127,127,127,.2); padding: 2px 6px; border-radius: 6px; }
    </style>
  </head>
  <body>
    <h3>Coder Buddy UI build bulunamadı</h3>
    <p>Önce UI'yi build et:</p>
    <p><code>cd webview-ui</code></p>
    <p><code>npm run build</code></p>
    <p>Sonra Extension Development Host'u reload et.</p>
  </body>
</html>`;
	}
}

export function deactivate() { }
