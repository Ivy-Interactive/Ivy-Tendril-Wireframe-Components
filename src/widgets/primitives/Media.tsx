import * as React from "react";
import { cn, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { INK_FAINT } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";

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
