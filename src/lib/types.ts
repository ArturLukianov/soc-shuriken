// lib/operations.ts

export type OperationCategory =
  | "search"
  | "crypto"
  | "malware"
  | "web"
  | "network"
  | "utility"
  | "convert";

export type OperationOptionType = "string" | "number" | "boolean" | "select";

export type OperationOption = {
  name: string;
  type: OperationOptionType;
  default: string | number;
  select?: string[];
};

export type OperationResult = {
  result: string;
  error?: string;
  // Short status shown under the step, e.g. "3 cached · 2 fetched"
  info?: string;
};

export type Operation = {
  name: string;
  description: string;
  category: OperationCategory;
  options?: OperationOption[];
  run: (
    input: string,
    options?: Record<string, string>,
  ) => OperationResult | Promise<OperationResult>;
};

export type RecipeOperation = Operation & {
  id: string;
  error?: string;
  disabled?: boolean;
  state: Record<string, string>;
};
