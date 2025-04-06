import { SettingsManager } from "@/lib/settings";
import { Operation } from "@/lib/types";




type CategoriesWithZone = {
  Name: string;
  Zone: string;
  [key: string]: any;
};

type NetInfo = {
  RangeStart?: string;
  RangeEnd?: string;
  Created?: string;
  Description?: string;
  [key: string]: any;
};

type ApiResponse = {
  Zone?: string;
  IpGeneralInfo?: {
    Ip?: string;
    CategoriesWithZone?: CategoriesWithZone[];
    [key: string]: any;
  };
  IpWhoIs?: {
    Net?: NetInfo;
    [key: string]: any;
  };
  [key: string]: any;
};


const zoneEmojis: Record<string, string> = {
  Grey: '⬜️',
  Green: '🟩',
  Yellow: '🟨',
  Orange: '🟧',
  Red: '🟥'
};

function formatSingleResponse(res: ApiResponse): string {
  const emoji = zoneEmojis[res.Zone ?? ""] ?? "";
  const ip = res.IpGeneralInfo?.Ip ?? "";

  const categories = res.IpGeneralInfo?.CategoriesWithZone?.map(
    c => `${c.Zone} (${c.Name})`
  ).join('; ') ?? "";

  const net = res.IpWhoIs?.Net;
  const description = net?.Description ?? "";
  const created = net?.Created ?? "";
  const rangeStart = net?.RangeStart ?? "";
  const rangeEnd = net?.RangeEnd ?? "";
  const range = rangeStart && rangeEnd ? `${rangeStart} - ${rangeEnd}` : "";

  return `${ip}, ${emoji}, ${categories}, ${description}, ${created}, ${range}`;
}

export const OpenTIPLookup: Operation = {
  name: "OpenTIP Lookup",
  description: "Check IPs against Kaspersky OpenTIP",
  category: "malware",
  run: async (input) => {
    const ips = input.split("\n").filter(ip => ip.trim() !== "");
    const keys = SettingsManager.getKeys();

    if (!keys.opentip) {
      return {
        result: "",
        error: "No OpenTIP API key found",
      };
    }

    const results = await Promise.all(
      ips.map(async (ip) => {
        try {
          const response = await fetch(`https://opentip.kaspersky.com/api/v1/search/ip?request=${ip}`, {
            headers: { 'x-api-keys': `${keys.opentip}` },
          });

          if (!response.ok) {
            return `${ip}: ❌ (API Error)`;
          }

          const data = await response.json();
          if (data.status == "unknown") {
            return `${ip}: ❌ (No data)`;
          }
          formatSingleResponse(data)
          } catch (err) {
          return `${ip}: ❌ (Fetch Error)`;
        }
      })
    );

    return { result: results.join("\n") };
  },
};
