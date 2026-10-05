import { lookupEach, LookupOutcome } from "@/lib/lookup";
import { SettingsManager } from "@/lib/settings";
import { Operation } from "@/lib/types";

// Kaspersky OpenTIP API: GET /api/v1/search/{hash|ip|domain|url}?request=...
// with the token in the x-api-key header. Status codes per Kaspersky's
// reference client: 404 means there is no data for the object.
const ERROR_REASONS: Record<number, string> = {
  400: "Bad request",
  401: "Authentication failed: check the API token",
  403: "Quota or request limit exceeded",
};

// Untyped API JSON; fields are read defensively
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = Record<string, any>;

type OpenTipResponse =
  { found: true; data: ApiData } | { found: false } | { error: string };

async function opentipSearch(
  type: "hash" | "ip",
  value: string,
  apiKey: string,
): Promise<OpenTipResponse> {
  const response = await fetch(
    `https://opentip.kaspersky.com/api/v1/search/${type}?request=${encodeURIComponent(value)}`,
    { headers: { "x-api-key": apiKey } },
  );
  if (response.status === 404) return { found: false };
  if (!response.ok) {
    return {
      error: ERROR_REASONS[response.status] ?? `HTTP ${response.status}`,
    };
  }
  return { found: true, data: await response.json() };
}

const ZONE_MARKS: Record<string, string> = {
  Red: "❌",
  Orange: "⚠️",
  Yellow: "⚠️",
  Green: "✅",
  Grey: "❔",
};

const mark = (zone: string | undefined) => ZONE_MARKS[zone ?? ""] ?? "❔";

function outcome(
  response: OpenTipResponse,
  value: string,
  // Extra details to show; empty values are dropped
  describe: (data: ApiData) => (string | undefined)[],
): LookupOutcome {
  if ("error" in response) {
    return { result: `❌ (Error: ${response.error}) ${value}`, cache: false };
  }
  if (!response.found) {
    return { result: `❔ (Not found) ${value}`, cache: true };
  }
  const zone: string | undefined = response.data.Zone;
  const details = [zone ?? "Unknown zone", ...describe(response.data)].filter(
    Boolean,
  );
  return {
    result: `${mark(zone)} (${details.join(", ")}) ${value}`,
    cache: true,
  };
}

function requireKey() {
  return SettingsManager.getKeys().opentip;
}

export const OpenTIPLookup: Operation = {
  name: "OpenTIP Lookup",
  description: "Check IPs against Kaspersky OpenTIP",
  category: "intel",
  run: async (input) => {
    const apiKey = requireKey();
    if (!apiKey) return { result: "", error: "No OpenTIP API key found" };

    return lookupEach(input, {
      // Results cached before the response parsing fix were all "No data"
      provider: "opentip-ip",
      concurrency: 5,
      lookup: async (ip) =>
        outcome(await opentipSearch("ip", ip, apiKey), ip, (data) => {
          const info = data.IpGeneralInfo ?? {};
          const asn = data.IpWhoIs?.Asn?.[0];
          return [
            info.Status,
            info.CountryCode,
            asn &&
              `AS${asn.Number}${asn.Description?.length ? ` ${asn.Description.join(" ")}` : ""}`,
          ];
        }),
    });
  },
};

const HASH_RE = /^(?:[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64})$/;

export const OpenTIPHashLookup: Operation = {
  name: "OpenTIP Hash Lookup",
  description:
    "Check MD5 / SHA1 / SHA256 file hashes against Kaspersky OpenTIP",
  category: "intel",
  run: async (input) => {
    const apiKey = requireKey();
    if (!apiKey) return { result: "", error: "No OpenTIP API key found" };

    return lookupEach(input.toLowerCase(), {
      provider: "opentip-hash",
      concurrency: 5,
      lookup: async (hash) => {
        if (!HASH_RE.test(hash)) {
          return {
            result: `❌ (Not an MD5/SHA1/SHA256 hash) ${hash}`,
            cache: false,
          };
        }
        return outcome(
          await opentipSearch("hash", hash, apiKey),
          hash,
          (data) => {
            const status: string | undefined = data.FileGeneralInfo?.FileStatus;
            const detections: string[] = (data.DetectionsInfo ?? [])
              .map(
                (detection: { DetectionName?: string }) =>
                  detection.DetectionName,
              )
              .filter(Boolean);
            const shown = detections.slice(0, 3).join(" | ");
            const more =
              detections.length > 3 ? ` +${detections.length - 3} more` : "";
            return [status && (shown ? `${status}: ${shown}${more}` : status)];
          },
        );
      },
    });
  },
};
