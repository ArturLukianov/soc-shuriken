import { Operation } from "@/lib/types";
import { UAParser } from "ua-parser-js";

export const UserAgentParser: Operation = {
  name: "User-Agent Parser",
  description: "Parse a user agent string",
  category: "utility",
  run: (input, options) => {
    return {
      result: input
        .split("\n")
        .map((line) => {
          const { browser, os } = UAParser(line);
          if (browser.name === undefined) {
            return "Unknown Browser - - - : " + line;
          }
          return (
            browser.name +
            " " +
            browser.version +
            " " +
            os.name +
            " " +
            os.version +
            " : " +
            line
          );
        })
        .join("\n"),
    };
  },
};
