import * as vscode from "vscode";

const VIEW_ID = "aiCompanion.sidebar";
const WEBVIEW_DIST_DIR = "webview-ui/build";

export function activate(context: vscode.ExtensionContext) {
	const provider = new AICompanionViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(VIEW_ID, provider, {
			webviewOptions: { retainContextWhenHidden: true },
		})
	);
}

class AICompanionViewProvider implements vscode.WebviewViewProvider {
	constructor(private readonly extensionUri: vscode.Uri) { }

	async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
		const webview = webviewView.webview;

		webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, WEBVIEW_DIST_DIR)],
		};

		try {
			const indexPath = vscode.Uri.joinPath(
				this.extensionUri,
				WEBVIEW_DIST_DIR,
				"index.html"
			);
			const bytes = await vscode.workspace.fs.readFile(indexPath);
			const html = new TextDecoder("utf-8").decode(bytes);
			webview.html = this.withWebviewCsp(html, webview);
		} catch {
			webview.html = this.withWebviewCsp(this.getMissingBuildHtml(), webview);
		}
	}

	private withWebviewCsp(html: string, webview: vscode.Webview): string {
		// Vite singlefile build inline script/style üretir.
		// DiceBear için https görsellerine izin veriyoruz.
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
				meta
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
