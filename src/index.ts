/**
 * shimmerkit — main (framework-agnostic) entry point.
 *
 * Importing this in a browser auto-registers the `<shk-loader>` and
 * `<shk-skeleton>` custom elements. In Node it is a harmless no-op, so the same
 * entry is safe to import from build tooling or SSR frameworks.
 */

export {
  STYLES,
  LOADER_VARIANTS,
  buildLoaderNode,
  buildSkeletonNode,
  nodeToHTML,
  type LoaderVariant,
  type SkeletonVariant,
  type LoaderOptions,
  type SkeletonOptions,
  type VNode,
} from "./core/engine";

export { register } from "./core/elements";

import { register } from "./core/elements";

// Convenience: auto-register when loaded in a browser.
register();
