import { Operation } from "@/lib/types";

export const JSONExtract: Operation = {
  name: "JSON Extract",
  description: "Extract a JSON field",
  category: "convert",
  options: [
    {
      name: "Field",
      type: "string",
      default: "",
    },
  ],
  run: (input, options) => {
    if (!options) return { result: "" };

    const fieldName = options["Field"];
    return {
      result: input.split("\n").map((line) => {
        const data = JSON.parse(line);
        return data[fieldName];
      }).join("\n"),
    };
  },
};
