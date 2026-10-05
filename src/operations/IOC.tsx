import {
  defang,
  extractIocs,
  findFirstIPv4,
  IOC_TYPES,
  IocType,
  isPrivateIPv4,
  refang,
} from "@/lib/ioc";
import { Operation } from "@/lib/types";

export const DefangIOCs: Operation = {
  name: "Defang IOCs",
  description: "Make URLs, domains, IPs and emails non-clickable (hxxp, [.])",
  category: "ioc",
  run: (input) => ({ result: defang(input) }),
};

export const RefangIOCs: Operation = {
  name: "Refang IOCs",
  description: "Restore defanged IOCs (hxxp, [.], (dot), [@], [:])",
  category: "ioc",
  run: (input) => ({ result: refang(input) }),
};

const TYPE_CHOICES: Record<string, IocType[]> = {
  All: IOC_TYPES,
  URLs: ["url"],
  Domains: ["domain"],
  IPv4: ["ipv4"],
  IPv6: ["ipv6"],
  Emails: ["email"],
  MD5: ["md5"],
  SHA1: ["sha1"],
  SHA256: ["sha256"],
  CVEs: ["cve"],
};

export const ExtractIOCs: Operation = {
  name: "Extract IOCs",
  description:
    "Extract URLs, domains, IPs, hashes, emails and CVEs (defanged too)",
  category: "extract",
  options: [
    {
      name: "Type",
      type: "select",
      default: "All",
      select: Object.keys(TYPE_CHOICES),
    },
    {
      name: "Unique",
      type: "boolean",
      default: "true",
    },
    {
      name: "Show type",
      type: "boolean",
      default: "false",
    },
  ],
  run: (input, options) => {
    const types = TYPE_CHOICES[options?.["Type"] ?? "All"] ?? IOC_TYPES;
    const unique = options?.["Unique"] !== "false";
    const showType = options?.["Show type"] === "true";
    const text = refang(input);

    const lines: string[] = [];
    const counts: string[] = [];
    for (const type of types) {
      let found = extractIocs(text, type);
      if (unique) found = [...new Set(found)];
      if (found.length > 0) counts.push(`${found.length} ${type}`);
      lines.push(...found.map((ioc) => (showType ? `${type}\t${ioc}` : ioc)));
    }

    return {
      result: lines.join("\n"),
      info: counts.length > 0 ? counts.join(" · ") : "Nothing found",
    };
  },
};

export const FilterPrivateIPs: Operation = {
  name: "Filter Private IPs",
  description:
    "Remove (or keep only) lines whose IPv4 is private, loopback or reserved",
  category: "filter",
  options: [
    {
      name: "Mode",
      type: "select",
      default: "Remove private",
      select: ["Remove private", "Keep only private"],
    },
  ],
  run: (input, options) => {
    const keepPrivate = options?.["Mode"] === "Keep only private";
    const lines = input.split("\n");
    const kept = lines.filter((line) => {
      const ip = findFirstIPv4(line);
      const isPrivate = ip !== undefined && isPrivateIPv4(ip);
      return keepPrivate ? isPrivate : !isPrivate;
    });
    return {
      result: kept.join("\n"),
      info: `Removed ${lines.length - kept.length} of ${lines.length} lines`,
    };
  },
};
