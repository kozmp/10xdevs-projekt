import React, { useCallback, useMemo } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Heading2,
  Quote,
  Minus,
  Code,
} from "lucide-react";
import "./RichTextEditor.css";

/**
 * Rich Text Editor Component
 *
 * Features:
 * - TipTap editor z podstawowymi formatowaniami
 * - Toolbar z przyciskami formatowania
 * - Character counter (0/50000)
 * - Placeholder text
 * - Accessibility (ARIA labels, keyboard shortcuts)
 * - Responsive design
 * - Validation feedback
 */

interface RichTextEditorProps {
  /** Początkowa treść HTML */
  initialContent?: string;
  /** Callback wywoływany przy zmianie treści */
  onChange?: (html: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Maksymalna liczba znaków */
  maxCharacters?: number;
  /** Tryb tylko do odczytu */
  readOnly?: boolean;
  /** Etykieta dla screen readers */
  label?: string;
  /** Czy edytor jest w stanie błędu */
  error?: boolean;
  /** Komunikat błędu */
  errorMessage?: string;
}

/**
 * Toolbar Button Component
 */
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, isActive, disabled, icon, label }) => {
  return (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="h-8 w-8 p-0"
    >
      {icon}
    </Button>
  );
};

/**
 * Character Counter Component
 */
interface CharacterCounterProps {
  current: number;
  max: number;
  error: boolean;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({ current, max, error }) => {
  const percentage = (current / max) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            error ? "bg-destructive" : percentage > 90 ? "bg-yellow-500" : "bg-primary"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      <span className={`text-sm ${error ? "text-destructive" : "text-muted-foreground"}`} aria-live="polite">
        {current.toLocaleString()} / {max.toLocaleString()}
      </span>
    </div>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent = "",
  onChange,
  placeholder = "Rozpocznij pisanie opisu produktu...",
  maxCharacters = 50000,
  readOnly = false,
  label = "Edytor opisu produktu",
  error = false,
  errorMessage,
}) => {
  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3], // Only H2 and H3 for product descriptions
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxCharacters,
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-sm leading-relaxed",
        "aria-label": label,
      },
    },
  });

  // Toolbar actions
  const toolbarActions = useMemo(
    () => [
      {
        icon: <Bold className="h-4 w-4" />,
        label: "Pogrubienie (Ctrl+B)",
        action: () => editor?.chain().focus().toggleBold().run(),
        isActive: () => editor?.isActive("bold") ?? false,
      },
      {
        icon: <Italic className="h-4 w-4" />,
        label: "Kursywa (Ctrl+I)",
        action: () => editor?.chain().focus().toggleItalic().run(),
        isActive: () => editor?.isActive("italic") ?? false,
      },
      {
        icon: <Code className="h-4 w-4" />,
        label: "Kod inline (Ctrl+E)",
        action: () => editor?.chain().focus().toggleCode().run(),
        isActive: () => editor?.isActive("code") ?? false,
      },
      {
        icon: <Heading2 className="h-4 w-4" />,
        label: "Nagłówek H2",
        action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: () => editor?.isActive("heading", { level: 2 }) ?? false,
      },
      {
        icon: <List className="h-4 w-4" />,
        label: "Lista punktowana",
        action: () => editor?.chain().focus().toggleBulletList().run(),
        isActive: () => editor?.isActive("bulletList") ?? false,
      },
      {
        icon: <ListOrdered className="h-4 w-4" />,
        label: "Lista numerowana",
        action: () => editor?.chain().focus().toggleOrderedList().run(),
        isActive: () => editor?.isActive("orderedList") ?? false,
      },
      {
        icon: <Quote className="h-4 w-4" />,
        label: "Cytat blokowy",
        action: () => editor?.chain().focus().toggleBlockquote().run(),
        isActive: () => editor?.isActive("blockquote") ?? false,
      },
      {
        icon: <Minus className="h-4 w-4" />,
        label: "Linia pozioma",
        action: () => editor?.chain().focus().setHorizontalRule().run(),
        isActive: () => false,
      },
    ],
    [editor]
  );

  const historyActions = useMemo(
    () => [
      {
        icon: <Undo className="h-4 w-4" />,
        label: "Cofnij (Ctrl+Z)",
        action: () => editor?.chain().focus().undo().run(),
        disabled: () => !editor?.can().undo(),
      },
      {
        icon: <Redo className="h-4 w-4" />,
        label: "Ponów (Ctrl+Y)",
        action: () => editor?.chain().focus().redo().run(),
        disabled: () => !editor?.can().redo(),
      },
    ],
    [editor]
  );

  // Get character count
  const characterCount = editor?.storage.characterCount.characters() ?? 0;
  const isOverLimit = characterCount > maxCharacters;

  if (!editor) {
    return null;
  }

  return (
    <Card className={`w-full ${error || isOverLimit ? "border-destructive" : ""}`} data-testid="rich-text-editor">
      <CardHeader className="pb-3">
        <Label htmlFor="rich-text-editor" className="text-base font-semibold">
          {label}
        </Label>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Toolbar */}
        <div
          className="flex flex-wrap items-center gap-1 p-2 border rounded-md bg-muted/50"
          role="toolbar"
          aria-label="Narzędzia formatowania tekstu"
        >
          {/* Formatting buttons */}
          <div className="flex items-center gap-0.5 border-r pr-1 mr-1">
            {toolbarActions.map((action, index) => (
              <ToolbarButton
                key={index}
                onClick={action.action}
                isActive={action.isActive()}
                disabled={readOnly}
                icon={action.icon}
                label={action.label}
              />
            ))}
          </div>

          {/* History buttons */}
          <div className="flex items-center gap-0.5">
            {historyActions.map((action, index) => (
              <ToolbarButton
                key={index}
                onClick={action.action}
                disabled={readOnly || action.disabled()}
                icon={action.icon}
                label={action.label}
              />
            ))}
          </div>
        </div>

        {/* Editor Content */}
        <div
          className={`border rounded-md bg-background ${
            error || isOverLimit ? "border-destructive" : "focus-within:ring-2 focus-within:ring-ring"
          } ${readOnly ? "bg-muted/30" : ""}`}
        >
          <EditorContent editor={editor} id="rich-text-editor" />
        </div>

        {/* Error Message */}
        {(error || isOverLimit) && (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage ||
              (isOverLimit
                ? `Przekroczono limit znaków (${characterCount - maxCharacters} za dużo)`
                : "Wystąpił błąd w edytorze")}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        {/* Character Counter */}
        <CharacterCounter current={characterCount} max={maxCharacters} error={isOverLimit} />
      </CardFooter>
    </Card>
  );
};

export default RichTextEditor;
