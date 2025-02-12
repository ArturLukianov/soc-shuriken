import { Operation } from "@/lib/types";

export const LeakCheckEmails: Operation = {
  name: "LeakCheck Emails",
  description: "Check Emails against LeakCheck",
  category: "malware",
  run: async (input) => {
    const emails = input.split("\n");

    let results: string[] = [];
    for (const email of emails) {
      const apiData = await fetch(
        `https://leakcheck.io/api/public?check=${email}`
      ).then((data) => data.json());
      const leaksNum = apiData.found;

      const mark = leaksNum > 0 ? "❌" : "✅";
      results.push(`${mark} (Leaks: ${leaksNum}) ${email}`);
      // Sleep 1 second
      await new Promise((r) => setTimeout(r, 1000));
    }

    return {result: results.join("\n")};
  },
};
