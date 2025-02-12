import { Operation } from "@/lib/types";

export const ExtractFieldFromHTTPLogs: Operation = {
  name: "Extract Field From HTTP Logs",
  description: "Extract a field from HTTP logs",
  category: "search",
  options: [
    {
      name: "Field",
      type: "select",
      default: "Method",
      select: [
        "Method",
        "Url",
        "Time",
        "Status",
        "IP",
        "Referer",
        "User-Agent",
      ],
    },
  ],
  run: (input, options) => {
    if (options === undefined) return { result: "" };

    return {
      result: input
        .split("\n")
        .map((line) => {
          const parsed =
            /^(\S+) (\S+) (\S+) \[([\w:/]+\s[+\-]\d{4})\] (\S+) (\S+)\s*(\S+)?\s* (\d{3}) (\S+) "([^"]+)" "([^"]+)"/.exec(
              line
            );
          if (parsed) {
            if (options["Field"] == "IP") {
              return parsed[1];
            } else if (options["Field"] == "Referer") {
              return parsed[10];
            } else if (options["Field"] == "Method") {
              return parsed[5];
            } else if (options["Field"] == "Url") {
              return parsed[6];
            } else if (options["Field"] == "Time") {
              return parsed[4];
            } else if (options["Field"] == "Status") {
              return parsed[8];
            } else if (options["Field"] == "User-Agent") {
              return parsed[11];
            }
          }
        })
        .join("\n"),
    };
  },
};
