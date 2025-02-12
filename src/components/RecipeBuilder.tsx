// components/RecipeBuilder.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";
import {
  GripVertical,
  ItalicIcon,
  MessageSquareWarningIcon,
  PlugIcon,
  StopCircleIcon,
  X,
} from "lucide-react";
import { Operation, OperationOption, RecipeOperation } from "@/lib/types";
import { useDroppable } from "@dnd-kit/core";
import { categoryIcons } from "./OperationItem";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function RecipeBuilder({
  recipe,
  onUpdate,
  errors,
}: {
  recipe: RecipeOperation[];
  onUpdate: (ops: RecipeOperation[]) => void;
  errors: Record<string, string>,
}) {
  const { setNodeRef } = useDroppable({
    id: "recipe-area",
  });

  return (
    <div
      className="space-y-2 min-h-[200px] h-[calc(100%-3rem)] border-2 border-dashed rounded-lg p-2"
      ref={setNodeRef}
    >
      {recipe.map((op, index) => (
        <SortableStep
          key={op.id}
          operation={op}
          error={errors[op.id]}
          onRemove={() => onUpdate(recipe.filter((_, i) => i !== index))}
        />
      ))}
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
  function updateState(event: string, option: OperationOption) {
    if (operation.options === undefined) {
      return;
    }

    operation.state[option.name] = event;
  }

  return (
    <div
      className={
        "flex flex-col items-center gap-2 p-2 rounded bg-black w-full " +
        (error === undefined ? "border" : "highlight-border")
      }
    >
      <div className="flex items-center gap-2 w-full">
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
