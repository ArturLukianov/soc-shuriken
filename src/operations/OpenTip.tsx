import { SettingsManager } from "@/lib/settings";
import { Operation } from "@/lib/types";

export const OpenTIPLookup: Operation = {
  name: "OpenTIP Lookup",
  description: "Check IPs against Kaspersky OpenTIP",
  category: "malware",
  run: async (input) => {
    const ips = input.split("\n").filter(ip => ip.trim() !== "");
    const keys = SettingsManager.getKeys();

    if (!keys.opentip) {
      return {
        result: "",
        error: "No OpenTIP API key found",
      };
    }

    const results = await Promise.all(
      ips.map(async (ip) => {
        try {
          const response = await fetch(`https://opentip.kaspersky.com/api/v1/ip/${ip}`, {
            headers: { Authorization: `Bearer ${keys.opentip}` },
          });

          if (!response.ok) {
            return `${ip}: ❌ (API Error)`;
          }

          const data = await response.json();
          if (!data?.detection || !data?.location) {
            return `${ip}: ❌ (No data)`;
          }

          const zone = data.detection.zone || "Unknown Zone"; // Уровень опасности
          const country = data.location.country_code || "Unknown Country";
          const owner = data.as_info?.owner || "Unknown Owner"; // Владелец IP

          return `${ip}: ${zone}, ${country}, ${owner}`;
        } catch (err) {
          return `${ip}: ❌ (Fetch Error)`;
        }
      })
    );

    return { result: results.join("\n") };
  },
};
