# shimmerkit

> Zero-dependency, framework-agnostic animated **loaders** & **skeleton** placeholders. One tuned engine — drops into React, Vue, Svelte, or plain HTML. Accessible by default.

[![npm](https://img.shields.io/npm/v/shimmerkit.svg)](https://www.npmjs.com/package/shimmerkit)
[![downloads](https://img.shields.io/npm/dw/shimmerkit.svg)](https://www.npmjs.com/package/shimmerkit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/shimmerkit)](https://bundlephobia.com/package/shimmerkit)
[![license](https://img.shields.io/npm/l/shimmerkit.svg)](./LICENSE)

18 curated, hand-tuned loaders + 4 skeleton shapes. No SVG, no JS animation loop — just CSS that scales with `currentColor` and a couple of custom properties. The exact same visuals everywhere because every renderer reads from one shared engine.

```
spinner · dots · bars · pulse · ring · ripple · wave · grid · orbit · bounce
conic · comet · blob · wobble · bouncer · liquid · muncher · wifi
```

## Why

In an AI-everywhere world you _can_ vibe-code a one-off spinner. What you don't want to redo each time is the boring part: cross-browser tuning, staggered keyframe delays, `prefers-reduced-motion`, screen-reader labels, and shipping it identically to React **and** vanilla. shimmerkit is that drop-in.

- 🪶 **Zero dependencies**, tiny, tree-shakeable
- 🧩 **Framework-agnostic** — native Web Components work in Vue/Svelte/Angular/HTML
- ⚛️ **First-class React** wrapper (SSR-safe, renders real DOM)
- ♿ **Accessible** — `role="status"`, labels, graceful reduced-motion fallback
- 🎨 **Themeable** with `color`, `size`, `speed`, `thickness` (or raw CSS variables)

## Install

```bash
npm i shimmerkit
```

## React

```tsx
import { Loader, Skeleton } from "shimmerkit/react";

function Example() {
  return (
    <>
      <Loader variant="ring" size={48} color="#6366f1" />

      {loading ? (
        <Skeleton variant="card" />
      ) : (
        <Article data={data} />
      )}
    </>
  );
}
```

Styles auto-inject on the client. For zero-flash SSR, also import the stylesheet once:

```ts
import "shimmerkit/styles.css";
```

## Anywhere else (Web Components)

```html
<script type="module">
  import "shimmerkit"; // registers <shk-loader> and <shk-skeleton>
</script>

<shk-loader variant="dots" size="56" color="tomato" speed="1.4"></shk-loader>

<shk-skeleton variant="text" lines="3"></shk-skeleton>
<shk-skeleton variant="circle" width="48"></shk-skeleton>
<shk-skeleton variant="card"></shk-skeleton>
```

Works the same in **Vue** and **Svelte** templates — they're just custom elements.

## API

### Loader

| Prop / attribute | Type                                                                                      | Default        |
| ---------------- | ----------------------------------------------------------------------------------------- | -------------- |
| `variant`        | `spinner · dots · bars · pulse · ring · ripple · wave · grid · orbit · bounce · conic · comet · blob · wobble · bouncer · liquid · muncher · wifi` | `spinner`      |
| `size`           | `number` (px) \| CSS length                                                                | `40`           |
| `color`          | any CSS color                                                                             | `currentColor` |
| `speed`          | `number` multiplier (2 = twice as fast)                                                    | `1`            |
| `thickness`      | `number` (px) \| CSS length — ring/spinner/ripple stroke                                   | 10% of size    |
| `label`          | `string` — screen-reader text                                                              | `Loading`      |

### Skeleton

| Prop / attribute | Type                              | Default |
| ---------------- | --------------------------------- | ------- |
| `variant`        | `text · circle · rect · card`     | `text`  |
| `lines`          | `number` (text variant)           | `3`     |
| `width`          | `number` (px) \| CSS length       | —       |
| `height`         | `number` (px) \| CSS length       | —       |
| `radius`         | `number` (px) \| CSS length       | `8`     |
| `speed`          | `number` multiplier               | `1`     |

### Theming with CSS variables

Everything is driven by `currentColor` plus a few custom properties, so you can theme without props:

```css
.my-loader {
  color: hotpink;
  --shk-size: 64px;
  --shk-speed: 1.5;
}
```

## Develop

```bash
npm install
npm run build      # bundles ESM + CJS + types, emits styles.css
npm test           # vitest
npm run demo       # build + open http://localhost:5173
```

## License

MIT
