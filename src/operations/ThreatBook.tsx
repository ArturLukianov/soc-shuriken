import { lookupEach } from "@/lib/lookup";
import { SettingsManager } from "@/lib/settings";
import { Operation } from "@/lib/types";

export const ThreatbookCheckIP: Operation = {
  name: "Threatbook Check IP",
  description: "Check IP reputation using Threatbook API",
  category: "intel",
  run: async (input) => {
    const keys = SettingsManager.getKeys();
    if (!keys.threatbook) {
      return { result: "", error: "No Threatbook API key found" };
    }

    return lookupEach(input, {
      provider: "threatbook",
      lookup: async (ip) => {
        const response = await fetch(
          `https://api.threatbook.io/v1/community/ip?apikey=${keys.threatbook}&resource=${encodeURIComponent(ip)}`,
        );
        const apiData = await response.json();

        if (apiData.response_code !== 200) {
          return { result: `❌ (Error: Request failed) ${ip}`, cache: false };
        }

        const { summary } = apiData.data;
        const isMalicious = summary.judgments.length > 0;
        const mark = isMalicious ? "❌" : "✅";
        const threats = summary.judgments.join(",");

        return { result: `${mark} (${threats}) ${ip}`, cache: true };
      },
    });
  },
};
