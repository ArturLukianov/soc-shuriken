// lib/recipe.ts
import { v4 as uuidv4 } from "uuid";
import { findOperation } from "@/operations";
import { Operation, RecipeOperation } from "./types";

export function createStep(
  operation: Operation,
  savedState: Record<string, string> = {},
  disabled = false,
): RecipeOperation {
  // Start from defaults so options added after a recipe was saved still work
  const state: Record<string, string> = {};
  for (const option of operation.options ?? []) {
    state[option.name] = savedState[option.name] ?? String(option.default);
  }
  return { ...operation, id: uuidv4(), state, disabled };
}

// Recipe and input live in the URL hash (never sent to the server), each
// deflate-compressed and base64url-encoded: #recipe=...&input=...

type SavedStep = {
  op: string;
  args?: Record<string, string>;
  disabled?: boolean;
};

// Keep URLs within what browsers handle comfortably; larger input stays
// out of the URL
export const MAX_URL_INPUT_LENGTH = 500_000;

export type UrlState = {
  recipe: RecipeOperation[];
  input: string;
  warnings: string[];
};

export async function readUrlState(): Promise<UrlState> {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const state: UrlState = { recipe: [], input: "", warnings: [] };

  const recipeParam = params.get("recipe");
  if (recipeParam) {
    try {
      const saved: SavedStep[] = JSON.parse(await decode(recipeParam));
      for (const step of saved) {
        const operation = findOperation(step.op);
        if (operation) {
          state.recipe.push(createStep(operation, step.args, step.disabled));
        } else {
          state.warnings.push(`Unknown operation "${step.op}" was skipped.`);
        }
      }
    } catch {
      state.warnings.push("Could not read the recipe from the URL.");
    }
  }

  const inputParam = params.get("input");
  if (inputParam) {
    try {
      state.input = await decode(inputParam);
    } catch {
      state.warnings.push("Could not read the input from the URL.");
    }
  }

  return state;
}

let latestWrite = 0;

// Returns whether the input had to be left out for being too large
export async function writeUrlState(
  recipe: RecipeOperation[],
  input: string,
): Promise<{ inputOmitted: boolean }> {
  const write = ++latestWrite;

  const saved: SavedStep[] = recipe.map((step) => ({
    op: step.name,
    ...(Object.keys(step.state).length > 0 && { args: step.state }),
    ...(step.disabled && { disabled: true }),
  }));

  const params: string[] = [];
  if (saved.length > 0) {
    params.push(`recipe=${await encode(JSON.stringify(saved))}`);
  }
  let inputOmitted = false;
  if (input) {
    const encoded = await encode(input);
    if (encoded.length <= MAX_URL_INPUT_LENGTH) {
      params.push(`input=${encoded}`);
    } else {
      inputOmitted = true;
    }
  }

  // A newer write started while this one was compressing
  if (write !== latestWrite) return { inputOmitted };

  const { pathname, search } = window.location;
  const hash = params.length > 0 ? `#${params.join("&")}` : "";
  if (hash !== window.location.hash) {
    // replaceState: don't add a history entry per keystroke, and it doesn't
    // fire hashchange
    window.history.replaceState(null, "", pathname + search + hash);
  }
  return { inputOmitted };
}

async function encode(text: string): Promise<string> {
  const stream = new Blob([text])
    .stream()
    .pipeThrough(new CompressionStream("deflate-raw"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());

  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function decode(encoded: string): Promise<string> {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));

  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(stream).text();
}
