import * as React from "react";
import { byDensity, cn, densityText, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, PAPER_RAISED, SURFACE } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";
import { ContentInput } from "./inputs/SpecialInputs";

export interface ChatMessageProps extends WidgetBaseProps {
  sender?: "User" | "Assistant";
  children?: React.ReactNode;
}

/** One speech bubble. Mirrors `Ivy.ChatMessage`. */
export const ChatMessage = ({
  id,
  sender = "Assistant",
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  children,
  className,
  style,
}: ChatMessageProps) => {
  const fromUser = sender === "User";

  return (
    <div
      id={id}
      className={cn("flex w-full", fromUser ? "justify-end" : "justify-start", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <SketchFrame
        seed={`${id}-${sender}`}
        corner="rounded"
        stroke={INK_FAINT}
        fill={fromUser ? "#eef2f7" : PAPER_RAISED}
        fillStyle="solid"
        className={cn("max-w-[80%]", fromUser ? "rotate-[0.25deg]" : "-rotate-[0.25deg]")}
        contentClassName={cn(
          "block leading-relaxed",
          byDensity(density, ["px-2.5 py-1.5", "px-3.5 py-2.5", "px-4 py-3"]),
          densityText(density),
        )}
      >
        {children}
      </SketchFrame>
    </div>
  );
};

/** The three-dot "thinking" bubble. Mirrors `Ivy.ChatLoading`. */
export const ChatLoading = ({
  id,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: WidgetBaseProps) => (
  <div
    id={id}
    className={cn("flex justify-start", className)}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  >
    <SketchFrame
      seed="chat-loading"
      corner="rounded"
      stroke={INK_FAINT}
      fill={PAPER_RAISED}
      fillStyle="solid"
      contentClassName="flex items-center gap-1.5 px-4 py-3"
    >
      <span className="sr-only">Assistant is typing</span>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full bg-ink-muted animate-[tendril-pulse_1.2s_ease-in-out_infinite]"
          style={{ animationDelay: `${index * 0.18}s` }}
        />
      ))}
    </SketchFrame>
  </div>
);

export interface ChatStatusProps extends WidgetBaseProps {
  text?: string;
}

/** A centred status line between messages. Mirrors `Ivy.ChatStatus`. */
export const ChatStatus = ({
  id,
  text,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: ChatStatusProps) => (
  <div
    id={id}
    className={cn("flex items-center justify-center gap-2 py-1 text-xs text-ink-muted italic", className)}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  >
    <Icon name="Sparkles" size={12} />
    {text}
  </div>
);

export interface ChatProps extends WidgetBaseProps {
  children?: React.ReactNode;
  placeholder?: string;
  /** Disables the composer while a response streams in. */
  streaming?: boolean;
  onSend?: (message: string) => void;
}

/** A transcript with a composer at the bottom. Mirrors `Ivy.Chat`. */
export const Chat = ({
  id,
  children,
  placeholder = "Ask something…",
  streaming,
  width = "32rem",
  height = "26rem",
  aspectRatio,
  visible,
  density = "Medium",
  className,
  style,
  onSend,
}: ChatProps) => {
  const [draft, setDraft] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [children]);

  const send = (message: string) => {
    if (!message.trim() || streaming) return;
    onSend?.(message);
    setDraft("");
  };

  return (
    <SketchFrame
      id={id}
      seed={id ?? "chat"}
      stroke={INK_FAINT}
      fill={SURFACE.quiet}
      fillStyle="solid"
      className={cn("inline-block", className)}
      contentClassName="flex h-full flex-col overflow-hidden"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-auto p-3">
        {children}
        {streaming && <ChatLoading />}
      </div>
      <div className="border-t border-dashed border-ink-faint p-2">
        <ContentInput
          id={`${id}-composer`}
          value={draft}
          rows={2}
          width="100%"
          density={density}
          placeholder={placeholder}
          disabled={streaming}
          shortcutKey="⌘↵"
          onChange={(value) => setDraft(value ?? "")}
          onSubmit={send}
        />
      </div>
    </SketchFrame>
  );
};
