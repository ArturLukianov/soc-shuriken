import { detectIocType, IocType, refang } from "@/lib/ioc";
import { Operation } from "@/lib/types";

// Kaspersky Anti Targeted Attack Platform threat hunting, source code mode:
//   <field> <operator> "<value>", combined with AND / OR and parentheses.
// Field names as listed in the KATA 6.1 "Event search criteria" docs (the
// docs spell the URL field "URl").

const FIELDS = [
  "RemoteIP",
  "LocalIP",
  "HostIP",
  "RemoteHostName",
  "URl",
  "MD5",
  "SHA256",
  "FileName",
  "FileFullName",
  "StartupParameters",
  "UserName",
  "Host",
];

const OPERATORS = [
  "=",
  "!=",
  "CONTAINS",
  "!CONTAINS",
  "STARTS",
  "!STARTS",
  "ENDS",
  "!ENDS",
];

// Field used for each IOC type in Auto mode. URLs and domains are matched
// with CONTAINS since the URl field holds full request addresses.
const AUTO_FIELDS: Partial<
  Record<IocType, { field: string; contains?: boolean }>
> = {
  ipv4: { field: "RemoteIP" },
  ipv6: { field: "RemoteIP" },
  md5: { field: "MD5" },
  sha256: { field: "SHA256" },
  domain: { field: "URl", contains: true },
  url: { field: "URl", contains: true },
};

// The docs don't specify escaping; backslash-escape quotes and backslashes
const quote = (value: string) =>
  `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

export const BuildKATAQuery: Operation = {
  name: "Build KATA Query",
  description:
    "Build a Kaspersky Anti Targeted Attack threat hunting query from a list",
  category: "search",
  options: [
    {
      name: "Field",
      type: "select",
      default: "Auto",
      select: ["Auto", ...FIELDS, "Custom"],
    },
    {
      name: "Custom field",
      type: "string",
      default: "",
    },
    {
      name: "Operator",
      type: "select",
      default: "=",
      select: OPERATORS,
    },
  ],
  run: (input, options) => {
    const fieldOption = options?.["Field"] ?? "Auto";
    const operator = options?.["Operator"] ?? "=";
    const negated = operator.startsWith("!");

    let fixedField: string | undefined;
    if (fieldOption === "Custom") {
      fixedField = options?.["Custom field"]?.trim();
      if (!fixedField) {
        return { result: "", error: 'Enter a field name in "Custom field"' };
      }
      if (!/^[A-Za-z][\w.]*$/.test(fixedField)) {
        return { result: "", error: `Invalid field name: ${fixedField}` };
      }
    } else if (fieldOption !== "Auto") {
      fixedField = fieldOption;
    }

    const values = [
      ...new Set(
        input
          .split("\n")
          .map((line) => refang(line.trim()))
          .filter(Boolean),
      ),
    ];

    const conditions: string[] = [];
    const skipped: string[] = [];
    for (const value of values) {
      if (fixedField) {
        conditions.push(`${fixedField} ${operator} ${quote(value)}`);
        continue;
      }

      const type = detectIocType(value);
      const auto = type && AUTO_FIELDS[type];
      if (!auto) {
        skipped.push(value);
        continue;
      }
      let autoOperator = operator;
      let autoValue = value;
      if (auto.contains) {
        autoOperator = negated ? "!CONTAINS" : "CONTAINS";
        autoValue = value.replace(/^(?:https?|ftp):\/\//i, "");
      }
      conditions.push(`${auto.field} ${autoOperator} ${quote(autoValue)}`);
    }

    if (conditions.length === 0) {
      return {
        result: "",
        error:
          values.length === 0
            ? "No values to build a query from"
            : "No values with a matching KATA field (use a fixed or custom field)",
      };
    }

    // "!= a OR != b" matches everything; exclusions must all hold
    const joiner = negated ? "AND" : "OR";
    const query =
      conditions.length === 1
        ? conditions[0]
        : `(\n${conditions.join(`\n${joiner} `)}\n)`;

    const info =
      skipped.length > 0
        ? `${conditions.length} conditions · skipped ${skipped.length} with no matching field: ${skipped.slice(0, 3).join(", ")}${skipped.length > 3 ? ", …" : ""}`
        : `${conditions.length} condition${conditions.length === 1 ? "" : "s"}`;

    return { result: query, info };
  },
};
