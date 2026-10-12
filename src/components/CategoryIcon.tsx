// components/CategoryIcon.tsx
import { CATEGORY_BY_ID, OperationCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function CategoryIcon({
  category,
  className,
}: {
  category: OperationCategory;
  className?: string;
}) {
  const { Icon, className: colors, label } = CATEGORY_BY_ID[category];
  return (
    <Icon
      aria-label={label}
      className={cn("shrink-0 rounded-lg p-1", colors, className)}
    />
  );
}
