/**
 * shimmerkit Web Components — works in plain HTML, Vue, Svelte, Angular, etc.
 *
 * Custom element classes are declared lazily inside `register()` so this module
 * never touches `HTMLElement` at import time. That keeps `src/index.ts`
 * importable in Node (SSR / build scripts) without crashing.
 */

import {
  STYLES,
  buildLoaderNode,
  buildSkeletonNode,
  nodeToHTML,
  type LoaderVariant,
  type SkeletonVariant,
} from "./engine";

let registered = false;
let sharedSheet: CSSStyleSheet | null = null;

function getSheet(): CSSStyleSheet | null {
  if (sharedSheet) return sharedSheet;
  try {
    if (
      typeof CSSStyleSheet !== "undefined" &&
      "replaceSync" in CSSStyleSheet.prototype
    ) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(STYLES);
      sharedSheet = sheet;
      return sheet;
    }
  } catch {
    /* fall through to <style> fallback */
  }
  return null;
}

function num(el: Element, name: string): string | undefined {
  const v = el.getAttribute(name);
  return v == null ? undefined : v;
}

function float(el: Element, name: string): number | undefined {
  const v = el.getAttribute(name);
  if (v == null) return undefined;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Register `<shk-loader>` and `<shk-skeleton>`. Safe to call multiple times and
 * a no-op outside the browser. Called automatically when you import the package
 * entry point in a browser.
 */
export function register(): void {
  if (registered) return;
  if (typeof window === "undefined" || typeof window.customElements === "undefined") {
    return;
  }
  registered = true;

  abstract class ShkBase extends HTMLElement {
    protected mount: HTMLDivElement;

    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      const sheet = getSheet();
      if (sheet) {
        root.adoptedStyleSheets = [sheet];
      } else {
        const style = document.createElement("style");
        style.textContent = STYLES;
        root.appendChild(style);
      }
      this.mount = document.createElement("div");
      this.mount.style.display = "contents";
      root.appendChild(this.mount);
    }

    connectedCallback(): void {
      this.applyHostDisplay();
      this.render();
    }

    attributeChangedCallback(): void {
      if (this.isConnected) this.render();
    }

    protected abstract applyHostDisplay(): void;
    protected abstract render(): void;
  }

  class ShkLoaderElement extends ShkBase {
    static get observedAttributes(): string[] {
      return ["variant", "size", "color", "speed", "thickness", "label"];
    }

    protected applyHostDisplay(): void {
      if (!this.style.display) this.style.display = "inline-flex";
    }

    protected render(): void {
      const node = buildLoaderNode({
        variant: (this.getAttribute("variant") as LoaderVariant) ?? undefined,
        size: num(this, "size"),
        color: this.getAttribute("color") ?? undefined,
        speed: float(this, "speed"),
        thickness: num(this, "thickness"),
        label: this.getAttribute("label") ?? undefined,
      });
      this.mount.innerHTML = nodeToHTML(node);
    }
  }

  class ShkSkeletonElement extends ShkBase {
    static get observedAttributes(): string[] {
      return ["variant", "lines", "count", "columns", "width", "height", "radius", "speed"];
    }

    protected applyHostDisplay(): void {
      if (!this.style.display) this.style.display = "block";
    }

    protected render(): void {
      const node = buildSkeletonNode({
        variant: (this.getAttribute("variant") as SkeletonVariant) ?? undefined,
        lines: float(this, "lines"),
        count: float(this, "count"),
        columns: float(this, "columns"),
        width: num(this, "width"),
        height: num(this, "height"),
        radius: num(this, "radius"),
        speed: float(this, "speed"),
      });
      this.mount.innerHTML = nodeToHTML(node);
    }
  }

  if (!customElements.get("shk-loader")) {
    customElements.define("shk-loader", ShkLoaderElement);
  }
  if (!customElements.get("shk-skeleton")) {
    customElements.define("shk-skeleton", ShkSkeletonElement);
  }
}
