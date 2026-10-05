import { lookupEach } from "@/lib/lookup";
import { Operation } from "@/lib/types";

export const LeakCheckEmails: Operation = {
  name: "LeakCheck Emails",
  description: "Check Emails against LeakCheck",
  category: "malware",
  run: (input) =>
    lookupEach(input, {
      provider: "leakcheck",
      // The public API is rate limited
      delayMs: 1000,
      lookup: async (email) => {
        const apiData = await fetch(
          `https://leakcheck.io/api/public?check=${encodeURIComponent(email)}`,
        ).then((data) => data.json());

        // "Not found" is reported as a failure, but it means zero leaks
        if (!apiData.success && apiData.error !== "Not found") {
          return {
            result: `❌ (Error: ${apiData.error ?? "Request failed"}) ${email}`,
            cache: false,
          };
        }
        const leaksNum = apiData.found ?? 0;
        const mark = leaksNum > 0 ? "❌" : "✅";
        return { result: `${mark} (Leaks: ${leaksNum}) ${email}`, cache: true };
      },
    }),
};
