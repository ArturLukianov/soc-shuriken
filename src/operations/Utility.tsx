import { Operation } from "@/lib/types";

export const UniqueLines: Operation = {
  name: "Unique Lines",
  description: "Remove duplicate lines",
  category: "utility",
  run: (input) => {
    return { result: [...new Set(input.split("\n"))].join("\n") };
  },
};

export const DuplicateLines: Operation = {
  name: "Duplicate Lines",
  description: "Show duplicate lines",
  category: "utility",
  run: (input) => {
    const lines = input.split("\n");
    const seen = new Map();
    
    for (const line of lines) {
      seen.set(line, (seen.get(line) || 0) + 1);
    }
    
    return {
      result: lines.filter(line => seen.get(line) > 1).join("\n")
    };
  },
};

export const SquashSpaces: Operation = {
  name: "Squash Spaces",
  description: "Remove extra spaces",
  category: "utility",
  run: (input) => {
    return { result: input.replace(/\s+/g, " ") };
  },
};

export const CutField: Operation = {
  name: "Cut Field",
  description: "Cut a field from a line",
  category: "utility",
  options: [
    {
      type: "string",
      name: "Separator",
      default: " ",
    },
    {
      type: "number",
      name: "Field",
      default: 0,
    },
  ],
  run: (input, options) => {
    if (options === undefined) return { result: "" };
    return {
      result: input
        .split("\n")
        .map(
          (line) => line.split(options["Separator"])[parseInt(options["Field"])]
        )
        .join("\n"),
    };
  },
};

export const Grep: Operation = {
  name: "Grep",
  description: "Grep for a pattern",
  category: "search",
  options: [
    {
      name: "Pattern",
      default: "",
      type: "string",
    },
  ],
  run: (input, options) => {
    if (options === undefined) return { result: "" };
    return {
      result: input
        .split("\n")
        .filter((line) => line.includes(options["Pattern"]))
        .join("\n"),
    };
  },
};

export const GrepRegex: Operation = {
  name: "Grep Regex",
  description: "Grep for a regex pattern",
  category: "search",
  options: [
    {
      type: "string",
      name: "Pattern",
      default: "",
    },
  ],
  run: (input, options) => {
    if (options === undefined) return { result: "" };
    return {
      result: input
        .split("\n")
        .filter((line) => new RegExp(options["Pattern"]).test(line))
        .join("\n"),
    };
  },
};

export const GrepNot: Operation = {
  name: "Grep Not",
  description: "Grep for a negative pattern",
  category: "search",
  options: [
    {
      type: "string",
      name: "Pattern",
      default: "",
    },
  ],
  run: (input, options) => {
    if (options === undefined) return { result: "" };
    return {
      result: input
        .split("\n")
        .filter((line) => !line.includes(options["Pattern"]))
        .join("\n"),
    };
  },
};

export const Sort: Operation = {
  name: "Sort",
  description: "Sort lines",
  category: "utility",
  run: (input) => {
    return { result: input.split("\n").sort().join("\n") };
  },
};

export const ExtractRegex: Operation = {
  name: "Extract Regex",
  description: "Extract a regex pattern",
  category: "search",
  options: [
    {
      type: "string",
      name: "Pattern",
      default: "",
    },
  ],
  run: (input, options) => {
    if (options === undefined) return { result: "" };
    return {
      result: input
        .split("\n")
        .map((line) => line.match(new RegExp(options["Pattern"], "g")) || [])
        .flat()
        .join("\n"),
    };
  },
};
