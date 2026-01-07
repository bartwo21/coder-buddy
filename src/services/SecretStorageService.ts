import type { ExtensionContext, SecretStorage } from "vscode";

export class SecretStorageService {
  private static _instance: SecretStorageService;
  private constructor(private secretStorage: SecretStorage) { }

  static init(context: ExtensionContext): void {
    SecretStorageService._instance = new SecretStorageService(context.secrets);
  }

  static get instance(): SecretStorageService {
    return SecretStorageService._instance;
  }

  async storeKey(token: string): Promise<void> {
    await this.secretStorage.store("openai_api_key", token);
  }

  async getKey(): Promise<string | undefined> {
    return await this.secretStorage.get("openai_api_key");
  }

  async deleteKey(): Promise<void> {
    await this.secretStorage.delete("openai_api_key");
  }
}
