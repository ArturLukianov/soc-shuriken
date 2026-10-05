import { Operation } from "@/lib/types";

export const UniqueLines: Operation = {
  name: "Unique Lines",
  description: "Remove duplicate lines",
  category: "text",
  run: (input) => {
    return { result: [...new Set(input.split("\n"))].join("\n") };
  },
};

export const DuplicateLines: Operation = {
  name: "Duplicate Lines",
  description: "Show duplicate lines",
  category: "text",
  run: (input) => {
    const lines = input.split("\n");
    const seen = new Map();
    
    for (const line of lines) {
      seen.set(line, (seen.get(line) || 0) + 1);
    }
    
    return { result: [...new Set(lines.filter(line => seen.get(line) > 1))].join("\n") };
  },
};

export const SquashSpaces: Operation = {
  name: "Squash Spaces",
  description: "Remove extra spaces",
  category: "text",
  run: (input) => {
    return { result: input.replace(/[ \t]+/g, " ") };
  },
};

export const CutField: Operation = {
  name: "Cut Field",
  description: "Cut a field from a line",
  category: "text",
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
  category: "filter",
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
  category: "filter",
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
  category: "filter",
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
  category: "text",
  run: (input) => {
    return { result: input.split("\n").sort().join("\n") };
  },
};

export const ExtractRegex: Operation = {
  name: "Extract Regex",
  description: "Extract a regex pattern",
  category: "extract",
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

export const CountOccurrences: Operation = {
  name: "Count Occurrences",
  description:
    "Count identical lines, most frequent first (sort | uniq -c | sort -nr)",
  category: "text",
  run: (input) => {
    const counts = new Map<string, number>();
    for (const line of input.split("\n")) {
      if (line.trim() === "") continue;
      counts.set(line, (counts.get(line) ?? 0) + 1);
    }
    // Stable sort keeps first-seen order for equal counts
    const sorted = [...counts].sort((a, b) => b[1] - a[1]);
    const width = String(sorted[0]?.[1] ?? 0).length;
    return {
      result: sorted
        .map(([line, count]) => `${String(count).padStart(width)} ${line}`)
        .join("\n"),
      info: `${sorted.length} distinct of ${[...counts.values()].reduce((a, b) => a + b, 0)} lines`,
    };
  },
};
