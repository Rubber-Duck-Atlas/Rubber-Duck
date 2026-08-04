import React, { useEffect, useRef, useState } from "react";
import "../stylesheets/editor.css";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";

const STORAGE_KEY = "editor-doc";
const FILENAME_KEY = "editor-filename";
const ISNOTE_KEY = "editor-isnote";

export default function Editor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [saving, setSaving] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentFile, setCurrentFile] = useState<string | null>(
    () => localStorage.getItem(FILENAME_KEY)
  );
  const isNote = localStorage.getItem(ISNOTE_KEY) !== "false";
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? ""
  );
  const [ReactMarkdown, setReactMarkdown] = useState<any>(null);
  const [remarkGfm, setRemarkGfm] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const defaultText = `Start writing your notes here...\n`

  useEffect(() => {
    Promise.all([import("react-markdown"), import("remark-gfm")]).then(([rm, gfm]) => {
      setReactMarkdown(() => rm.default);
      setRemarkGfm(() => gfm.default);
    });
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    const doc = saved ?? defaultText;
    setPreviewContent(doc)

    const view = new EditorView({
      parent: editorRef.current,
      doc,
      extensions: [
        basicSetup,
        markdown(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const text = update.state.doc.toString();
            localStorage.setItem(STORAGE_KEY, text);
            setPreviewContent(text);
          }
        }),
      ],
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  const [confirmClear, setConfirmClear] = useState(false);

  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); return; }
    viewRef.current?.dispatch({
      changes: { from: 0, to: viewRef.current.state.doc.length, insert: defaultText },
    });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FILENAME_KEY);
    localStorage.removeItem(ISNOTE_KEY);
    setCurrentFile(null);
    setConfirmClear(false);
  }

  function openSaveAs() {
    setInputValue(currentFile ?? "");
    setShowInput(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function saveWithName(name: string) {
    const safeName = name.endsWith(".md") || name.endsWith(".txt") ? name : `${name}.txt`;
    const content = viewRef.current?.state.doc.toString() ?? "";
    setSaving(true);
    try {
      await window.api.saveFile(safeName, content, isNote);
      localStorage.setItem(FILENAME_KEY, safeName);
      setCurrentFile(safeName);
      setShowInput(false);
      setInputValue("");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (currentFile) await saveWithName(currentFile);
  }

  async function confirmSaveAs() {
    const name = inputValue.trim();
    if (!name) return;
    await saveWithName(name);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") confirmSaveAs();
    if (e.key === "Escape") { setShowInput(false); setInputValue(""); }
  }

  return (
    <main className="flex flex-col h-screen">
      <div className="relative flex items-center justify-between gap-2 px-4 py-2 border-b border-peri/10 shrink-0">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={handleClear}
            onBlur={() => setConfirmClear(false)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${confirmClear
              ? "bg-red-500/80 text-white hover:bg-red-500"
              : "bg-peri/10 text-peri/50 hover:text-peri hover:bg-peri/20"
              }`}
          >
            {confirmClear ? "Clear unsaved changes?" : "New"}
          </button>
        </div>
        <span className="text-sm font-medium text-peri/60 truncate absolute left-1/2 -translate-x-1/2 pointer-events-none">
          {currentFile ?? "Unsaved note"}
        </span>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${showPreview
              ? "bg-lilac/30 text-peri hover:bg-lilac/40"
              : "bg-peri/10 text-peri/50 hover:text-peri hover:bg-peri/20"
              }`}
          >
            Markdown Preview
          </button>
          {showInput && (
            <>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="filename.txt"
                className="px-3 py-1.5 rounded-md bg-peri/10 text-peri text-sm border border-peri/20 focus:outline-none focus:border-lilac placeholder:text-peri/30 w-48"
              />
              <button
                onClick={() => { setShowInput(false); setInputValue(""); }}
                className="px-3 py-1.5 rounded-md text-peri/50 text-sm hover:text-peri transition-colors"
              >
                Cancel
              </button>
            </>
          )}
          <button
            onClick={showInput ? confirmSaveAs : openSaveAs}
            disabled={saving || (showInput && !inputValue.trim())}
            className="px-4 py-1.5 rounded-md bg-peri/10 text-peri text-sm font-medium hover:bg-peri/20 disabled:opacity-50 transition-colors"
          >
            {saving && showInput ? "Saving…" : "Save as"}
          </button>
          {currentFile && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-md bg-lilac text-peri text-sm font-medium hover:bg-lilac/80 disabled:opacity-50 transition-colors"
            >
              {saving && !showInput ? "Saving…" : `Save`}
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        <div ref={editorRef} className={`cm-editor-host min-h-0 overflow-hidden ${showPreview ? "w-1/2" : "w-full"}`} />
        {showPreview && (
          <div className="w-1/2 border-l border-peri/10 overflow-auto">
            <h1 className="text-center w-full p-2">Markdown preview</h1>
            <div className="prose prose-invert prose-sm max-w-none p-6">
              {ReactMarkdown ? (
                <ReactMarkdown remarkPlugins={remarkGfm ? [remarkGfm] : []}>
                  {previewContent}
                </ReactMarkdown>
              ) : (
                <pre className="text-xs whitespace-pre-wrap text-peri">{previewContent}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
