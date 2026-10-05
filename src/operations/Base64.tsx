import { base64ToBytes, bytesToBase64, utf8 } from "@/lib/encoding";
import { Operation } from "@/lib/types";

export const Base64Decode: Operation = {
  name: "Base64 Decode",
  description: "Decode Base64 (standard or URL-safe) to UTF-8 text",
  category: "decode",
  run: (input) => {
    try {
      return { result: utf8.decode(base64ToBytes(input)) };
    } catch {
      return { result: "", error: "Invalid Base64 input" };
    }
  },
};

export const Base64Encode: Operation = {
  name: "Base64 Encode",
  description: "Encode UTF-8 text as Base64",
  category: "decode",
  run: (input) => ({ result: bytesToBase64(utf8.encode(input)) }),
};
