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

export const MatchHTTPField: Operation = {
  name: "Match HTTP Field",
  description: "Match a field from HTTP logs",
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
    {
      name: "Match",
      type: "string",
      default: "",
    },
  ],
  run(input, options) {
    if (options === undefined) return { result: "" };

    return {
      result: input
        .split("\n")
        .filter((line) => {
          const parsed =
            /^(\S+) (\S+) (\S+) \[([\w:/]+\s[+\-]\d{4})\] (\S+) (\S+)\s*(\S+)?\s* (\d{3}) (\S+) "([^"]+)" "([^"]+)"/.exec(
              line
            );
          if (parsed) {
            if (options["Field"] == "IP") {
              return parsed[1].includes(options["Match"]);
            } else if (options["Field"] == "Referer") {
              return parsed[10].includes(options["Match"]);
            } else if (options["Field"] == "Method") {
              return parsed[5].includes(options["Match"]);
            } else if (options["Field"] == "Url") {
              return parsed[6].includes(options["Match"]);
            } else if (options["Field"] == "Time") {
              return parsed[4].includes(options["Match"]);
            } else if (options["Field"] == "Status") {
              return parsed[8].includes(options["Match"]);
            } else if (options["Field"] == "User-Agent") {
              return parsed[11].includes(options["Match"]);
            }
          }
        })
        .join("\n"),
    };
  },
};

export const RemoveStaticHTTPContentFromLogs: Operation = {
  name: "Remove Static HTTP Content from logs",
  description: "Remove static content from HTTP logs",
  category: "search",
  run: (input, options) => {
    return {
      result: input
        .split("\n")
        .filter((line) => {
          // Find the URL in the line
          const parsed =
            /^(\S+) (\S+) (\S+) \[([\w:/]+\s[+\-]\d{4})\] (\S+) (\S+)\s*(\S+)?\s* (\d{3}) (\S+) "([^"]+)" "([^"]+)"/.exec(
              line
            );
          if (parsed) {
            const uri = parsed[6];

            // Check if uri is static content (image, font, style, js, etc)
            const filename = uri.split("/").pop()?.split("?")[0];
            if (filename) {
              const extension = filename.split(".").pop();
              if (
                extension &&
                [
                  "png",
                  "jpg",
                  "jpeg",
                  "gif",
                  "svg",
                  "ico",
                  "css",
                  "js",
                  "woff",
                  "woff2",
                  "ttf",
                  "eot",
                ].includes(extension)
              ) {
                return false;
              }
            }
          }
          return true;
        })
        .join("\n"),
    };
  },
};
