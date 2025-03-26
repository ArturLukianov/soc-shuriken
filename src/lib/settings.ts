// src/lib/settings.ts
export interface ApiKeys {
  abuseIPDB?: string;
  virusTotal?: string;
  abusech?: string;
  opentip?: string;
  ipinfo?: string;
}

export class SettingsManager {
  private static STORAGE_KEY = "soc-tool-settings";

  static saveKeys(keys: ApiKeys): void {
    try {
      // Basic obfuscation (not encryption!)
      const encoded = btoa(JSON.stringify(keys));
      localStorage.setItem(this.STORAGE_KEY, encoded);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  static getKeys(): ApiKeys {
    try {
      const encoded = localStorage.getItem(this.STORAGE_KEY) || "";
      return JSON.parse(atob(encoded)) || {};
    } catch (error) {
      return {};
    }
  }

  static clearKeys(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
