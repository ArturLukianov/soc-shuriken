// lib/ioc.ts
// Shared IOC patterns and helpers for the extract / defang / filter blocks.

export type IocType =
  | "url"
  | "domain"
  | "ipv4"
  | "ipv6"
  | "md5"
  | "sha1"
  | "sha256"
  | "cve"
  | "email";

// Order used when extracting "All"
export const IOC_TYPES: IocType[] = [
  "url",
  "domain",
  "ipv4",
  "ipv6",
  "email",
  "md5",
  "sha1",
  "sha256",
  "cve",
];

const URL_RE = /\b(?:https?|ftp):\/\/[^\s"'<>()[\]{}`]+/gi;
const IPV4_RE = /(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?!\d|\.\d)/g;
// Loose candidate; validated with the URL parser
const IPV6_RE = /(?<![\w:])(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}(?![\w:])/gi;
const EMAIL_RE = /[\w.+-]+@(?:[\w-]+\.)+[a-z]{2,}/gi;
const DOMAIN_RE =
  /(?<![@\w.-])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}(?![\w-])/gi;
const MD5_RE = /\b[a-f0-9]{32}\b/gi;
const SHA1_RE = /\b[a-f0-9]{40}\b/gi;
const SHA256_RE = /\b[a-f0-9]{64}\b/gi;
const CVE_RE = /\bCVE-\d{4}-\d{4,}\b/gi;

// Endings that look like TLDs but are almost always file names in logs.
// (Some, like zip and mov, are real TLDs, but rarely what an analyst wants.)
const FILE_EXTENSIONS = new Set(
  (
    "exe dll sys bat cmd ps1 psm1 vbs vbe js jse wsf hta lnk msi scr cpl " +
    "txt log csv json xml yml yaml ini cfg conf bak tmp dat db sqlite " +
    "html htm php asp aspx jsp css png jpg jpeg gif svg ico bmp webp " +
    "doc docx docm xls xlsx xlsm ppt pptx pdf rtf odt zip rar gz tgz tar " +
    "7z iso img py sh pl rb jar class so ko evtx pcap"
  ).split(" "),
);

export function isValidIPv4(ip: string): boolean {
  return ip.split(".").every((part) => Number(part) <= 255);
}

function isValidIPv6(candidate: string): boolean {
  if (!candidate.includes("::") && candidate.split(":").length !== 8) {
    return false;
  }
  try {
    new URL(`http://[${candidate}]`);
    return true;
  } catch {
    return false;
  }
}

// Strip punctuation that usually ends a sentence rather than the URL
function trimUrl(url: string): string {
  return url.replace(/[.,;:!?'"]+$/, "");
}

export function extractIocs(text: string, type: IocType): string[] {
  const matches = (re: RegExp) => text.match(re) ?? [];
  switch (type) {
    case "url":
      return matches(URL_RE).map(trimUrl);
    case "ipv4":
      return matches(IPV4_RE).filter(isValidIPv4);
    case "ipv6":
      return matches(IPV6_RE)
        .filter(isValidIPv6)
        .map((ip) => ip.toLowerCase());
    case "email":
      return matches(EMAIL_RE).map((email) => email.toLowerCase());
    case "md5":
      return matches(MD5_RE).map((hash) => hash.toLowerCase());
    case "sha1":
      return matches(SHA1_RE).map((hash) => hash.toLowerCase());
    case "sha256":
      return matches(SHA256_RE).map((hash) => hash.toLowerCase());
    case "cve":
      return matches(CVE_RE).map((cve) => cve.toUpperCase());
    case "domain": {
      const fromUrls = extractIocs(text, "url").flatMap((url) => {
        try {
          return [new URL(url).hostname];
        } catch {
          return [];
        }
      });
      const fromEmails = extractIocs(text, "email").map(
        (email) => email.split("@")[1],
      );
      // Drop emails first so their local parts ("john.smith@") aren't
      // mistaken for domains
      const standalone =
        text.replace(EMAIL_RE, " ").match(DOMAIN_RE) ?? [];
      return [...fromUrls, ...fromEmails, ...standalone]
        .map((domain) => domain.toLowerCase())
        .filter(
          (domain) =>
            !/^[\d.]+$/.test(domain) &&
            !FILE_EXTENSIONS.has(domain.split(".").pop() ?? ""),
        );
    }
  }
}

// Best guess at an IOC's type, for single values (one per line)
export function detectIocType(value: string): IocType | undefined {
  const v = value.trim();
  if (/^(?:https?|ftp):\/\//i.test(v)) return "url";
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(v) && isValidIPv4(v)) return "ipv4";
  if (v.includes(":") && isValidIPv6(v)) return "ipv6";
  if (/^[a-f0-9]{32}$/i.test(v)) return "md5";
  if (/^[a-f0-9]{40}$/i.test(v)) return "sha1";
  if (/^[a-f0-9]{64}$/i.test(v)) return "sha256";
  if (/^CVE-\d{4}-\d{4,}$/i.test(v)) return "cve";
  if (/^[\w.+-]+@(?:[\w-]+\.)+[a-z]{2,}$/i.test(v)) return "email";
  if (/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/i.test(v)) {
    return "domain";
  }
  return undefined;
}

export function refang(text: string): string {
  return text
    .replace(/\bh(?:xx|XX|\*\*)p(s?)(?=\[?:)/g, "http$1")
    .replace(/\bf(?:xx|XX|x|X)p(?=\[?:)/g, "ftp")
    .replace(/\[:\/\/\]/g, "://")
    .replace(/\[:\]/g, ":")
    .replace(/\[(?:\.|dot)\]|\((?:\.|dot)\)|\{(?:\.|dot)\}/gi, ".")
    .replace(/\[(?:@|at)\]|\((?:@|at)\)|\{(?:@|at)\}/gi, "@");
}

const defangHost = (host: string) => host.replace(/\./g, "[.]");

export function defang(text: string): string {
  // One pass over all IOC kinds so URLs aren't re-processed as domains
  const combined = new RegExp(
    [URL_RE, EMAIL_RE, IPV4_RE, DOMAIN_RE].map((re) => re.source).join("|"),
    "gi",
  );
  return text.replace(combined, (match) => {
    if (/^(?:https?|ftp):\/\//i.test(match)) {
      const url = trimUrl(match);
      const rest = match.slice(url.length);
      return (
        url.replace(
          /^(\w+):\/\/([^/?#]+)/,
          (_, scheme: string, host: string) =>
            // http -> hxxp, https -> hxxps, ftp -> fxp
            `${scheme.replace(/t/gi, "x")}://${defangHost(host)}`,
        ) + rest
      );
    }
    if (match.includes("@")) {
      const [user, domain] = match.split("@");
      return `${user}[@]${defangHost(domain)}`;
    }
    if (/^[\d.]+$/.test(match)) {
      return isValidIPv4(match) ? defangHost(match) : match;
    }
    return FILE_EXTENSIONS.has(match.split(".").pop()?.toLowerCase() ?? "")
      ? match
      : defangHost(match);
  });
}

// IPv4 ranges that never belong to a real external host
const RESERVED_IPV4: [string, number][] = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // link-local
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24], // TEST-NET-1
  ["192.168.0.0", 16],
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // TEST-NET-2
  ["203.0.113.0", 24], // TEST-NET-3
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved + broadcast
];

const ipToInt = (ip: string) =>
  ip.split(".").reduce((acc, part) => acc * 256 + Number(part), 0);

export function isPrivateIPv4(ip: string): boolean {
  const n = ipToInt(ip);
  return RESERVED_IPV4.some(([base, bits]) => {
    const size = 2 ** (32 - bits);
    const start = ipToInt(base);
    return n >= start && n < start + size;
  });
}

export function findFirstIPv4(line: string): string | undefined {
  return extractIocs(line, "ipv4")[0];
}
