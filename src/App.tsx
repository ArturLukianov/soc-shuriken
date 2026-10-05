import { useState } from "react";
import {
  closestCenter,
  CollisionDetection,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  Modifier,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { ThemeProvider } from "./components/theme-provider";
import { Editor } from "@monaco-editor/react";
import { Operation, RecipeOperation } from "./lib/types";
import {
  RECIPE_AREA_ID,
  RecipeBuilder,
  StepCard,
} from "./components/RecipeBuilder";
import { OperationList } from "./components/OperationList";
import { CakeSliceIcon, CogIcon, KeyIcon } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import { ExtractIPs } from "./operations/ExtractIPs";
import { Base64Decode, Base64Encode } from "./operations/Base64";
import {
  CutField,
  DuplicateLines,
  ExtractRegex,
  Grep,
  GrepNot,
  GrepRegex,
  Sort,
  SquashSpaces,
  UniqueLines,
} from "./operations/Utility";
import { AbuseIPDBCheckIPs } from "./operations/AbuseIPDB";
import { OpenTIPLookup } from "./operations/OpenTip";
import { v4 as uuidv4 } from "uuid";
import { XORWithKey } from "./operations/XOR";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import {
  ExtractFieldFromHTTPLogs,
  MatchHTTPField,
  RemoveStaticHTTPContentFromLogs,
} from "./operations/HTTPLogs";
import { OperationCard } from "./components/OperationItem";
import { UserAgentParser } from "./operations/UserAgent";
import { ApiKeys, SettingsManager } from "./lib/settings";
import { JSONExtract } from "./operations/JSON";
import { LeakCheckEmails } from "./operations/LeakCheck";
import { ExtractEmails } from "./operations/ExtractEmails";
import { IPInfo } from "./operations/IPInfo";
import { ThreatbookCheckIP } from "./operations/ThreatBook";

const operations: Operation[] = [
  AbuseIPDBCheckIPs,
  OpenTIPLookup,
  ExtractIPs,
  ExtractEmails,
  Base64Decode,
  Base64Encode,
  // SHA256Hash,
  // SHA512Hash,
  // MD5Hash,
  XORWithKey,
  UniqueLines,
  CutField,
  SquashSpaces,
  Sort,
  Grep,
  GrepNot,
  GrepRegex,
  ExtractRegex,
  ExtractFieldFromHTTPLogs,
  MatchHTTPField,
  RemoveStaticHTTPContentFromLogs,
  UserAgentParser,
  JSONExtract,
  LeakCheckEmails,
  DuplicateLines,
  IPInfo,
  ThreatbookCheckIP,
];

type ActiveDrag =
  | { type: "operation"; operation: Operation }
  | { type: "step"; step: RecipeOperation };

// Reordering steps snaps to the nearest step; palette drags only count when
// the pointer is inside the recipe area (the insert position is computed
// separately from the pointer, see getInsertIndex).
const collisionDetection: CollisionDetection = (args) => {
  if (args.active.data.current?.type === "step") {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => container.data.current?.type === "step",
      ),
    });
  }
  return pointerWithin({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      (container) => container.id === RECIPE_AREA_ID,
    ),
  });
};

// Index of the first step whose vertical midpoint is below the pointer
function getInsertIndex({ active, activatorEvent, delta }: DragMoveEvent) {
  let y: number;
  if (activatorEvent instanceof PointerEvent) {
    y = activatorEvent.clientY + delta.y;
  } else {
    const rect = active.rect.current.translated;
    if (!rect) return null;
    y = rect.top + rect.height / 2;
  }
  const steps = document.querySelectorAll("[data-recipe-step]");
  let index = 0;
  for (const step of steps) {
    const rect = step.getBoundingClientRect();
    if (y > rect.top + rect.height / 2) index++;
  }
  return index;
}

// Only the recipe list may auto-scroll; otherwise dragging near the bottom of
// the screen scrolls the operations list out from under the cursor
const autoScroll = {
  canScroll: (element: Element) => element.hasAttribute("data-recipe-scroll"),
};

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

const stepDropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.3" } },
  }),
};

function SettingsDialog() {
  const [keys, setKeys] = useState<ApiKeys>(SettingsManager.getKeys());
  const [open, onOpenChange] = useState(false);

  const handleSave = () => {
    SettingsManager.saveKeys(keys);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="secondary" size="lg">
          <CogIcon /> Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Edit setttings</DialogTitle>
          <DialogDescription>
            Add API keys and other settings here
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div>
            <Label
              htmlFor="name"
              className="text-right text-sm flex flex-row gap-1 items-center"
            >
              <KeyIcon
                size={24}
                className="bg-blue-900 text-blue-300 p-1 rounded-lg"
              />
              AbuseIPDB API Key:
            </Label>
            <Input
              id="name"
              className="col-span-3 mt-3"
              value={keys.abuseIPDB || ""}
              onChange={(e) => setKeys({ ...keys, abuseIPDB: e.target.value })}
              placeholder="Enter AbuseIPDB API key"
            />
          </div>

          <div>
            <Label
              htmlFor="name"
              className="text-right text-sm flex flex-row gap-1 items-center"
            >
              <KeyIcon
                size={24}
                className="bg-blue-900 text-blue-300 p-1 rounded-lg"
              />
              OpenTIP API Key:
            </Label>
            <Input
              id="name"
              className="col-span-3 mt-3"
              value={keys.opentip || ""}
              onChange={(e) => setKeys({ ...keys, opentip: e.target.value })}
              placeholder="Enter VirusTotal API key"
            />
          </div>

          <div>
            <Label
              htmlFor="name"
              className="text-right text-sm flex flex-row gap-1 items-center"
            >
              <KeyIcon
                size={24}
                className="bg-blue-900 text-blue-300 p-1 rounded-lg"
              />
              VirusTotal API Key:
            </Label>
            <Input
              id="name"
              className="col-span-3 mt-3"
              value={keys.virusTotal || ""}
              onChange={(e) => setKeys({ ...keys, virusTotal: e.target.value })}
              placeholder="Enter VirusTotal API key"
            />
          </div>

          <div>
            <Label
              htmlFor="name"
              className="text-right text-sm flex flex-row gap-1 items-center"
            >
              <KeyIcon
                size={24}
                className="bg-blue-900 text-blue-300 p-1 rounded-lg"
              />
              MalwareBazaar abuse.ch API Key:
            </Label>
            <Input
              id="name"
              className="col-span-3 mt-3"
              value={keys.abusech || ""}
              onChange={(e) => setKeys({ ...keys, abusech: e.target.value })}
              placeholder="Enter abusech API key"
            />
          </div>

          <div>
            <Label
              htmlFor="name"
              className="text-right text-sm flex flex-row gap-1 items-center"
            >
              <KeyIcon
                size={24}
                className="bg-blue-900 text-blue-300 p-1 rounded-lg"
              />
              IPinfo.io key:
            </Label>
            <Input
              id="name"
              className="col-span-3 mt-3"
              value={keys.ipinfo || ""}
              onChange={(e) => setKeys({ ...keys, ipinfo: e.target.value })}
              placeholder="Enter ipinfo API key"
            />
          </div>

          <div>
            <Label
              htmlFor="name"
              className="text-right text-sm flex flex-row gap-1 items-center"
            >
              <KeyIcon
                size={24}
                className="bg-blue-900 text-blue-300 p-1 rounded-lg"
              />
              ThreatBook API key:
            </Label>
            <Input
              id="name"
              className="col-span-3 mt-3"
              value={keys.threatbook || ""}
              onChange={(e) => setKeys({ ...keys, threatbook: e.target.value })}
              placeholder="Enter ThreatBook API key"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function App() {
  const [recipe, setRecipe] = useState<RecipeOperation[]>([]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState("idle");
  const [search, setSearch] = useState("");

  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  // Kept after the drag ends so the overlay's drop animation can finish
  const [lastDragType, setLastDragType] = useState<ActiveDrag["type"]>();

  const sensors = useSensors(
    // Small distance so clicks on step buttons/inputs don't start a drag
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const resetDrag = () => {
    setActiveDrag(null);
    setInsertIndex(null);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current;
    setLastDragType(data?.type);
    if (data?.type === "operation") {
      setActiveDrag({ type: "operation", operation: data.operation });
    } else if (data?.type === "step") {
      setActiveDrag({ type: "step", step: data.operation });
    }
  };

  // While dragging from the palette, track where the operation would land
  const handleDragMove = (event: DragMoveEvent) => {
    if (event.active.data.current?.type !== "operation") return;
    const next =
      event.over?.id === RECIPE_AREA_ID ? getInsertIndex(event) : null;
    if (next !== insertIndex) setInsertIndex(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const index = insertIndex;
    resetDrag();
    if (!over) return;

    if (active.data.current?.type === "step") {
      if (active.id === over.id) return;
      const from = recipe.findIndex((op) => op.id === active.id);
      const to = recipe.findIndex((op) => op.id === over.id);
      if (from !== -1 && to !== -1) {
        setRecipe(arrayMove(recipe, from, to));
      }
      return;
    }

    const operation: Operation | undefined = active.data.current?.operation;
    if (!operation || over.id !== RECIPE_AREA_ID) return;

    const state: Record<string, string> = {};
    for (const option of operation.options ?? []) {
      state[option.name] = String(option.default);
    }

    const newOperation: RecipeOperation = {
      id: uuidv4(),
      state: state,
      ...operation,
    };
    const insertAt = index ?? recipe.length;
    setRecipe([
      ...recipe.slice(0, insertAt),
      newOperation,
      ...recipe.slice(insertAt),
    ]);
  };

  const runRecipe = async () => {
    let data = input;
    setState("wip");

    const errors: Record<string, string> = {};

    try {
      for (const operation of recipe) {
        if (operation.disabled) continue;
        try {
          const { result, error } = await operation.run(data, operation.state);
          if (error) {
            errors[operation.id] = error;
            break;
          }
          data = result;
        } catch (e) {
          errors[operation.id] = e instanceof Error ? e.message : String(e);
          break;
        }
      }
      setOutput(data);
    } finally {
      setErrors(errors);
      setState("idle");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      autoScroll={autoScroll}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={resetDrag}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
    >
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="min-h-screen p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-2rem)]">
            {/* Operations Panel */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex-row flex w-full">
                <SettingsDialog />
              </div>
              <Input
                placeholder="Search operations..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="h-[calc(100vh-9rem)] overflow-y-scroll overflow-x-hidden pe-2">
                <OperationList operations={operations} search={search} />
              </div>
            </div>

            <div className="mt-2">
              <div className="w-full mb-3 flex flex-row space-x-3">
                <Button className="w-full" size="lg" onClick={runRecipe}>
                  <CakeSliceIcon />
                  Run Recipe
                </Button>
              </div>
              <RecipeBuilder
                recipe={recipe}
                onUpdate={setRecipe}
                errors={errors}
                insertIndex={insertIndex}
              />
            </div>

            <ResizablePanelGroup
              direction="vertical"
              className="h-full col-span-2 space-y-2"
            >
              <ResizablePanel>
                {/* Input Panel */}

                <Editor
                  value={input}
                  onChange={(value) => value !== undefined && setInput(value)}
                  className="rounded-lg"
                  height="100%"
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                  }}
                />
              </ResizablePanel>

              <ResizableHandle />

              <ResizablePanel>
                {/* Output Panel */}
                {state == "idle" && (
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    value={output}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                  />
                )}
                {state == "wip" && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <CakeSliceIcon className="animate-bounce" size={50} />
                    <h1>Baking...</h1>
                  </div>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>

        <DragOverlay
          zIndex={999}
          // Palette cards land in the recipe, so don't animate them back
          dropAnimation={
            lastDragType === "operation" ? null : stepDropAnimation
          }
          modifiers={lastDragType === "step" ? [restrictToVerticalAxis] : []}
        >
          {activeDrag?.type === "step" && (
            <StepCard
              operation={activeDrag.step}
              error={errors[activeDrag.step.id]}
              className="cursor-grabbing shadow-2xl ring-1 ring-primary/40"
            />
          )}
          {activeDrag?.type === "operation" && (
            <OperationCard
              operation={activeDrag.operation}
              className="cursor-grabbing shadow-2xl"
            />
          )}
        </DragOverlay>
      </ThemeProvider>
    </DndContext>
  );
}

export default App;
