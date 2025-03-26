import { useState } from "react";
import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { ThemeProvider } from "./components/theme-provider";
import { Editor } from "@monaco-editor/react";
import { Operation, RecipeOperation } from "./lib/types";
import { RecipeBuilder } from "./components/RecipeBuilder";
import { OperationList } from "./components/OperationList";
import {
  CakeIcon,
  CakeSlice,
  CakeSliceIcon,
  CogIcon,
  KeyIcon,
  RefreshCwIcon,
} from "lucide-react";
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
import { randomUUID } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { XORWithKey } from "./operations/XOR";
import { Toggle } from "./components/ui/toggle";
import { Switch } from "./components/ui/switch";
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
import { ScrollArea } from "./components/ui/scroll-area";
import { OperationItem } from "./components/OperationItem";
import { UserAgentParser } from "./operations/UserAgent";
import { ApiKeys, SettingsManager } from "./lib/settings";
import { JSONExtract } from "./operations/JSON";
import { LeakCheckEmails } from "./operations/LeakCheck";
import { ExtractEmails } from "./operations/ExtractEmails";
import { IPInfo } from "./operations/IPInfo";

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
];

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

  const handleDragStart = (event: any) => {
    setActiveOperation(event.active.data.current.operation);
  };

  const handleDragEnd = (event: any) => {
    const { active, over, delta } = event;
    console.log(delta.x);

    // Only add if dropped into the recipe area
    if (
      over?.id === "recipe-area" &&
      active.data.current?.operation &&
      delta.x > 350
    ) {
      let state: Record<string, string> = {};
      if (active.data.current?.operation.options) {
        for (const option of active.data.current?.operation.options) {
          state[option.name] = option.default;
        }
      }

      const newOperation: RecipeOperation = {
        id: uuidv4(),
        state: state,
        ...active.data.current.operation,
      };
      setRecipe([...recipe, newOperation]);
    }
  };

  const runRecipe = async () => {
    let data = input;
    setState("wip");

    let errors: Record<string, string> = {};

    for (const operation of recipe) {
      const { result, error } = await operation.run(data, operation.state);
      if (error) {
        errors[operation.id] = error;
        setErrors(errors);
        break;
      }
      data = result;
    }
    setErrors(errors);

    setOutput(data);
    setState("idle");
  };

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
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
          {activeOperation && <OperationItem operation={activeOperation} />}
        </DragOverlay>
      </ThemeProvider>
    </DndContext>
  );
}

export default App;
