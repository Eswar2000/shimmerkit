/**
 * shimmerkit core engine — framework-agnostic.
 *
 * This module is pure: no DOM / browser globals are touched at evaluation time,
 * so it is safe to import in Node (SSR, build scripts, tests). Both the Web
 * Component layer and the React layer render from the same vnode + CSS defined
 * here, which keeps every consumer pixel-identical.
 */

export type LoaderVariant =
  | "spinner"
  | "dots"
  | "bars"
  | "pulse"
  | "ring"
  | "ripple"
  | "wave"
  | "grid"
  | "orbit"
  | "bounce"
  | "conic"
  | "comet"
  | "blob"
  | "wobble"
  | "bouncer"
  | "liquid"
  | "muncher"
  | "wifi"
  | "helix";

export const LOADER_VARIANTS: readonly LoaderVariant[] = [
  "spinner",
  "dots",
  "bars",
  "pulse",
  "ring",
  "ripple",
  "wave",
  "grid",
  "orbit",
  "bounce",
  "conic",
  "comet",
  "blob",
  "wobble",
  "bouncer",
  "liquid",
  "muncher",
  "wifi",
  "helix",
];

/** How many `.shk__part` children each variant needs. */
const LOADER_PARTS: Record<LoaderVariant, number> = {
  spinner: 1,
  dots: 3,
  bars: 5,
  pulse: 1,
  ring: 4,
  ripple: 2,
  wave: 5,
  grid: 9,
  orbit: 2,
  bounce: 3,
  conic: 1,
  comet: 1,
  blob: 1,
  wobble: 1,
  bouncer: 2,
  liquid: 2,
  muncher: 3,
  wifi: 3,
  helix: 5,
};

export type SkeletonVariant =
  | "text"
  | "circle"
  | "rect"
  | "card"
  | "avatar"
  | "list"
  | "table"
  | "button"
  | "image"
  | "grid";

export interface LoaderOptions {
  /** Visual style. @default "spinner" */
  variant?: LoaderVariant;
  /** Box size. Number → px, string → any CSS length. @default 40 */
  size?: number | string;
  /** Any CSS color. @default currentColor */
  color?: string;
  /** Animation speed multiplier (2 = twice as fast). @default 1 */
  speed?: number;
  /** Stroke thickness for ring/spinner/ripple variants. @default 10% of size */
  thickness?: number | string;
  /** Accessible label announced to screen readers. @default "Loading" */
  label?: string;
}

export interface SkeletonOptions {
  /** Placeholder shape. @default "text" */
  variant?: SkeletonVariant;
  /** Number of lines ("text") or rows ("table"). @default 3 */
  lines?: number;
  /** Repeat count for the "list" and "grid" presets. @default 4 (list) / 6 (grid) */
  count?: number;
  /** Column count for the "table" preset. @default 3 */
  columns?: number;
  /** Width (number → px). */
  width?: number | string;
  /** Height (number → px). */
  height?: number | string;
  /** Corner radius (number → px). */
  radius?: number | string;
  /** Shimmer speed multiplier. @default 1 */
  speed?: number;
}

/** Minimal framework-neutral element description shared by all renderers. */
export interface VNode {
  tag: string;
  class?: string;
  style?: Record<string, string | number | undefined>;
  attrs?: Record<string, string>;
  children?: VNode[];
}

function cssLen(v: number | string): string {
  if (typeof v === "number") return `${v}px`;
  const t = v.trim();
  return /^-?\d+(\.\d+)?$/.test(t) ? `${t}px` : t;
}

/** Build the vnode tree for a loader. */
export function buildLoaderNode(opts: LoaderOptions = {}): VNode {
  const variant =
    opts.variant && LOADER_VARIANTS.includes(opts.variant)
      ? opts.variant
      : "spinner";

  const style: Record<string, string | undefined> = {};
  if (opts.size != null) style["--shk-size"] = cssLen(opts.size);
  if (opts.color != null) style["--shk-color"] = String(opts.color);
  if (opts.speed != null) style["--shk-speed"] = String(opts.speed);
  if (opts.thickness != null) style["--shk-thickness"] = cssLen(opts.thickness);

  const children: VNode[] = [];
  for (let i = 0; i < LOADER_PARTS[variant]; i++) {
    children.push({ tag: "div", class: "shk__part" });
  }

  return {
    tag: "div",
    class: `shk shk--${variant}`,
    style,
    attrs: {
      role: "status",
      "aria-label": opts.label ?? "Loading",
      "aria-live": "polite",
    },
    children,
  };
}

/** Build the vnode tree for a skeleton placeholder. */
export function buildSkeletonNode(opts: SkeletonOptions = {}): VNode {
  const variant: SkeletonVariant = opts.variant ?? "text";

  const style: Record<string, string | undefined> = {};
  if (opts.speed != null) style["--shk-speed"] = String(opts.speed);
  if (opts.radius != null) style["--shk-radius"] = cssLen(opts.radius);

  const root: VNode = {
    tag: "div",
    class: "shk-sk-root",
    style,
    attrs: { "aria-hidden": "true" },
    children: [],
  };

  const line = (width?: string, extra?: Record<string, string>): VNode => ({
    tag: "div",
    class: "shk-sk shk-sk--line",
    style: { width, ...extra },
  });

  const circle = (size: number | string): VNode => ({
    tag: "div",
    class: "shk-sk shk-sk--circle",
    style: { width: cssLen(size), height: cssLen(size) },
  });

  const mediaRow = (avatar: number | string): VNode => ({
    tag: "div",
    class: "shk-sk-row",
    children: [
      circle(avatar),
      { tag: "div", class: "shk-sk-col", children: [line("50%"), line("80%")] },
    ],
  });

  if (variant === "text") {
    const n = Math.max(1, Math.floor(opts.lines ?? 3));
    for (let i = 0; i < n; i++) {
      const isLast = i === n - 1 && n > 1;
      root.children!.push(
        line(isLast ? "60%" : opts.width != null ? cssLen(opts.width) : undefined),
      );
    }
  } else if (variant === "circle") {
    const size = opts.width ?? opts.height ?? 48;
    root.children!.push({
      tag: "div",
      class: "shk-sk shk-sk--circle",
      style: { width: cssLen(size), height: cssLen(opts.height ?? size) },
    });
  } else if (variant === "rect") {
    root.children!.push({
      tag: "div",
      class: "shk-sk shk-sk--rect",
      style: {
        width: opts.width != null ? cssLen(opts.width) : "100%",
        height: opts.height != null ? cssLen(opts.height) : "120px",
      },
    });
  } else if (variant === "card") {
    root.class = "shk-sk-root shk-sk-root--card";
    root.children!.push({
      tag: "div",
      class: "shk-sk shk-sk--rect",
      style: {
        width: "100%",
        height: opts.height != null ? cssLen(opts.height) : "140px",
      },
    });
    root.children!.push(line("90%"), line("75%"), line("50%"));
  } else if (variant === "avatar") {
    root.children!.push(mediaRow(opts.width ?? 48));
  } else if (variant === "list") {
    const n = Math.max(1, Math.floor(opts.count ?? 4));
    for (let i = 0; i < n; i++) root.children!.push(mediaRow(opts.width ?? 40));
  } else if (variant === "table") {
    const rows = Math.max(1, Math.floor(opts.lines ?? 4));
    const cols = Math.max(1, Math.floor(opts.columns ?? 3));
    for (let r = 0; r < rows; r++) {
      const cells: VNode[] = [];
      for (let c = 0; c < cols; c++) cells.push(line(undefined, { flex: "1" }));
      root.children!.push({ tag: "div", class: "shk-sk-row", children: cells });
    }
  } else if (variant === "button") {
    root.children!.push({
      tag: "div",
      class: "shk-sk shk-sk--rect",
      style: {
        width: opts.width != null ? cssLen(opts.width) : "96px",
        height: opts.height != null ? cssLen(opts.height) : "38px",
      },
    });
  } else if (variant === "image") {
    root.children!.push({
      tag: "div",
      class: "shk-sk shk-sk--image",
      style: opts.height != null ? { height: cssLen(opts.height) } : {},
    });
  } else {
    // grid: a responsive grid of card items (image + two lines)
    root.class = "shk-sk-root shk-sk-grid";
    const n = Math.max(1, Math.floor(opts.count ?? 6));
    for (let i = 0; i < n; i++) {
      root.children!.push({
        tag: "div",
        class: "shk-sk-col",
        children: [
          { tag: "div", class: "shk-sk shk-sk--image" },
          line("80%"),
          line("55%"),
        ],
      });
    }
  }

  return root;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function styleToString(style: Record<string, string | number | undefined>): string {
  return Object.entries(style)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

/** Serialize a vnode tree to an HTML string (used inside shadow DOM). */
export function nodeToHTML(node: VNode): string {
  const cls = node.class ? ` class="${escapeHtml(node.class)}"` : "";
  const styleStr = node.style ? styleToString(node.style) : "";
  const style = styleStr ? ` style="${escapeHtml(styleStr)}"` : "";
  const attrs = node.attrs
    ? Object.entries(node.attrs)
        .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
        .join("")
    : "";
  const inner = node.children ? node.children.map(nodeToHTML).join("") : "";
  return `<${node.tag}${cls}${style}${attrs}>${inner}</${node.tag}>`;
}

/**
 * The single source of truth for all visuals. Injected into shadow DOM by the
 * Web Components, into <head> by the React layer, and emitted to a standalone
 * `styles.css` at build time for manual/SSR use.
 */
export const STYLES = /* css */ `
.shk{
  --_speed: var(--shk-speed, 1);
  --_thick: var(--shk-thickness, calc(var(--shk-size, 40px) * 0.1));
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: var(--shk-size, 40px);
  height: var(--shk-size, 40px);
  color: var(--shk-color, currentColor);
  vertical-align: middle;
  flex: none;
}
.shk__part{ box-sizing: border-box; }

/* spinner */
.shk--spinner .shk__part{
  position: absolute; inset: 0; border-radius: 50%;
  border: var(--_thick) solid color-mix(in srgb, currentColor 18%, transparent);
  border-top-color: currentColor;
  animation: shk-spin calc(0.7s / var(--_speed)) linear infinite;
}

/* dots */
.shk--dots{ gap: 12%; }
.shk--dots .shk__part{
  width: 24%; aspect-ratio: 1; border-radius: 50%; background: currentColor;
  animation: shk-dots calc(1.2s / var(--_speed)) ease-in-out infinite both;
}
.shk--dots .shk__part:nth-child(1){ animation-delay: calc(-0.32s / var(--_speed)); }
.shk--dots .shk__part:nth-child(2){ animation-delay: calc(-0.16s / var(--_speed)); }

/* bars (equalizer) */
.shk--bars{ gap: 10%; }
.shk--bars .shk__part{
  width: 14%; height: 100%; border-radius: 99px; background: currentColor;
  animation: shk-bars calc(1s / var(--_speed)) ease-in-out infinite;
}
.shk--bars .shk__part:nth-child(1){ animation-delay: calc(-0.4s / var(--_speed)); }
.shk--bars .shk__part:nth-child(2){ animation-delay: calc(-0.3s / var(--_speed)); }
.shk--bars .shk__part:nth-child(3){ animation-delay: calc(-0.2s / var(--_speed)); }
.shk--bars .shk__part:nth-child(4){ animation-delay: calc(-0.1s / var(--_speed)); }

/* pulse */
.shk--pulse .shk__part{
  position: absolute; inset: 0; border-radius: 50%; background: currentColor;
  animation: shk-pulse calc(1.2s / var(--_speed)) cubic-bezier(0,.2,.8,1) infinite;
}

/* ring (segmented) */
.shk--ring .shk__part{
  position: absolute; inset: 0; border-radius: 50%;
  border: var(--_thick) solid currentColor;
  border-color: currentColor transparent transparent transparent;
  animation: shk-spin calc(1.2s / var(--_speed)) cubic-bezier(.5,0,.5,1) infinite;
}
.shk--ring .shk__part:nth-child(1){ animation-delay: calc(-0.45s / var(--_speed)); }
.shk--ring .shk__part:nth-child(2){ animation-delay: calc(-0.3s / var(--_speed)); }
.shk--ring .shk__part:nth-child(3){ animation-delay: calc(-0.15s / var(--_speed)); }

/* ripple */
.shk--ripple .shk__part{
  position: absolute; top: 50%; left: 50%;
  border: var(--_thick) solid currentColor; border-radius: 50%;
  animation: shk-ripple calc(1.2s / var(--_speed)) cubic-bezier(0,.2,.8,1) infinite;
}
.shk--ripple .shk__part:nth-child(2){ animation-delay: calc(-0.6s / var(--_speed)); }

/* wave */
.shk--wave{ gap: 10%; }
.shk--wave .shk__part{
  width: 14%; height: 50%; border-radius: 99px; background: currentColor;
  animation: shk-wave calc(1s / var(--_speed)) ease-in-out infinite;
}
.shk--wave .shk__part:nth-child(1){ animation-delay: calc(-0.4s / var(--_speed)); }
.shk--wave .shk__part:nth-child(2){ animation-delay: calc(-0.3s / var(--_speed)); }
.shk--wave .shk__part:nth-child(3){ animation-delay: calc(-0.2s / var(--_speed)); }
.shk--wave .shk__part:nth-child(4){ animation-delay: calc(-0.1s / var(--_speed)); }

/* grid (3x3) */
.shk--grid{ display: inline-grid; grid-template-columns: repeat(3, 1fr); gap: 12%; padding: 4%; }
.shk--grid .shk__part{
  width: 100%; aspect-ratio: 1; border-radius: 50%; background: currentColor;
  animation: shk-grid calc(1.3s / var(--_speed)) ease-in-out infinite;
}
.shk--grid .shk__part:nth-child(1){ animation-delay: calc(0s / var(--_speed)); }
.shk--grid .shk__part:nth-child(2){ animation-delay: calc(0.1s / var(--_speed)); }
.shk--grid .shk__part:nth-child(3){ animation-delay: calc(0.2s / var(--_speed)); }
.shk--grid .shk__part:nth-child(4){ animation-delay: calc(0.1s / var(--_speed)); }
.shk--grid .shk__part:nth-child(5){ animation-delay: calc(0.2s / var(--_speed)); }
.shk--grid .shk__part:nth-child(6){ animation-delay: calc(0.3s / var(--_speed)); }
.shk--grid .shk__part:nth-child(7){ animation-delay: calc(0.2s / var(--_speed)); }
.shk--grid .shk__part:nth-child(8){ animation-delay: calc(0.3s / var(--_speed)); }
.shk--grid .shk__part:nth-child(9){ animation-delay: calc(0.4s / var(--_speed)); }

/* orbit */
.shk--orbit .shk__part{
  position: absolute; inset: 0;
  animation: shk-spin calc(1s / var(--_speed)) linear infinite;
}
.shk--orbit .shk__part::before{
  content: ""; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 24%; aspect-ratio: 1; border-radius: 50%; background: currentColor;
}
.shk--orbit .shk__part:nth-child(2){
  animation-duration: calc(1.6s / var(--_speed)); animation-direction: reverse;
}
.shk--orbit .shk__part:nth-child(2)::before{
  top: auto; bottom: 0; width: 18%; opacity: .5;
}

/* bounce */
.shk--bounce{ gap: 12%; align-items: flex-end; }
.shk--bounce .shk__part{
  width: 24%; aspect-ratio: 1; border-radius: 50%; background: currentColor;
  animation: shk-bounce calc(0.6s / var(--_speed)) cubic-bezier(.5,.05,.5,.95) infinite alternate;
}
.shk--bounce .shk__part:nth-child(1){ animation-delay: calc(-0.3s / var(--_speed)); }
.shk--bounce .shk__part:nth-child(2){ animation-delay: calc(-0.15s / var(--_speed)); }

/* conic (smooth swept gradient ring) */
.shk--conic .shk__part{
  position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(from 90deg, transparent, currentColor);
  -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - var(--_thick)), #000 calc(100% - var(--_thick)));
          mask: radial-gradient(farthest-side, #0000 calc(100% - var(--_thick)), #000 calc(100% - var(--_thick)));
  animation: shk-spin calc(0.9s / var(--_speed)) linear infinite;
}

/* comet (fading gradient tail with a glowing head) */
.shk--comet .shk__part{
  position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(from 0deg, currentColor, transparent 75%);
  -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - var(--_thick)), #000 calc(100% - var(--_thick)));
          mask: radial-gradient(farthest-side, #0000 calc(100% - var(--_thick)), #000 calc(100% - var(--_thick)));
  animation: shk-spin calc(0.8s / var(--_speed)) linear infinite;
}
.shk--comet .shk__part::after{
  content: ""; position: absolute; top: 0; left: 50%;
  width: var(--_thick); aspect-ratio: 1; border-radius: 50%;
  background: currentColor; transform: translate(-50%, -50%);
}

/* blob (morphing organic shape) */
.shk--blob .shk__part{
  position: absolute; inset: 16%; background: currentColor;
  border-radius: 42% 58% 63% 37% / 45% 48% 52% 55%;
  animation: shk-blob calc(2.6s / var(--_speed)) ease-in-out infinite;
}

/* wobble (elastic jelly squash & stretch) */
.shk--wobble .shk__part{
  position: absolute; inset: 20%; background: currentColor; border-radius: 24%;
  animation: shk-wobble calc(1.1s / var(--_speed)) ease-in-out infinite;
}

/* bouncer (bouncing ball with squash + tracking shadow) */
.shk--bouncer .shk__part{ position: absolute; }
.shk--bouncer .shk__part:nth-child(1){
  bottom: 8%; left: 50%; width: 46%; height: 7%; border-radius: 50%;
  background: currentColor;
  animation: shk-bouncer-shadow calc(0.7s / var(--_speed)) infinite;
}
.shk--bouncer .shk__part:nth-child(2){
  top: 0; left: 50%; width: 34%; aspect-ratio: 1; border-radius: 50%;
  background: currentColor;
  animation: shk-bouncer-ball calc(0.7s / var(--_speed)) infinite;
}

/* liquid (water sloshing in a round vessel) */
.shk--liquid{
  border-radius: 50%; overflow: hidden;
  border: var(--_thick) solid color-mix(in srgb, currentColor 30%, transparent);
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.shk--liquid .shk__part{
  position: absolute; left: 50%; margin-left: -100%;
  width: 200%; aspect-ratio: 1; border-radius: 42%; background: currentColor;
}
.shk--liquid .shk__part:nth-child(1){
  top: 40%; opacity: .55;
  animation: shk-spin calc(6s / var(--_speed)) linear infinite;
}
.shk--liquid .shk__part:nth-child(2){
  top: 44%;
  animation: shk-spin calc(4s / var(--_speed)) linear infinite reverse;
}

/* muncher (chomping mouth eating dots) */
.shk--muncher .shk__part:nth-child(1){
  position: absolute; top: 50%; left: 0; transform: translateY(-50%);
  width: 56%; aspect-ratio: 1; border-radius: 50%; background: currentColor;
  clip-path: polygon(0 0, 100% 0, 100% 50%, 50% 50%, 100% 50%, 100% 100%, 0 100%);
  animation: shk-chomp calc(0.5s / var(--_speed)) ease-in-out infinite alternate;
}
.shk--muncher .shk__part:nth-child(2),
.shk--muncher .shk__part:nth-child(3){
  position: absolute; top: 50%; width: 13%; aspect-ratio: 1; border-radius: 50%;
  background: currentColor; transform: translateY(-50%);
  animation: shk-muncher-dot calc(0.9s / var(--_speed)) linear infinite;
}
.shk--muncher .shk__part:nth-child(2){ right: 20%; animation-delay: calc(-0.45s / var(--_speed)); }
.shk--muncher .shk__part:nth-child(3){ right: 2%; }

/* wifi (radiating signal arcs) */
.shk--wifi .shk__part{
  position: absolute; left: 50%; top: 58%; transform: translate(-50%, -50%);
  border-radius: 50%; border: var(--_thick) solid currentColor;
  -webkit-mask: conic-gradient(from -55deg, #000 0 110deg, #0000 110deg);
          mask: conic-gradient(from -55deg, #000 0 110deg, #0000 110deg);
  animation: shk-wifi calc(1.5s / var(--_speed)) ease-in-out infinite;
}
.shk--wifi .shk__part:nth-child(1){ width: 30%; aspect-ratio: 1; }
.shk--wifi .shk__part:nth-child(2){ width: 60%; aspect-ratio: 1; animation-delay: calc(0.18s / var(--_speed)); }
.shk--wifi .shk__part:nth-child(3){ width: 90%; aspect-ratio: 1; animation-delay: calc(0.36s / var(--_speed)); }

/* helix (DNA double strand) */
.shk--helix{ gap: 3%; }
.shk--helix .shk__part{ position: relative; height: 100%; flex: 1; }
.shk--helix .shk__part::before,
.shk--helix .shk__part::after{
  content: ""; position: absolute; left: 50%; top: 0;
  width: 80%; aspect-ratio: 1; border-radius: 50%; background: currentColor;
  transform: translate(-50%, 0);
  animation: shk-helix calc(2s / var(--_speed)) ease-in-out infinite;
}
.shk--helix .shk__part::after{
  top: 100%; transform: translate(-50%, -100%);
  animation-delay: calc(-1s / var(--_speed));
}
.shk--helix .shk__part:nth-child(2)::before{ animation-delay: calc(-0.18s / var(--_speed)); }
.shk--helix .shk__part:nth-child(2)::after{ animation-delay: calc(-1.18s / var(--_speed)); }
.shk--helix .shk__part:nth-child(3)::before{ animation-delay: calc(-0.36s / var(--_speed)); }
.shk--helix .shk__part:nth-child(3)::after{ animation-delay: calc(-1.36s / var(--_speed)); }
.shk--helix .shk__part:nth-child(4)::before{ animation-delay: calc(-0.54s / var(--_speed)); }
.shk--helix .shk__part:nth-child(4)::after{ animation-delay: calc(-1.54s / var(--_speed)); }
.shk--helix .shk__part:nth-child(5)::before{ animation-delay: calc(-0.72s / var(--_speed)); }
.shk--helix .shk__part:nth-child(5)::after{ animation-delay: calc(-1.72s / var(--_speed)); }

@keyframes shk-spin{ to{ transform: rotate(360deg); } }
@keyframes shk-dots{ 0%,80%,100%{ transform: scale(.3); opacity: .4; } 40%{ transform: scale(1); opacity: 1; } }
@keyframes shk-bars{ 0%,100%{ transform: scaleY(.3); } 50%{ transform: scaleY(1); } }
@keyframes shk-pulse{ 0%{ transform: scale(.1); opacity: 1; } 100%{ transform: scale(1); opacity: 0; } }
@keyframes shk-ripple{
  0%{ width: 0; height: 0; opacity: 1; transform: translate(-50%,-50%); }
  100%{ width: 100%; height: 100%; opacity: 0; transform: translate(-50%,-50%); }
}
@keyframes shk-wave{ 0%,100%{ transform: translateY(50%); } 50%{ transform: translateY(-50%); } }
@keyframes shk-grid{ 0%,70%,100%{ transform: scale(1); opacity: 1; } 35%{ transform: scale(.4); opacity: .4; } }
@keyframes shk-bounce{ from{ transform: translateY(0); } to{ transform: translateY(-120%); } }

@keyframes shk-blob{
  0%,100%{ border-radius: 42% 58% 63% 37% / 45% 48% 52% 55%; transform: rotate(0); }
  33%{ border-radius: 62% 38% 42% 58% / 58% 42% 58% 42%; transform: rotate(160deg); }
  66%{ border-radius: 38% 62% 56% 44% / 50% 60% 40% 50%; transform: rotate(280deg); }
}
@keyframes shk-wobble{
  0%,100%{ transform: scale(1, 1) rotate(0); }
  20%{ transform: scale(1.18, .82) rotate(0); }
  40%{ transform: scale(.85, 1.15) rotate(6deg); }
  60%{ transform: scale(1.1, .9) rotate(-6deg); }
  80%{ transform: scale(.95, 1.05) rotate(2deg); }
}
@keyframes shk-bouncer-ball{
  0%{ transform: translate(-50%, 2%) scale(1, 1); animation-timing-function: cubic-bezier(.5, 0, 1, .5); }
  45%{ transform: translate(-50%, 190%) scale(1, 1); }
  55%{ transform: translate(-50%, 194%) scale(1.3, .65); animation-timing-function: cubic-bezier(0, .5, .5, 1); }
  65%{ transform: translate(-50%, 190%) scale(1, 1); animation-timing-function: cubic-bezier(.5, 0, .5, 1); }
  100%{ transform: translate(-50%, 2%) scale(1, 1); }
}
@keyframes shk-bouncer-shadow{
  0%,100%{ transform: translateX(-50%) scale(.55); opacity: .35; }
  50%{ transform: translateX(-50%) scale(1.1); opacity: .7; }
}
@keyframes shk-chomp{
  0%{ clip-path: polygon(0 0, 100% 0, 100% 50%, 50% 50%, 100% 50%, 100% 100%, 0 100%); }
  100%{ clip-path: polygon(0 0, 100% 0, 100% 18%, 50% 50%, 100% 82%, 100% 100%, 0 100%); }
}
@keyframes shk-muncher-dot{
  0%,55%{ opacity: 1; transform: translateY(-50%) scale(1); }
  70%,100%{ opacity: 0; transform: translateY(-50%) scale(.3); }
}
@keyframes shk-wifi{
  0%,55%,100%{ opacity: .18; }
  28%{ opacity: 1; }
}
@keyframes shk-helix{
  0%,100%{ top: 0%; transform: translate(-50%, 0%) scale(1); opacity: 1; z-index: 2; }
  50%{ top: 100%; transform: translate(-50%, -100%) scale(.45); opacity: .4; z-index: 1; }
}

/* skeletons */
.shk-sk-root{ display: flex; flex-direction: column; gap: .6em; width: 100%; }
.shk-sk-root--card{ gap: .7em; }
.shk-sk{
  --_speed: var(--shk-speed, 1);
  position: relative; overflow: hidden; display: block;
  background: color-mix(in srgb, currentColor 12%, transparent);
  border-radius: var(--shk-radius, 8px);
}
.shk-sk::after{
  content: ""; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, color-mix(in srgb, currentColor 16%, transparent), transparent);
  animation: shk-shimmer calc(1.4s / var(--_speed)) infinite;
}
.shk-sk--line{ height: .8em; width: 100%; }
.shk-sk--circle{ border-radius: 50%; flex: none; }
.shk-sk--rect{ width: 100%; }
.shk-sk--image{ width: 100%; aspect-ratio: 16 / 9; }
.shk-sk-row{ display: flex; flex-direction: row; align-items: center; gap: .75em; width: 100%; }
.shk-sk-col{ display: flex; flex-direction: column; gap: .5em; flex: 1; min-width: 0; }
.shk-sk-grid{ display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1.2em; }
@keyframes shk-shimmer{ 100%{ transform: translateX(100%); } }

/* accessibility: degrade gracefully to a calm pulse, never freeze silently */
@media (prefers-reduced-motion: reduce){
  .shk .shk__part{
    animation: shk-rm-pulse 1.6s ease-in-out infinite !important;
    transform: none !important;
  }
  .shk--helix .shk__part::before, .shk--helix .shk__part::after{
    animation: shk-rm-pulse 1.6s ease-in-out infinite !important;
  }
  .shk-sk::after{ display: none; }
  .shk-sk{ animation: shk-rm-pulse 1.6s ease-in-out infinite; }
}
@keyframes shk-rm-pulse{ 0%,100%{ opacity: .45; } 50%{ opacity: 1; } }
`;
