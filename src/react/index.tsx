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
  type VNode,
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

function renderVNode(node: VNode, key: React.Key): React.ReactElement {
  return React.createElement(
    node.tag,
    { key, className: node.class || undefined, style: toStyle(node.style) },
    node.children?.map((child, i) => renderVNode(child, i)),
  );
}

/** Returns false until `delay` ms have elapsed; true immediately when no delay. */
function useDelayed(delay?: number): boolean {
  const [show, setShow] = React.useState(!delay || delay <= 0);
  React.useEffect(() => {
    if (!delay || delay <= 0) {
      setShow(true);
      return;
    }
    setShow(false);
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return show;
}

export interface LoaderProps
  extends LoaderOptions,
    Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Wait this many ms before showing, to avoid flashing on fast loads. */
  delay?: number;
}

/**
 * Animated loading indicator. Renders real DOM, is SSR-safe, and announces
 * itself to screen readers via `role="status"`.
 *
 * @example Basic spinner
 * ```tsx
 * import { Loader } from "shimmerkit/react";
 *
 * <Loader />
 * ```
 *
 * @example Themed variant
 * ```tsx
 * <Loader variant="ring" size={48} color="#6366f1" speed={1.4} />
 * ```
 *
 * @example Avoid flashing on fast loads
 * ```tsx
 * // Stays hidden for 150ms; if data arrives first, nothing ever flashes.
 * <Loader variant="dots" delay={150} />
 * ```
 */
export function Loader({
  variant,
  size,
  color,
  speed,
  thickness,
  label,
  delay,
  className,
  style,
  ...rest
}: LoaderProps): React.ReactElement | null {
  useStyles();
  const show = useDelayed(delay);
  if (!show) return null;
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
    React.HTMLAttributes<HTMLDivElement> {
  /** Wait this many ms before showing, to avoid flashing on fast loads. */
  delay?: number;
}

/**
 * Shimmering content placeholder. Swap it in while data loads, then render the
 * real content once ready.
 *
 * @example Text lines
 * ```tsx
 * import { Skeleton } from "shimmerkit/react";
 *
 * <Skeleton variant="text" lines={3} />
 * ```
 *
 * @example Conditional content
 * ```tsx
 * {loading ? <Skeleton variant="card" /> : <Article data={data} />}
 * ```
 *
 * @example List preset
 * ```tsx
 * <Skeleton variant="list" count={5} delay={150} />
 * ```
 */
export function Skeleton({
  variant,
  lines,
  count,
  columns,
  width,
  height,
  radius,
  speed,
  delay,
  className,
  style,
  ...rest
}: SkeletonProps): React.ReactElement | null {
  useStyles();
  const show = useDelayed(delay);
  if (!show) return null;
  const node = buildSkeletonNode({
    variant,
    lines,
    count,
    columns,
    width,
    height,
    radius,
    speed,
  });
  return (
    <div
      className={cx(node.class, className)}
      style={{ ...toStyle(node.style), ...style }}
      aria-hidden
      {...rest}
    >
      {node.children?.map((child, i) => renderVNode(child, i))}
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
