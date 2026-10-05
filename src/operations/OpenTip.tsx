import { lookupEach } from "@/lib/lookup";
import { SettingsManager } from "@/lib/settings";
import { Operation } from "@/lib/types";

export const OpenTIPLookup: Operation = {
  name: "OpenTIP Lookup",
  description: "Check IPs against Kaspersky OpenTIP",
  category: "malware",
  run: async (input) => {
    const keys = SettingsManager.getKeys();
    if (!keys.opentip) {
      return { result: "", error: "No OpenTIP API key found" };
    }

    return lookupEach(input, {
      provider: "opentip",
      concurrency: 5,
      lookup: async (ip) => {
        const response = await fetch(
          `https://opentip.kaspersky.com/api/v1/search/ip?request=${encodeURIComponent(ip)}`,
          { headers: { Authorization: `Bearer ${keys.opentip}` } },
        );
        if (!response.ok) {
          return { result: `${ip}: ❌ (API Error)`, cache: false };
        }

        const data = await response.json();
        if (!data?.detection || !data?.location) {
          return { result: `${ip}: ❌ (No data)`, cache: true };
        }

        const zone = data.detection.zone || "Unknown Zone"; // Уровень опасности
        const country = data.location.country_code || "Unknown Country";
        const owner = data.as_info?.owner || "Unknown Owner"; // Владелец IP

        return { result: `${ip}: ${zone}, ${country}, ${owner}`, cache: true };
      },
    });
  },
};
