import * as React from "react";
import { cn, widgetStyle } from "@/lib/utils";
import type { BorderRadius, BorderStyle, HoverEffect, Sizing, WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, STROKE, resolveColor } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";
import { RoughShape } from "@/sketch/RoughShape";
import { useMeasuredSize } from "@/sketch/useRough";
import { cornerFor, HOVER_CLASS, outlineFor } from "./Box";

export interface ImageProps extends WidgetBaseProps {
  src?: string | null;
  alt?: string;
  caption?: string;
  link?: string;
  objectFit?: "Cover" | "Contain" | "Fill" | "None" | "ScaleDown";
  borderColor?: string;
  borderOpacity?: number;
  borderRadius?: BorderRadius;
  borderStyle?: BorderStyle;
  borderThickness?: Sizing;
  hoverVariant?: HoverEffect;
  overlay?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const OBJECT_FIT: Record<NonNullable<ImageProps["objectFit"]>, string> = {
  Cover: "object-cover",
  Contain: "object-contain",
  Fill: "object-fill",
  None: "object-none",
  ScaleDown: "object-scale-down",
};

/**
 * When there is no `src` this renders the classic wireframe placeholder: a box
 * with a cross through it. Mirrors `Ivy.Image`.
 *
 * @tags picture placeholder media
 * @example <Image alt="Hero image" width="20rem" height="12rem" />
 */
export const Image = ({
  id,
  src,
  alt = "",
  caption,
  link,
  objectFit = "Cover",
  width = "16rem",
  height = "10rem",
  aspectRatio,
  visible,
  borderColor,
  borderOpacity,
  borderRadius = "Rounded",
  borderStyle = "Solid",
  borderThickness = "1",
  hoverVariant = "None",
  overlay,
  className,
  style,
  onClick,
}: ImageProps) => {
  const frame = (
    <SketchFrame
      id={id}
      seed={id ?? src ?? "image"}
      corner={cornerFor(borderRadius)}
      outline={outlineFor(borderStyle)}
      stroke={resolveColor(borderColor, INK_FAINT)}
      strokeWidth={(Number(String(borderThickness).replace(/[^\d.]/g, "")) || 1) * 1.4}
      opacity={borderOpacity}
      onClick={onClick}
      className={cn("inline-block overflow-hidden", HOVER_CLASS[hoverVariant], className)}
      contentClassName="h-full w-full"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "h-full w-full [filter:url(#tendril-wobble)_grayscale(0.25)]",
            OBJECT_FIT[objectFit],
            overlay && "opacity-70",
          )}
        />
      ) : (
        <ImagePlaceholder label={alt || caption} />
      )}
    </SketchFrame>
  );

  const body = link ? (
    <a href={link} className="inline-block no-underline">
      {frame}
    </a>
  ) : (
    frame
  );

  if (!caption) return body;

  return (
    <figure className="m-0 inline-block">
      {body}
      <figcaption className="mt-1 text-center text-xs text-ink-muted italic">{caption}</figcaption>
    </figure>
  );
};

const ImagePlaceholder = ({ label }: { label?: string }) => {
  const { ref, width, height } = useMeasuredSize<HTMLDivElement>();
  return (
    <div ref={ref} className="relative flex h-full w-full items-center justify-center">
      {width > 4 && height > 4 && (
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
          <RoughShape
            shape={{ kind: "line", x1: 2, y1: 2, x2: width - 2, y2: height - 2 }}
            seed="img-x1"
            stroke={INK_FAINT}
            strokeWidth={STROKE.regular}
          />
          <RoughShape
            shape={{ kind: "line", x1: width - 2, y1: 2, x2: 2, y2: height - 2 }}
            seed="img-x2"
            stroke={INK_FAINT}
            strokeWidth={STROKE.regular}
          />
        </svg>
      )}
      {label && (
        <span className="relative bg-paper px-2 text-xs text-ink-muted italic">{label}</span>
      )}
    </div>
  );
};

export interface SvgProps extends WidgetBaseProps {
  content: string;
}

/** Inline SVG markup, wobbled to match the rest of the sheet. Mirrors `Ivy.Svg`. */
export const Svg = ({ id, content, width, height, aspectRatio, visible, className, style }: SvgProps) => (
  <div
    id={id}
    className={cn("inline-block [filter:url(#tendril-wobble)] [&>svg]:h-full [&>svg]:w-full", className)}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
    dangerouslySetInnerHTML={{ __html: content }}
  />
);

export interface IframeProps extends WidgetBaseProps {
  src: string;
  refreshToken?: number;
  title?: string;
  /** Posted into the frame whenever `outboundMessageToken` changes. */
  outboundMessageType?: string;
  outboundMessageToken?: string;
}

/** Mirrors `Ivy.Iframe`. */
export const Iframe = ({
  id,
  src,
  width = "100%",
  height = "24rem",
  aspectRatio,
  visible,
  refreshToken,
  title = "Embedded content",
  outboundMessageType,
  outboundMessageToken,
  className,
  style,
}: IframeProps) => {
  const frameRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (!outboundMessageType || outboundMessageToken === undefined) return;
    frameRef.current?.contentWindow?.postMessage(
      { type: outboundMessageType, token: outboundMessageToken },
      "*",
    );
  }, [outboundMessageType, outboundMessageToken]);

  return (
    <SketchFrame
      id={id}
      seed={id ?? src}
      className={cn("inline-block overflow-hidden", className)}
      contentClassName="h-full w-full"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <iframe
        ref={frameRef}
        key={refreshToken}
        src={src}
        title={title}
        className="h-full w-full border-0"
      />
    </SketchFrame>
  );
};

export interface EmbedProps extends WidgetBaseProps {
  url: string;
}

const PLATFORMS: Array<{ match: RegExp; name: string; icon: string }> = [
  { match: /youtube\.com|youtu\.be/i, name: "YouTube", icon: "Youtube" },
  { match: /twitter\.com|x\.com/i, name: "X", icon: "Twitter" },
  { match: /github\.com/i, name: "GitHub", icon: "Github" },
  { match: /linkedin\.com/i, name: "LinkedIn", icon: "Linkedin" },
  { match: /instagram\.com/i, name: "Instagram", icon: "Instagram" },
  { match: /reddit\.com/i, name: "Reddit", icon: "MessageSquare" },
  { match: /tiktok\.com/i, name: "TikTok", icon: "Music" },
  { match: /facebook\.com/i, name: "Facebook", icon: "Facebook" },
  { match: /pinterest\./i, name: "Pinterest", icon: "Image" },
];

/**
 * Wireframes stand in for third-party embeds rather than loading them — a card
 * naming the platform and the link. Mirrors `Ivy.Embed`.
 */
export const Embed = ({
  id,
  url,
  width = "24rem",
  height,
  aspectRatio,
  visible,
  className,
  style,
}: EmbedProps) => {
  const platform = PLATFORMS.find((entry) => entry.match.test(url));

  return (
    <SketchFrame
      id={id}
      seed={id ?? url}
      className={cn("inline-block", className)}
      contentClassName="flex items-center gap-3 p-3"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <Icon name={platform?.icon ?? "Link"} size={20} />
      <span className="block min-w-0 flex-1">
        <span className="block text-sm font-bold">{platform?.name ?? "Embedded content"}</span>
        <span className="block truncate text-xs text-ink-muted">{url}</span>
      </span>
      <Icon name="ExternalLink" size={14} color={INK_FAINT} />
    </SketchFrame>
  );
};

export interface AudioPlayerProps extends WidgetBaseProps {
  src?: string | null;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: "none" | "metadata" | "auto";
  controls?: boolean;
}

/** Mirrors `Ivy.AudioPlayer`. */
export const AudioPlayer = ({
  id,
  src,
  width = "20rem",
  height,
  aspectRatio,
  visible,
  autoplay,
  loop,
  muted,
  preload = "metadata",
  controls = true,
  className,
  style,
  ...rest
}: AudioPlayerProps) => (
  <SketchFrame
    id={id}
    seed={id ?? "audio"}
    corner="pill"
    className={cn("inline-block", className)}
    contentClassName="flex items-center gap-2 px-3 py-2"
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
    {...rest}
  >
    <Icon name="Volume2" size={16} />
    <audio
      src={src ?? undefined}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      preload={preload}
      controls={controls}
      className="h-8 w-full [filter:grayscale(1)_contrast(0.9)]"
    />
  </SketchFrame>
);

export interface VideoPlayerProps extends WidgetBaseProps {
  source?: string | null;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: "none" | "metadata" | "auto";
  controls?: boolean;
  poster?: string;
  volume?: number;
  startTime?: number;
  endTime?: number;
  playbackRate?: number;
  subtitles?: Array<{ source: string; label?: string }>;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

/** Mirrors `Ivy.VideoPlayer`. */
export const VideoPlayer = ({
  id,
  source,
  width = "28rem",
  height = "16rem",
  aspectRatio,
  visible,
  autoplay,
  loop,
  muted,
  preload = "metadata",
  controls = true,
  poster,
  volume,
  startTime,
  endTime,
  playbackRate,
  subtitles,
  className,
  style,
  onEnded,
  onPlay,
  onPause,
}: VideoPlayerProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (volume !== undefined) video.volume = Math.min(1, Math.max(0, volume));
    if (playbackRate !== undefined) video.playbackRate = playbackRate;
    if (startTime !== undefined) video.currentTime = startTime;
  }, [volume, playbackRate, startTime, source]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && endTime !== undefined && video.currentTime >= endTime) video.pause();
  };

  return (
    <SketchFrame
      id={id}
      seed={id ?? "video"}
      className={cn("inline-block overflow-hidden bg-paper-sunken", className)}
      contentClassName="h-full w-full"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {source ? (
        <video
          ref={videoRef}
          src={source}
          poster={poster}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          preload={preload}
          controls={controls}
          onTimeUpdate={handleTimeUpdate}
          onEnded={onEnded}
          onPlay={onPlay}
          onPause={onPause}
          className="h-full w-full object-contain [filter:grayscale(0.4)]"
        >
          {subtitles?.map((track) => (
            <track key={track.source} src={track.source} label={track.label} kind="subtitles" />
          ))}
        </video>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Icon name="Play" size={40} color={INK_FAINT} />
        </div>
      )}
    </SketchFrame>
  );
};
