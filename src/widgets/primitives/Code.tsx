import * as React from "react";
import { cn, densityText, sizeStyle, textAlignClass } from "@/lib/utils";
import type { Densities, Sizing, TextAlignment, WidgetBaseProps } from "@/lib/types";
import { INK_FAINT } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";

const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy to clipboard"
      className="absolute top-2 right-2 z-[2] rounded-none p-1 text-ink-muted hover:text-ink"
    >
      <Icon name={copied ? "Check" : "Copy"} size={14} />
    </button>
  );
};

export interface CodeBlockProps extends WidgetBaseProps {
  content: string;
  language?: string;
  showCopyButton?: boolean;
  showLineNumbers?: boolean;
  startingLineNumber?: number;
  showBorder?: boolean;
  wrapLines?: boolean;
  width?: Sizing;
  height?: Sizing;
  density?: Densities;
}

/** Monospaced source listing on ruled paper. Mirrors `Ivy.CodeBlock`. */
export const CodeBlock = ({
  id,
  content,
  language,
  showCopyButton = true,
  showLineNumbers,
  startingLineNumber = 1,
  showBorder = true,
  wrapLines,
  width,
  height,
  density = "Medium",
  className,
  style,
}: CodeBlockProps) => {
  const lines = content.replace(/\n$/, "").split("\n");

  return (
    <SketchFrame
      id={id}
      seed={id ?? "code"}
      outline={showBorder ? "solid" : "none"}
      stroke={INK_FAINT}
      fill="#f7f6f1"
      fillStyle="solid"
      className={cn("relative inline-block max-w-full", className)}
      contentClassName="overflow-auto p-3"
      style={{ ...sizeStyle(width, height), ...style }}
    >
      {showCopyButton && <CopyButton value={content} />}
      {language && (
        <span className="mb-2 block text-[10px] tracking-widest text-ink-faint uppercase">
          {language}
        </span>
      )}
      <pre
        className={cn(
          "m-0 font-sketch-mono leading-relaxed",
          densityText(density),
          wrapLines ? "whitespace-pre-wrap" : "whitespace-pre",
        )}
      >
        {lines.map((line, index) => (
          <div key={index} className="flex gap-3">
            {showLineNumbers && (
              <span className="w-8 shrink-0 text-right text-ink-faint select-none">
                {startingLineNumber + index}
              </span>
            )}
            <span className="min-w-0 flex-1">{line || " "}</span>
          </div>
        ))}
      </pre>
    </SketchFrame>
  );
};

export interface JsonProps extends WidgetBaseProps {
  content: string;
  expanded?: number | null;
  width?: Sizing;
  height?: Sizing;
}

/** Pretty-printed JSON. Mirrors `Ivy.Json`. */
export const Json = ({ id, content, width, height, className, style }: JsonProps) => {
  const formatted = React.useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      return content;
    }
  }, [content]);

  return (
    <CodeBlock
      id={id}
      content={formatted}
      language="json"
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
};

export interface XmlProps extends WidgetBaseProps {
  content: string;
  expanded?: number | null;
  width?: Sizing;
  height?: Sizing;
}

/** Indented XML. Mirrors `Ivy.Xml`. */
export const Xml = ({ id, content, width, height, className, style }: XmlProps) => {
  const formatted = React.useMemo(() => {
    const tokens = content.replace(/>\s*</g, "><").replace(/></g, ">\n<").split("\n");
    let depth = 0;
    return tokens
      .map((token) => {
        if (/^<\/.+/.test(token)) depth = Math.max(0, depth - 1);
        const line = `${"  ".repeat(depth)}${token}`;
        if (/^<[^!?/][^>]*[^/]>$/.test(token)) depth += 1;
        return line;
      })
      .join("\n");
  }, [content]);

  return (
    <CodeBlock
      id={id}
      content={formatted}
      language="xml"
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
};

export interface HtmlProps extends WidgetBaseProps {
  content: string;
  density?: Densities;
  width?: Sizing;
  height?: Sizing;
}

/** Renders raw HTML inside the wireframe. Mirrors `Ivy.Html`. */
export const Html = ({ id, content, density, width, height, className, style }: HtmlProps) => (
  <div
    id={id}
    className={cn("tendril-prose", densityText(density), className)}
    style={{ ...sizeStyle(width, height), ...style }}
    dangerouslySetInnerHTML={{ __html: content }}
  />
);

export interface TerminalLine {
  content: string;
  isCommand?: boolean;
  prompt?: string;
}

export interface TerminalProps extends WidgetBaseProps {
  lines?: TerminalLine[];
  title?: string;
  showHeader?: boolean;
  showCopyButton?: boolean;
  width?: Sizing;
  height?: Sizing;
}

/** A console transcript. Mirrors `Ivy.Terminal`. */
export const Terminal = ({
  id,
  lines = [],
  title = "Terminal",
  showHeader = true,
  showCopyButton = true,
  width,
  height,
  className,
  style,
}: TerminalProps) => {
  const plain = lines.map((line) => `${line.isCommand ? (line.prompt ?? "$") + " " : ""}${line.content}`).join("\n");

  return (
    <SketchFrame
      id={id}
      seed={id ?? "terminal"}
      fill="#f2f0e9"
      fillStyle="solid"
      className={cn("relative inline-block max-w-full", className)}
      contentClassName="overflow-hidden"
      style={{ ...sizeStyle(width, height), ...style }}
    >
      {showHeader && (
        <span className="flex items-center gap-2 border-b border-dashed border-ink-faint px-3 py-1.5">
          <Icon name="SquareTerminal" size={14} />
          <span className="text-xs font-bold">{title}</span>
        </span>
      )}
      {showCopyButton && <CopyButton value={plain} />}
      <pre className="m-0 overflow-auto p-3 font-sketch-mono text-xs leading-relaxed whitespace-pre-wrap">
        {lines.map((line, index) => (
          <div key={index} className={cn(line.isCommand ? "text-ink" : "text-ink-muted")}>
            {line.isCommand && <span className="mr-1 text-success">{line.prompt ?? "$"}</span>}
            {line.content}
          </div>
        ))}
      </pre>
    </SketchFrame>
  );
};

export interface MarkdownProps extends WidgetBaseProps {
  content: string;
  density?: Densities;
  textAlignment?: TextAlignment;
  width?: Sizing;
  height?: Sizing;
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Handles the inline subset a wireframe actually needs: code, bold, italics, links.
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${index++}`;
    if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="bg-paper-sunken px-1 font-sketch-mono text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      nodes.push(
        <a key={key} href={link?.[2]} className="text-accent sketch-underline">
          {link?.[1]}
        </a>,
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/**
 * A deliberately small Markdown renderer — headings, lists, quotes, fences and
 * inline emphasis, which is all a wireframe needs. Mirrors `Ivy.Markdown`.
 */
export const Markdown = ({
  id,
  content,
  density,
  textAlignment,
  width,
  height,
  className,
  style,
}: MarkdownProps) => {
  const blocks = React.useMemo(() => content.split(/\n{2,}/), [content]);

  return (
    <div
      id={id}
      className={cn("flex flex-col gap-3", densityText(density), textAlignClass(textAlignment), className)}
      style={{ ...sizeStyle(width, height), ...style }}
    >
      {blocks.map((block, index) => {
        const key = `md-${index}`;
        const fence = /^```(\w*)\n([\s\S]*?)```$/.exec(block.trim());
        if (fence) return <CodeBlock key={key} content={fence[2]} language={fence[1] || undefined} />;

        const heading = /^(#{1,6})\s+(.*)$/.exec(block.trim());
        if (heading) {
          const Tag = `h${heading[1].length}` as React.ElementType;
          const sizes = ["text-3xl", "text-2xl", "text-xl", "text-lg", "text-base", "text-sm"];
          return (
            <Tag key={key} className={cn("font-bold", sizes[heading[1].length - 1])}>
              {renderInline(heading[2], key)}
            </Tag>
          );
        }

        if (/^>\s/.test(block.trim())) {
          return (
            <blockquote
              key={key}
              className="border-l-2 border-dashed border-ink-faint pl-4 text-ink-muted italic"
            >
              {renderInline(block.replace(/^>\s?/gm, ""), key)}
            </blockquote>
          );
        }

        const lines = block.split("\n");
        if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
          return (
            <ul key={key} className="list-none pl-1">
              {lines.map((line, itemIndex) => (
                <li key={itemIndex} className="flex gap-2">
                  <span className="text-ink-faint">&#8226;</span>
                  <span>{renderInline(line.replace(/^\s*[-*]\s+/, ""), `${key}-${itemIndex}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (lines.every((line) => /^\d+\.\s+/.test(line.trim()))) {
          return (
            <ol key={key} className="list-decimal pl-6">
              {lines.map((line, itemIndex) => (
                <li key={itemIndex}>
                  {renderInline(line.replace(/^\s*\d+\.\s+/, ""), `${key}-${itemIndex}`)}
                </li>
              ))}
            </ol>
          );
        }

        if (/^([-*_]\s*){3,}$/.test(block.trim())) {
          return <hr key={key} className="border-t border-dashed border-ink-faint" />;
        }

        return (
          <p key={key} className="leading-relaxed">
            {renderInline(block, key)}
          </p>
        );
      })}
    </div>
  );
};
