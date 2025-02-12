import { SettingsManager } from "@/lib/settings";
import { Operation } from "@/lib/types";

export const AbuseIPDBCheckIPs: Operation = {
  name: "AbuseIPDB Check IPs",
  description: "Check IPs against AbuseIPDB",
  category: "malware",
  run: async (input) => {
    const ips = input.split("\n");
    const keys = SettingsManager.getKeys();

    if (!keys.abuseIPDB) {
      return {
        result: "",
        error: "No AbuseIPDB API key found",
      }
    }
    // fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&key=${ABUSEIPDB_TOKEN}`)

    let results: string[] = [];
    for (const ip of ips) {
      const apiData = await fetch(
        `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&key=${keys.abuseIPDB}`
      ).then((data) => data.json());
      if (apiData.errors && apiData.errors.length > 0) {
        results.push(`❌ (Error: ) ${ip}`);
        continue;
      }
      const reportsNum = apiData.data.totalReports;
      const mark = reportsNum > 0 ? "❌" : "✅";
      results.push(`${mark} (Reports: ${reportsNum}) ${ip}`);
    }

    return {result: results.join("\n")};
  },
};
