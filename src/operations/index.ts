import { Operation } from "@/lib/types";
import { ExtractIPs } from "./ExtractIPs";
import { Base64Decode, Base64Encode } from "./Base64";
import {
  CutField,
  DuplicateLines,
  ExtractRegex,
  Grep,
  GrepNot,
  GrepRegex,
  Sort,
  SquashSpaces,
  UniqueLines,
} from "./Utility";
import { AbuseIPDBCheckIPs } from "./AbuseIPDB";
import { OpenTIPLookup } from "./OpenTip";
import { XORWithKey } from "./XOR";
import {
  ExtractFieldFromHTTPLogs,
  MatchHTTPField,
  RemoveStaticHTTPContentFromLogs,
} from "./HTTPLogs";
import { UserAgentParser } from "./UserAgent";
import { JSONExtract } from "./JSON";
import { LeakCheckEmails } from "./LeakCheck";
import { ExtractEmails } from "./ExtractEmails";
import { IPInfo } from "./IPInfo";
import { ThreatbookCheckIP } from "./ThreatBook";

export const operations: Operation[] = [
  AbuseIPDBCheckIPs,
  OpenTIPLookup,
  ExtractIPs,
  ExtractEmails,
  Base64Decode,
  Base64Encode,
  // SHA256Hash,
  // SHA512Hash,
  // MD5Hash,
  XORWithKey,
  UniqueLines,
  CutField,
  SquashSpaces,
  Sort,
  Grep,
  GrepNot,
  GrepRegex,
  ExtractRegex,
  ExtractFieldFromHTTPLogs,
  MatchHTTPField,
  RemoveStaticHTTPContentFromLogs,
  UserAgentParser,
  JSONExtract,
  LeakCheckEmails,
  DuplicateLines,
  IPInfo,
  ThreatbookCheckIP,
];

const operationsByName = new Map(operations.map((op) => [op.name, op]));

export function findOperation(name: string): Operation | undefined {
  return operationsByName.get(name);
}
