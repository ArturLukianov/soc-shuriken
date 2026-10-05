import { lookupEach } from "@/lib/lookup";
import { SettingsManager } from "@/lib/settings";
import { Operation } from "@/lib/types";

export const IPInfo: Operation = {
  name: "IP Location & ASN Lookup",
  description: "Get geolocation and ASN information using IPinfo.io",
  category: "network",
  run: async (input) => {
    const keys = SettingsManager.getKeys();
    if (!keys.ipinfo) {
      return { result: "", error: "No IPinfo API key found" };
    }

    return lookupEach(input, {
      provider: "ipinfo",
      lookup: async (ip) => {
        const response = await fetch(
          `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${keys.ipinfo}`,
        );
        const data = await response.json();

        if (data.error) {
          return {
            result: `❌ (Error: ${data.error.title}) ${ip}`,
            cache: false,
          };
        }

        const country = data.country || "Unknown";
        const city = data.city || "Unknown";
        const region = data.region || "Unknown";
        // org is already formatted as "AS15169 Google LLC"
        const org = data.org || "ASN Unknown";

        return {
          result: `📍 (Country: ${country}, Region: ${region}, City: ${city}) | ${org} | ${ip}`,
          cache: true,
        };
      },
    });
  },
};
