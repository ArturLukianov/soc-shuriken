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
  state: Record<string, string>;
};
