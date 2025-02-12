import Editor from "@monaco-editor/react";

export function CodeEditor({ value, onChange }: { 
  value: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Editor
      height="100%"
      theme="vs-dark"
      value={value}
    //   onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "off",
        glyphMargin: false,
        folding: false,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        renderLineHighlight: "none",
        guides: { indentation: false },
      }}
      beforeMount={(monaco) => {
        monaco.editor.defineTheme("soc-theme", {
          base: "vs-dark",
          inherit: true,
          rules: [],
          colors: {
            "editor.background": "#09090b",
            "editor.lineHighlightBackground": "#18181b",
          },
        });
      }}
      onMount={(editor) => {
        editor.updateOptions({ theme: "soc-theme" });
      }}
    />
  );
}