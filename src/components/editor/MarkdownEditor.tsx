import { useEffect, useRef, useCallback } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, placeholder } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  indentOnInput,
} from "@codemirror/language";
import { searchKeymap } from "@codemirror/search";
import { oneDark } from "@codemirror/theme-one-dark";

const baseTheme = EditorView.theme({
  "&": {
    fontSize: "13.5px",
    height: "100%",
    backgroundColor: "transparent",
    color: "var(--text-primary)",
  },
  ".cm-content": {
    fontFamily: "var(--font-mono)",
    lineHeight: "1.75",
    padding: "0",
    caretColor: "var(--accent)",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-gutters": { display: "none" },
  ".cm-activeLine": { backgroundColor: "transparent" },
  ".cm-selectionBackground": {
    backgroundColor: "var(--accent-soft) !important",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "var(--accent-soft) !important",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--accent)",
    borderLeftWidth: "1.5px",
  },
  ".cm-scroller": { overflow: "auto" },
  ".cm-line": { padding: "0" },
});

interface MarkdownEditorProps {
  content: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isDark?: boolean;
}

export default function MarkdownEditor({
  content,
  onChange,
  disabled = false,
  isDark = false,
}: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const createExtensions = useCallback(
    (isDarkTheme: boolean) => [
      baseTheme,
      isDarkTheme
        ? oneDark
        : syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      history(),
      bracketMatching(),
      indentOnInput(),
      placeholder("Start writing..."),
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
      EditorView.lineWrapping,
      EditorState.readOnly.of(disabled),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
    ],
    [disabled]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const doc = viewRef.current
      ? viewRef.current.state.doc.toString()
      : content;

    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const state = EditorState.create({
      doc,
      extensions: createExtensions(isDark),
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [disabled, isDark]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentContent = view.state.doc.toString();
    if (currentContent !== content) {
      view.dispatch({
        changes: { from: 0, to: currentContent.length, insert: content },
      });
    }
  }, [content]);

  return <div ref={containerRef} style={{ height: "100%", overflow: "hidden" }} />;
}
