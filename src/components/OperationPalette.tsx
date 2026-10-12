// components/OperationPalette.tsx
import { useState } from "react";
import { LayoutGridIcon, type LucideIcon } from "lucide-react";
import { CATEGORIES, CategoryInfo, OperationCategory } from "@/lib/categories";
import { Operation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./CategoryIcon";
import { OperationItem } from "./OperationItem";
import { Input } from "./ui/input";

type Selection = OperationCategory | "all";

function matches(operation: Operation, category: CategoryInfo, query: string) {
  if (!query) return true;
  return [operation.name, operation.description, category.label].some((text) =>
    text.toLocaleLowerCase().includes(query),
  );
}

export function OperationPalette({ operations }: { operations: Operation[] }) {
  const [selected, setSelected] = useState<Selection>("all");
  const [search, setSearch] = useState("");
  const query = search.trim().toLocaleLowerCase();

  const groups = CATEGORIES.map((category) => ({
    category,
    operations: operations.filter(
      (op) => op.category === category.id && matches(op, category, query),
    ),
  }));
  const visible = groups.filter(
    (group) =>
      (selected === "all" || group.category.id === selected) &&
      group.operations.length > 0,
  );
  const elsewhere =
    selected === "all"
      ? 0
      : groups
          .filter((group) => group.category.id !== selected)
          .reduce((sum, group) => sum + group.operations.length, 0);

  return (
    <div className="flex min-h-0 flex-1 gap-2">
      <nav
        aria-label="Operation groups"
        className="flex shrink-0 flex-col gap-1.5"
      >
        <RailButton
          label="All operations"
          active={selected === "all"}
          onClick={() => setSelected("all")}
          Icon={LayoutGridIcon}
          className="bg-zinc-800 text-zinc-300"
        />
        <div className="mx-auto my-0.5 h-px w-6 bg-border" />
        {CATEGORIES.map((category) => (
          <RailButton
            key={category.id}
            label={category.label}
            active={selected === category.id}
            // Clicking the active group again goes back to all
            onClick={() =>
              setSelected(selected === category.id ? "all" : category.id)
            }
            Icon={category.Icon}
            className={category.className}
          />
        ))}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Input
          placeholder={
            selected === "all"
              ? "Search operations..."
              : `Search ${CATEGORIES.find((c) => c.id === selected)?.label}...`
          }
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pe-2">
          {visible.map(({ category, operations }) => (
            <section key={category.id} className="mb-3">
              <h2
                className={cn(
                  "z-10 flex items-center gap-2 bg-background py-1.5 text-xs font-medium uppercase tracking-wide text-gray-400",
                  selected === "all" && "sticky top-0",
                )}
              >
                <CategoryIcon category={category.id} className="h-5 w-5" />
                {category.label}
                <span className="font-normal normal-case text-gray-600">
                  {operations.length}
                </span>
              </h2>
              <div className="space-y-2">
                {operations.map((operation) => (
                  <OperationItem key={operation.name} operation={operation} />
                ))}
              </div>
            </section>
          ))}

          {visible.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">
              No matching operations
              {elsewhere > 0 && (
                <button
                  className="mt-2 block w-full text-primary underline-offset-4 hover:underline"
                  onClick={() => setSelected("all")}
                >
                  Show {elsewhere} match{elsewhere === 1 ? "" : "es"} in other
                  groups
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RailButton({
  label,
  active,
  onClick,
  Icon,
  className,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  Icon: LucideIcon;
  className: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
        active
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "opacity-60 hover:opacity-100",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
