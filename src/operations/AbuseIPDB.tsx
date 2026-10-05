import { lookupEach } from "@/lib/lookup";
import { SettingsManager } from "@/lib/settings";
import { Operation } from "@/lib/types";

export const AbuseIPDBCheckIPs: Operation = {
  name: "AbuseIPDB Check IPs",
  description: "Check IPs against AbuseIPDB",
  category: "malware",
  run: async (input) => {
    const keys = SettingsManager.getKeys();
    if (!keys.abuseIPDB) {
      return { result: "", error: "No AbuseIPDB API key found" };
    }

    return lookupEach(input, {
      provider: "abuseipdb",
      lookup: async (ip) => {
        const apiData = await fetch(
          `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&key=${keys.abuseIPDB}`,
        ).then((data) => data.json());
        if (apiData.errors && apiData.errors.length > 0) {
          const detail = apiData.errors[0]?.detail ?? "Request failed";
          return { result: `❌ (Error: ${detail}) ${ip}`, cache: false };
        }
        const reportsNum = apiData.data.totalReports;
        const mark = reportsNum > 0 ? "❌" : "✅";
        return {
          result: `${mark} (Reports: ${reportsNum}) ${ip}`,
          cache: true,
        };
      },
    });
  },
};
