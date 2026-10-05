// components/RecipeBuilder.tsx
import type { CSSProperties, HTMLAttributes, Ref } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  EyeIcon,
  EyeOffIcon,
  GripVertical,
  MessageSquareWarningIcon,
  MousePointerClickIcon,
  Trash2Icon,
  X,
} from "lucide-react";
import { OperationOption, RecipeOperation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { categoryIcons } from "./OperationItem";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const RECIPE_AREA_ID = "recipe-area";

export function RecipeBuilder({
  recipe,
  onUpdate,
  errors,
  insertIndex,
}: {
  recipe: RecipeOperation[];
  onUpdate: (ops: RecipeOperation[]) => void;
  errors: Record<string, string>;
  // Where a palette operation being dragged would land, or null
  insertIndex: number | null;
}) {
  const { setNodeRef } = useDroppable({ id: RECIPE_AREA_ID });

  const updateStep = (id: string, patch: Partial<RecipeOperation>) =>
    onUpdate(recipe.map((op) => (op.id === id ? { ...op, ...patch } : op)));

  return (
    <div className="flex h-[calc(100%-3rem)] min-h-[200px] flex-col rounded-lg border-2 border-dashed">
      <div className="flex items-center justify-between border-b border-dashed px-3 py-2 text-sm">
        <span className="font-medium">
          Recipe
          {recipe.length > 0 && (
            <span className="ms-2 text-xs text-gray-400">
              {recipe.length} step{recipe.length === 1 ? "" : "s"}
            </span>
          )}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-gray-400"
          disabled={recipe.length === 0}
          onClick={() => onUpdate([])}
        >
          <Trash2Icon /> Clear
        </Button>
      </div>

      <div
        ref={setNodeRef}
        data-recipe-scroll
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-y-auto p-2 transition-colors",
          insertIndex !== null && "bg-primary/5",
        )}
      >
        {recipe.length === 0 ? (
          <div
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-2 rounded-md text-sm text-gray-500 transition-colors",
              insertIndex !== null && "text-gray-300",
            )}
          >
            <MousePointerClickIcon className="h-6 w-6" />
            Drag operations here
          </div>
        ) : (
          <SortableContext
            items={recipe.map((op) => op.id)}
            strategy={verticalListSortingStrategy}
          >
            {recipe.map((op, index) => (
              <SortableStep
                key={op.id}
                operation={op}
                index={index}
                error={errors[op.id]}
                dropIndicator={
                  insertIndex === index
                    ? "before"
                    : insertIndex === recipe.length &&
                        index === recipe.length - 1
                      ? "after"
                      : undefined
                }
                onChange={(patch) => updateStep(op.id, patch)}
                onRemove={() =>
                  onUpdate(recipe.filter((step) => step.id !== op.id))
                }
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}

function SortableStep({
  operation,
  index,
  dropIndicator,
  ...props
}: StepCardProps & { index: number; dropIndicator?: "before" | "after" }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    activeIndex,
    overIndex,
  } = useSortable({ id: operation.id, data: { type: "step", operation } });

  // Number steps by where they'll end up while a reorder is in progress
  let shownIndex = index;
  if (activeIndex !== -1 && overIndex !== -1) {
    if (index === activeIndex) shownIndex = overIndex;
    else if (activeIndex < index && index <= overIndex) shownIndex = index - 1;
    else if (overIndex <= index && index < activeIndex) shownIndex = index + 1;
  }

  return (
    <div
      ref={setNodeRef}
      data-recipe-step
      className="relative"
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      {dropIndicator && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 h-0.5 rounded-full bg-primary",
            dropIndicator === "before" ? "-top-[5px]" : "-bottom-[5px]",
          )}
        />
      )}
      <StepCard
        operation={operation}
        index={shownIndex}
        // The DragOverlay shows the moving copy; leave a placeholder here
        className={cn(isDragging && "opacity-30")}
        handleRef={setActivatorNodeRef}
        handleProps={{ ...listeners, ...attributes }}
        {...props}
      />
    </div>
  );
}

type StepCardProps = {
  operation: RecipeOperation;
  index?: number;
  error?: string;
  onChange?: (patch: Partial<RecipeOperation>) => void;
  onRemove?: () => void;
};

export function StepCard({
  operation,
  index,
  error,
  onChange,
  onRemove,
  className,
  style,
  handleRef,
  handleProps,
}: StepCardProps & {
  className?: string;
  style?: CSSProperties;
  handleRef?: Ref<HTMLButtonElement>;
  handleProps?: HTMLAttributes<HTMLButtonElement>;
}) {
  const setOption = (option: OperationOption, value: string) =>
    onChange?.({ state: { ...operation.state, [option.name]: value } });

  return (
    <div
      style={style}
      className={cn(
        "flex w-full flex-col gap-3 rounded-md bg-black p-2",
        error === undefined ? "border" : "highlight-border",
        className,
      )}
    >
      <div className="flex w-full items-center gap-2">
        <Button
          ref={handleRef}
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 cursor-grab touch-none active:cursor-grabbing"
          aria-label={`Reorder ${operation.name}`}
          {...handleProps}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </Button>
        <span className="w-4 shrink-0 text-right text-xs tabular-nums text-gray-500">
          {index !== undefined && index + 1}
        </span>
        {categoryIcons[operation.category]}
        <span
          className={cn(
            "flex-1 truncate text-sm",
            operation.disabled && "text-gray-500 line-through",
          )}
        >
          {operation.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-gray-400"
          aria-label={operation.disabled ? "Enable step" : "Disable step"}
          title={operation.disabled ? "Enable step" : "Disable step"}
          onClick={() => onChange?.({ disabled: !operation.disabled })}
        >
          {operation.disabled ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-gray-400"
          aria-label="Remove step"
          title="Remove step"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {operation.options && operation.options.length > 0 && (
        <div
          className={cn(
            "flex w-full flex-col gap-3 px-1 pb-1",
            operation.disabled && "opacity-50",
          )}
        >
          {operation.options.map((option) => {
            const id = `${operation.id}-${option.name}`;
            const value = operation.state[option.name] ?? "";
            return (
              <div key={option.name} className="flex flex-col gap-1.5">
                <Label htmlFor={id} className="text-xs text-gray-400">
                  {option.name}
                </Label>
                {option.type === "select" && (
                  <Select
                    value={value}
                    onValueChange={(next) => setOption(option, next)}
                  >
                    <SelectTrigger id={id} className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {option.select?.map((choice) => (
                        <SelectItem key={choice} value={choice}>
                          {choice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {(option.type === "string" || option.type === "number") && (
                  <Input
                    id={id}
                    className="h-8"
                    type={option.type === "number" ? "number" : "text"}
                    value={value}
                    onChange={(event) => setOption(option, event.target.value)}
                  />
                )}
                {option.type === "boolean" && (
                  <Switch
                    id={id}
                    checked={value === "true"}
                    onCheckedChange={(checked) =>
                      setOption(option, String(checked))
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {error !== undefined && (
        <div className="flex w-full items-center gap-2">
          <MessageSquareWarningIcon className="h-6 w-6 shrink-0 rounded-md bg-red-900 p-1 text-red-300" />
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
}
