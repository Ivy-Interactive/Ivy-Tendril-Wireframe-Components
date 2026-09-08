import * as React from "react";
import { cn, densityIconSize, sizeStyle } from "@/lib/utils";
import { Icon } from "@/sketch/Icon";
import { BaseInputProps, InputShell, nativeInputClass } from "./InputShell";

export type TextInputVariant =
  | "Text"
  | "Textarea"
  | "Email"
  | "Tel"
  | "Url"
  | "Password"
  | "Search";

export interface TextInputProps extends BaseInputProps {
  value?: string;
  variant?: TextInputVariant;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  rows?: number;
  /** Hint shown on the right, e.g. `"⌘K"`. */
  shortcutKey?: string;
  /** Adds a microphone button that toggles `onDictationToggle`. */
  dictation?: boolean;
  dictationUploadUrl?: string;
  /** Text pushed back from the transcription service. */
  dictationTranscription?: string;
  /** Bump to apply a new `dictationTranscription` to the field. */
  dictationTranscriptionVersion?: number;
  onDictationToggle?: (recording: boolean) => void;
  onChange?: (value: string | null) => void;
  onBlur?: () => void;
  onSubmit?: (value: string | null) => void;
}

const NATIVE_TYPE: Record<TextInputVariant, string> = {
  Text: "text",
  Textarea: "text",
  Email: "email",
  Tel: "tel",
  Url: "url",
  Password: "password",
  Search: "search",
};

/**
 * Single-line and multi-line text entry. Mirrors `Ivy.TextInput`.
 *
 * @tags text field entry search password
 * @example <TextInput value={name} onChange={setName} placeholder="Your name" />
 * @example <TextInput variant="Textarea" rows={4} value={notes} onChange={setNotes} />
 */
export const TextInput = ({
  id,
  value = "",
  variant = "Text",
  placeholder,
  disabled,
  invalid,
  nullable,
  density = "Medium",
  ghost,
  width = "16rem",
  height,
  maxLength,
  minLength,
  pattern,
  rows = 4,
  shortcutKey,
  dictation,
  dictationTranscription,
  dictationTranscriptionVersion,
  onDictationToggle,
  aspectRatio,
  visible,
  autoFocus,
  prefix,
  suffix,
  className,
  style,
  onChange,
  onBlur,
  onSubmit,
  ...rest
}: TextInputProps) => {
  const [focused, setFocused] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const iconSize = densityIconSize(density);

  // A new transcription version means the service has produced fresh text.
  React.useEffect(() => {
    if (dictationTranscription !== undefined) onChange?.(dictationTranscription);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictationTranscriptionVersion]);

  const emit = (next: string) => onChange?.(nullable && next === "" ? null : next);

  const shared = {
    id,
    value,
    placeholder,
    disabled,
    maxLength,
    minLength,
    autoFocus,
    "aria-invalid": Boolean(invalid) || undefined,
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false);
      onBlur?.();
    },
  };

  const leading =
    prefix ?? (variant === "Search" ? <Icon name="Search" size={iconSize} /> : undefined);

  const trailing = (
    <>
      {variant === "Password" && (
        <button
          type="button"
          aria-label={revealed ? "Hide password" : "Show password"}
          onClick={() => setRevealed((state) => !state)}
          className="cursor-pointer text-ink-faint hover:text-ink"
        >
          <Icon name={revealed ? "EyeOff" : "Eye"} size={iconSize} />
        </button>
      )}
      {dictation && (
        <button
          type="button"
          aria-label={recording ? "Stop dictation" : "Start dictation"}
          aria-pressed={recording}
          disabled={disabled}
          onClick={() => {
            const next = !recording;
            setRecording(next);
            onDictationToggle?.(next);
          }}
          className={cn("cursor-pointer", recording ? "text-destructive" : "text-ink-faint hover:text-ink")}
        >
          <Icon name={recording ? "Square" : "Mic"} size={iconSize} />
        </button>
      )}
      {shortcutKey && <span className="font-sketch-mono text-[10px] text-ink-faint">{shortcutKey}</span>}
      {suffix}
    </>
  );

  return (
    <InputShell
      id={id ? `${id}-shell` : undefined}
      disabled={disabled}
      invalid={invalid}
      density={density}
      ghost={ghost}
      width={width}
      aspectRatio={aspectRatio}
      visible={visible}
      focused={focused}
      prefix={leading}
      suffix={trailing}
      showClear={Boolean(nullable && value)}
      onClear={() => onChange?.(null)}
      className={className}
      contentClassName={variant === "Textarea" ? "items-start" : undefined}
      style={style}
      {...rest}
    >
      {variant === "Textarea" ? (
        <textarea
          {...shared}
          rows={rows}
          className={cn(nativeInputClass, "resize-y leading-relaxed")}
          style={sizeStyle(undefined, height)}
          onChange={(event) => emit(event.target.value)}
        />
      ) : (
        <input
          {...shared}
          type={variant === "Password" && revealed ? "text" : NATIVE_TYPE[variant]}
          pattern={pattern}
          className={nativeInputClass}
          onChange={(event) => emit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSubmit?.(value);
          }}
        />
      )}
    </InputShell>
  );
};

export interface ReadOnlyInputProps extends BaseInputProps {
  value?: string | number | boolean | null;
  showCopyButton?: boolean;
}

/** Displays a value that cannot be edited. Mirrors `Ivy.ReadOnlyInput`. */
export const ReadOnlyInput = ({
  id,
  value,
  showCopyButton,
  density = "Medium",
  width = "16rem",
  aspectRatio,
  visible,
  className,
  style,
  ...rest
}: ReadOnlyInputProps) => {
  const [copied, setCopied] = React.useState(false);
  const text = value === null || value === undefined ? "" : String(value);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <InputShell
      id={id}
      density={density}
      width={width}
      aspectRatio={aspectRatio}
      visible={visible}
      className={className}
      style={style}
      suffix={
        showCopyButton ? (
          <button
            type="button"
            aria-label="Copy value"
            onClick={copy}
            className="cursor-pointer text-ink-faint hover:text-ink"
          >
            <Icon name={copied ? "Check" : "Copy"} size={densityIconSize(density)} />
          </button>
        ) : undefined
      }
      {...rest}
    >
      <span className={cn("block truncate", !text && "text-ink-faint italic")}>{text || "—"}</span>
    </InputShell>
  );
};
