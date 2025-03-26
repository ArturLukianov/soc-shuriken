import { SettingsManager } from "@/lib/settings";
import { Operation } from "@/lib/types";

export const ThreatbookCheckIP: Operation = {
  name: "Threatbook Check IP",
  description: "Check IP reputation using Threatbook API",
  category: "malware",
  run: async (input) => {
    const ips = input.split("\n");
    const keys = SettingsManager.getKeys();

    if (!keys.threatbook) {
      return {
        result: "",
        error: "No Threatbook API key found",
      };
    }

    let results: string[] = [];
    for (const ip of ips) {
      if (!ip.trim()) continue;

      try {
        const response = await fetch(
          `https://api.threatbook.io/v1/community/ip?apikey=${keys.threatbook}&resource=${encodeURIComponent(ip)}`,
        );

        const apiData = await response.json();

        if (apiData.response_code !== 200) {
          results.push(`❌ (Error: Request failed) ${ip}`);
          continue;
        }

        const { summary } = apiData.data;
        const is_malicious = summary.judgments.length > 0;
        const mark = is_malicious ? "❌" : "✅";
        const threats = summary.judgments.join(",");

        results.push(`${mark} (${threats}) ${ip}`);
      } catch (error) {
        console.log(error);
        results.push(`❌ (Error: Request failed) ${ip}`);
      }
    }

    return { result: results.join("\n") };
  },
};
