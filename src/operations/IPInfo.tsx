import { SettingsManager } from "@/lib/settings";
import { Operation } from "@/lib/types";

export const IPInfo: Operation = {
  name: "IP Location & ASN Lookup",
  description: "Get geolocation and ASN information using IPinfo.io",
  category: "network",
  run: async (input) => {
    const ips = input.split("\n");
    const keys = SettingsManager.getKeys();

    if (!keys.ipinfo) {
      return {
        result: "",
        error: "No IPinfo API key found",
      };
    }

    const results: string[] = [];
    for (const ip of ips) {
      const trimmedIp = ip.trim();
      if (!trimmedIp) continue;

      try {
        const response = await fetch(
          `https://ipinfo.io/${encodeURIComponent(trimmedIp)}/json?token=${keys.ipinfo}`,
        );
        const data = await response.json();

        if (data.error) {
          results.push(`❌ (Error: ${data.error.title}) ${trimmedIp}`);
          continue;
        }

        const country = data.country || "Unknown";
        const city = data.city || "Unknown";
        const region = data.region || "Unknown";
        // org is already formatted as "AS15169 Google LLC"
        const org = data.org || "ASN Unknown";

        results.push(
          `📍 (Country: ${country}, Region: ${region}, City: ${city}) | ${org} | ${trimmedIp}`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push(`❌ (Error: ${message}) ${trimmedIp}`);
      }
    }

    return { result: results.join("\n") };
  },
};
