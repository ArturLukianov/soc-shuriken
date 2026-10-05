import { useState } from "react";
import {
  closestCenter,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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
import { RECIPE_AREA_ID, RecipeBuilder } from "./components/RecipeBuilder";
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

// Palette drags only count when the pointer is actually inside the recipe;
// reordering steps snaps to the nearest step.
const collisionDetection: CollisionDetection = (args) => {
  if (args.active.data.current?.type === "step") {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => container.data.current?.type === "step",
      ),
    });
  }
  return pointerWithin(args);
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

  const [activeOperation, setActiveOperation] = useState<Operation | null>(
    null,
  );

  const sensors = useSensors(
    // Small distance so clicks on step buttons/inputs don't start a drag
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "operation") {
      setActiveOperation(event.active.data.current.operation);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOperation(null);
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
    if (!operation) return;

    // Dropped onto an existing step: insert before it; otherwise append
    const overIndex = recipe.findIndex((op) => op.id === over.id);
    if (over.id !== RECIPE_AREA_ID && overIndex === -1) return;

    const state: Record<string, string> = {};
    for (const option of operation.options ?? []) {
      state[option.name] = String(option.default);
    }

    const newOperation: RecipeOperation = {
      id: uuidv4(),
      state: state,
      ...operation,
    };
    const insertAt = overIndex === -1 ? recipe.length : overIndex;
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
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveOperation(null)}
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

        <DragOverlay zIndex={999}>
          {activeOperation && <OperationCard operation={activeOperation} />}
        </DragOverlay>
      </ThemeProvider>
    </DndContext>
  );
}

export default App;
