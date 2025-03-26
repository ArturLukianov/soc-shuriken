// components/OperationItem.tsx
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  BugIcon,
  CodeIcon,
  Globe2Icon,
  GripVertical,
  HammerIcon,
  LockIcon,
  NetworkIcon,
  SearchIcon,
} from "lucide-react";
import { Operation } from "@/lib/types";

export const categoryIcons = {
  crypto: <LockIcon className="rounded-lg p-1 bg-orange-900 text-orange-300" />,
  search: (
    <SearchIcon className="rounded-lg p-1 bg-purple-900 text-purple-300" />
  ),
  malware: <BugIcon className="rounded-lg p-1 bg-red-900 text-red-300" />,
  web: <Globe2Icon className=" rounded-lg p-1 bg-blue-900 text-blue-300" />,
  utility: (
    <HammerIcon className="rounded-lg p-1 bg-yellow-900 text-yellow-300" />
  ),
  convert: <CodeIcon className="rounded-lg p-1 bg-green-900 text-green-300" />,
  network: <NetworkIcon className="rounded-lg p-1 bg-gray-900 text-gray-300" />,
};

export function OperationItem({ operation }: { operation: Operation }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: operation.name,
    data: { operation, type: "operation" },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
      className={cn(
        "flex items-center gap-3 bg-black p-3 rounded-lg",
        "border transition-colors",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 cursor-grab active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </Button>
      <div className="flex-1">
        <h3 className="text-sm font-medium">{operation.name}</h3>
        <p className="text-xs text-gray-400">{operation.description}</p>
      </div>
      {categoryIcons[operation.category]}
    </div>
  );
}
