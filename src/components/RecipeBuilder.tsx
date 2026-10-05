// components/RecipeBuilder.tsx
import { Button } from "./ui/button";
import { GripVertical, MessageSquareWarningIcon, X } from "lucide-react";
import { OperationOption, RecipeOperation } from "@/lib/types";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { categoryIcons } from "./OperationItem";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
}: {
  recipe: RecipeOperation[];
  onUpdate: (ops: RecipeOperation[]) => void;
  errors: Record<string, string>,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: RECIPE_AREA_ID,
  });

  return (
    <div
      className={cn(
        "space-y-2 min-h-[200px] h-[calc(100%-3rem)] border-2 border-dashed rounded-lg p-2 overflow-y-auto transition-colors",
        isOver && "border-primary",
      )}
      ref={setNodeRef}
    >
      <SortableContext
        items={recipe.map((op) => op.id)}
        strategy={verticalListSortingStrategy}
      >
        {recipe.map((op, index) => (
          <SortableStep
            key={op.id}
            operation={op}
            error={errors[op.id]}
            onRemove={() => onUpdate(recipe.filter((_, i) => i !== index))}
          />
        ))}
      </SortableContext>
    </div>
  );
}

function SortableStep({
  operation,
  onRemove,
  error,
}: {
  operation: RecipeOperation;
  onRemove: () => void;
  error?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: operation.id, data: { type: "step" } });

  function updateState(event: string, option: OperationOption) {
    if (operation.options === undefined) {
      return;
    }

    operation.state[option.name] = event;
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex flex-col items-center gap-2 p-2 rounded bg-black w-full",
        error === undefined ? "border" : "highlight-border",
        isDragging && "relative z-10 opacity-80",
      )}
    >
      <div className="flex items-center gap-2 w-full">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 cursor-grab active:cursor-grabbing"
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </Button>
        {categoryIcons[operation.category]}
        <span className="flex-1 text-sm">{operation.name}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {operation.options !== undefined && (
        <div className="flex-col items-center gap-2 space-y-2 w-full mt-3">
          {operation.options.map((option) => (
            <div className="">
              <Label className="flex flex-row gap-1 mb-2 items-center">
                {option.name}
              </Label>
              {option.type == "select" && (
                <Select
                  // defaultValue={option.default}
                  onValueChange={(event) => updateState(event, option)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {option.select?.map((select) => (
                      <SelectItem
                        value={select}
                      >
                        {select}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {option.type == "string" && (
                <Input
                  defaultValue={option.default}
                  onChange={(event) => updateState(event.target.value, option)}
                />
              )}
              {option.type == "number" && (
                <Input
                  defaultValue={option.default}
                  type="number"
                  onChange={(event) => updateState(event.target.value, option)}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {error !== undefined && (
        <div className="flex items-center gap-2 w-full">
          <MessageSquareWarningIcon className="h-6 w-6 text-red-300 bg-red-900 p-1 rounded-md" />
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
