import { Operation } from "@/lib/types";

export const XORWithKey: Operation = {
  name: "XOR with key",
  description: "XOR with key",
  category: "crypto",
  options: [
    {
      name: "Key (hex)",
      default: "00",
      type: "string",
    },
  ],
  run: (input, options) => {
    if (options === undefined) {
      return { result: "" };
    }
    const key = parseInt(options["Key (hex)"], 16);
    return {
      result: input
        .split("")
        .map((c) => String.fromCharCode(c.charCodeAt(0) ^ key))
        .join(""),
    };
  },
};
