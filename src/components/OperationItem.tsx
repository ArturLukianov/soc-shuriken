// components/OperationItem.tsx
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { GripVertical } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { Operation } from "@/lib/types";
import type { HTMLAttributes, Ref } from "react";

export function OperationItem({ operation }: { operation: Operation }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${operation.name}`,
    data: { operation, type: "operation" },
  });

  // The DragOverlay renders the moving copy, so the original stays in place
  return (
    <OperationCard
      operation={operation}
      ref={setNodeRef}
      className={isDragging ? "opacity-50" : undefined}
      handleProps={{ ...listeners, ...attributes }}
    />
  );
}

export function OperationCard({
  operation,
  ref,
  className,
  handleProps,
}: {
  operation: Operation;
  ref?: Ref<HTMLDivElement>;
  className?: string;
  handleProps?: HTMLAttributes<HTMLButtonElement>;
}) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 bg-black p-3 rounded-lg",
        "border transition-colors",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 cursor-grab active:cursor-grabbing"
        {...handleProps}
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </Button>
      <div className="flex-1">
        <h3 className="text-sm font-medium">{operation.name}</h3>
        <p className="text-xs text-gray-400">{operation.description}</p>
      </div>
      <CategoryIcon category={operation.category} />
    </div>
  );
}
