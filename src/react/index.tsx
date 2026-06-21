/**
 * shimmerkit/react — thin React wrapper over the shared core engine.
 *
 * Renders real DOM (not custom elements) so it is SSR-friendly and hydrates
 * cleanly. The CSS is injected into <head> once on the client. For zero-FOUC
 * SSR, also import "shimmerkit/styles.css" in your app.
 */

import * as React from "react";
import {
  STYLES,
  buildLoaderNode,
  buildSkeletonNode,
  type LoaderOptions,
  type SkeletonOptions,
} from "../core/engine";

const STYLE_ID = "shimmerkit-styles";

function ensureStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = STYLES;
  document.head.appendChild(el);
}

const useInsertion =
  typeof window !== "undefined" &&
  typeof (React as { useInsertionEffect?: unknown }).useInsertionEffect ===
    "function"
    ? (React as unknown as {
        useInsertionEffect: (e: () => void, d: unknown[]) => void;
      }).useInsertionEffect
    : React.useEffect;

function useStyles(): void {
  useInsertion(() => {
    ensureStyles();
  }, []);
}

function toStyle(
  src: Record<string, string | number | undefined> | undefined,
): React.CSSProperties {
  const out: Record<string, string | number> = {};
  if (src) {
    for (const [k, v] of Object.entries(src)) {
      if (v != null && v !== "") out[k] = v;
    }
  }
  return out as React.CSSProperties;
}

function cx(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface LoaderProps
  extends LoaderOptions,
    Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {}

/** Animated loading indicator. */
export function Loader({
  variant,
  size,
  color,
  speed,
  thickness,
  label,
  className,
  style,
  ...rest
}: LoaderProps): React.ReactElement {
  useStyles();
  const node = buildLoaderNode({ variant, size, color, speed, thickness, label });
  return (
    <div
      className={cx(node.class, className)}
      style={{ ...toStyle(node.style), ...style }}
      role="status"
      aria-label={label ?? "Loading"}
      aria-live="polite"
      {...rest}
    >
      {node.children?.map((_, i) => (
        <div key={i} className="shk__part" />
      ))}
    </div>
  );
}

export interface SkeletonProps
  extends SkeletonOptions,
    React.HTMLAttributes<HTMLDivElement> {}

/** Shimmering content placeholder. */
export function Skeleton({
  variant,
  lines,
  width,
  height,
  radius,
  speed,
  className,
  style,
  ...rest
}: SkeletonProps): React.ReactElement {
  useStyles();
  const node = buildSkeletonNode({ variant, lines, width, height, radius, speed });
  return (
    <div
      className={cx(node.class, className)}
      style={{ ...toStyle(node.style), ...style }}
      aria-hidden
      {...rest}
    >
      {node.children?.map((child, i) => (
        <div key={i} className={child.class} style={toStyle(child.style)} />
      ))}
    </div>
  );
}

export { STYLES } from "../core/engine";
export type {
  LoaderVariant,
  SkeletonVariant,
  LoaderOptions,
  SkeletonOptions,
} from "../core/engine";
