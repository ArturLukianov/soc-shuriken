// lib/encoding.ts

// Accepts whitespace, URL-safe alphabet (-_) and missing padding
export function base64ToBytes(input: string): Uint8Array {
  const base64 = input
    .replace(/\s+/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
    throw new Error("Invalid Base64 input");
  }
  const padded = base64.replace(/=+$/, "");
  if (padded.length % 4 === 1) throw new Error("Invalid Base64 length");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

// Accepts "48656c6c6f", "48 65 6c", "0x48,0x65", "\x48\x65", "48:65"
export function hexToBytes(input: string): Uint8Array {
  const hex = input.replace(/0x|\\x|[\s,:;-]/gi, "");
  if (!/^[0-9a-f]*$/i.test(hex)) throw new Error("Invalid hex input");
  if (hex.length % 2 !== 0) throw new Error("Hex input has an odd length");
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array, separator = ""): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    separator,
  );
}

export const utf8 = {
  encode: (text: string) => new TextEncoder().encode(text),
  decode: (bytes: Uint8Array) => new TextDecoder().decode(bytes),
};
