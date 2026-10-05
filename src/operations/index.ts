import { Operation } from "@/lib/types";
import { ExtractIPs } from "./ExtractIPs";
import { Base64Decode, Base64Encode } from "./Base64";
import {
  CountOccurrences,
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
import { DefangIOCs, ExtractIOCs, FilterPrivateIPs, RefangIOCs } from "./IOC";
import {
  Decompress,
  HexDecode,
  HexEncode,
  PowerShellDecode,
  URLDecode,
  URLEncode,
} from "./Decode";
import { BuildKATAQuery } from "./KATA";

export const operations: Operation[] = [
  AbuseIPDBCheckIPs,
  OpenTIPLookup,
  ExtractIOCs,
  ExtractIPs,
  ExtractEmails,
  DefangIOCs,
  RefangIOCs,
  FilterPrivateIPs,
  BuildKATAQuery,
  Base64Decode,
  Base64Encode,
  PowerShellDecode,
  Decompress,
  URLDecode,
  URLEncode,
  HexDecode,
  HexEncode,
  // SHA256Hash,
  // SHA512Hash,
  // MD5Hash,
  XORWithKey,
  CountOccurrences,
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
