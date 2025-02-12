// components/OperationList.tsx
import { Operation } from "@/lib/types";
import { OperationItem } from "./OperationItem";

export function OperationList({
  operations,
  search,
}: {
  operations: Operation[];
  search: string;
}) {
  if (search) {
    return (
      <div className="space-y-2">
        {operations
          .filter(
            (operation) =>
              operation.description
                .toLocaleLowerCase()
                .includes(search.toLocaleLowerCase()) ||
              operation.name
                .toLocaleLowerCase()
                .includes(search.toLocaleLowerCase())
          )
          .map((operation) => (
            <OperationItem key={operation.name} operation={operation} />
          ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {operations.map((operation) => (
        <OperationItem key={operation.name} operation={operation} />
      ))}
    </div>
  );
}
