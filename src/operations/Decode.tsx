import { base64ToBytes, bytesToHex, hexToBytes, utf8 } from "@/lib/encoding";
import { Operation } from "@/lib/types";

// Matches -e, -ec, -enc ... -EncodedCommand; PowerShell also accepts "/" and
// en/em dashes as the parameter prefix (common in obfuscated commands)
const ENCODED_COMMAND_RE =
  /(?:^|\s)[-/–—―](e[a-z]*)\s+["']?([A-Za-z0-9+/=]{8,})/gi;

function isEncodedCommandFlag(flag: string): boolean {
  const lower = flag.toLowerCase();
  return lower === "ec" || "encodedcommand".startsWith(lower);
}

// -EncodedCommand is UTF-16LE, but tolerate UTF-8 payloads too
function decodeScript(bytes: Uint8Array): string {
  let zerosAtOddIndexes = 0;
  for (let i = 1; i < bytes.length; i += 2) {
    if (bytes[i] === 0) zerosAtOddIndexes++;
  }
  const looksUtf16 = zerosAtOddIndexes > bytes.length / 2 / 3;
  return new TextDecoder(looksUtf16 ? "utf-16le" : "utf-8").decode(bytes);
}

export const PowerShellDecode: Operation = {
  name: "PowerShell Decode",
  description:
    "Decode -EncodedCommand (Base64 UTF-16LE) from a command line or bare Base64",
  category: "decode",
  run: (input) => {
    const payloads = [...input.matchAll(ENCODED_COMMAND_RE)]
      .filter(([, flag]) => isEncodedCommandFlag(flag))
      .map(([, , payload]) => payload);
    if (payloads.length === 0) payloads.push(input.trim());

    try {
      return {
        result: payloads
          .map((payload) => decodeScript(base64ToBytes(payload)))
          .join("\n\n"),
      };
    } catch {
      return {
        result: "",
        error: "No -EncodedCommand found and input is not valid Base64",
      };
    }
  },
};

export const URLDecode: Operation = {
  name: "URL Decode",
  description: "Decode %XX escapes (and + as space)",
  category: "decode",
  options: [
    {
      name: "Plus as space",
      type: "boolean",
      default: "true",
    },
  ],
  run: (input, options) => {
    const text =
      options?.["Plus as space"] === "false"
        ? input
        : input.replace(/\+/g, " ");
    return {
      // Decode runs of escapes separately so one malformed sequence doesn't
      // fail the whole input
      result: text.replace(/(?:%[0-9a-f]{2})+/gi, (run) => {
        try {
          return decodeURIComponent(run);
        } catch {
          return run.replace(/%([0-9a-f]{2})/gi, (_, hex: string) =>
            String.fromCharCode(parseInt(hex, 16)),
          );
        }
      }),
    };
  },
};

export const URLEncode: Operation = {
  name: "URL Encode",
  description: "Percent-encode text",
  category: "decode",
  run: (input) => ({
    result: input
      .split("\n")
      .map((line) => encodeURIComponent(line))
      .join("\n"),
  }),
};

export const HexDecode: Operation = {
  name: "Hex Decode",
  description: "Decode hex (48656c6c6f, 0x48 0x65, \\x48\\x65) to UTF-8 text",
  category: "decode",
  run: (input) => {
    try {
      return { result: utf8.decode(hexToBytes(input)) };
    } catch (e) {
      return { result: "", error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export const HexEncode: Operation = {
  name: "Hex Encode",
  description: "Encode UTF-8 text as hex",
  category: "decode",
  options: [
    {
      name: "Separator",
      type: "string",
      default: "",
    },
  ],
  run: (input, options) => ({
    result: bytesToHex(utf8.encode(input), options?.["Separator"] ?? ""),
  }),
};

function detectCompression(bytes: Uint8Array): CompressionFormat {
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) return "gzip";
  // zlib header: CMF 0x78 and (CMF*256 + FLG) divisible by 31
  if (bytes[0] === 0x78 && (bytes[0] * 256 + bytes[1]) % 31 === 0) {
    return "deflate";
  }
  return "deflate-raw";
}

export const Decompress: Operation = {
  name: "Decompress",
  description:
    "Decompress gzip / zlib / raw deflate data given as Base64 or hex",
  category: "decode",
  options: [
    {
      name: "Input format",
      type: "select",
      default: "Base64",
      select: ["Base64", "Hex"],
    },
  ],
  run: async (input, options) => {
    let bytes: Uint8Array;
    try {
      bytes =
        options?.["Input format"] === "Hex"
          ? hexToBytes(input)
          : base64ToBytes(input);
    } catch (e) {
      return { result: "", error: e instanceof Error ? e.message : String(e) };
    }

    const format = detectCompression(bytes);
    try {
      const stream = new Blob([bytes])
        .stream()
        .pipeThrough(new DecompressionStream(format));
      const decompressed = new Uint8Array(
        await new Response(stream).arrayBuffer(),
      );
      return { result: utf8.decode(decompressed), info: `Format: ${format}` };
    } catch {
      return { result: "", error: `Data is not valid ${format}` };
    }
  },
};
