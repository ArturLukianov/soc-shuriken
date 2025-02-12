import { Operation } from "@/lib/types";

export const Base64Decode: Operation = {
  name: "Base64 Decode",
  description: "Decode Base64 encoded string",
  category: "crypto",
  run: (input) => {
    try {
      return {
        result: atob(input)
      };
    } catch (e) {
      return {
        result: "",
        error: "Invalid Base64 input"
      };
    }
  },
};

export const Base64Encode: Operation = {
  name: "Base64 Encode",
  description: "Encode Base64 encoded string",
  category: "crypto",
  run: (input) => {
    try {
      return {
        result: btoa(input),
      };
    } catch (e) {
      return { result: "", error: "Invalid Base64 input" };
    }
  },
};
