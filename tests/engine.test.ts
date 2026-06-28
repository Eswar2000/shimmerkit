import { describe, it, expect } from "vitest";
import {
  LOADER_VARIANTS,
  buildLoaderNode,
  buildSkeletonNode,
  nodeToHTML,
  STYLES,
} from "../src/index";

describe("buildLoaderNode", () => {
  it("defaults to a spinner with one part", () => {
    const node = buildLoaderNode();
    expect(node.class).toBe("shk shk--spinner");
    expect(node.children).toHaveLength(1);
    expect(node.attrs?.role).toBe("status");
    expect(node.attrs?.["aria-label"]).toBe("Loading");
  });

  it("falls back to spinner for unknown variants", () => {
    // @ts-expect-error testing invalid input handling
    const node = buildLoaderNode({ variant: "nope" });
    expect(node.class).toBe("shk shk--spinner");
  });

  it("creates the right number of parts per variant", () => {
    const counts: Record<string, number> = {
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
      cube: 6,
      folding: 4,
      inchworm: 1,
    };
    for (const v of LOADER_VARIANTS) {
      expect(buildLoaderNode({ variant: v }).children).toHaveLength(counts[v]);
    }
  });

  it("maps numeric size to px and passes through CSS lengths", () => {
    expect(buildLoaderNode({ size: 64 }).style?.["--shk-size"]).toBe("64px");
    expect(buildLoaderNode({ size: "3rem" }).style?.["--shk-size"]).toBe("3rem");
  });

  it("uses a custom aria-label", () => {
    expect(buildLoaderNode({ label: "Fetching" }).attrs?.["aria-label"]).toBe(
      "Fetching",
    );
  });
});

describe("buildSkeletonNode", () => {
  it("renders N text lines with a shorter last line", () => {
    const node = buildSkeletonNode({ variant: "text", lines: 3 });
    expect(node.children).toHaveLength(3);
    expect(node.children?.[2].style?.width).toBe("60%");
    expect(node.attrs?.["aria-hidden"]).toBe("true");
  });

  it("builds a composite card", () => {
    const node = buildSkeletonNode({ variant: "card" });
    expect(node.class).toContain("shk-sk-root--card");
    expect(node.children?.[0].class).toContain("shk-sk--rect");
    expect(node.children).toHaveLength(4);
  });

  it("makes a square circle by default", () => {
    const node = buildSkeletonNode({ variant: "circle" });
    expect(node.children?.[0].style?.width).toBe("48px");
    expect(node.children?.[0].style?.height).toBe("48px");
  });

  it("builds an avatar media row (circle + two lines)", () => {
    const node = buildSkeletonNode({ variant: "avatar" });
    const row = node.children?.[0];
    expect(row?.class).toBe("shk-sk-row");
    expect(row?.children?.[0].class).toContain("shk-sk--circle");
    expect(row?.children?.[1].children).toHaveLength(2);
  });

  it("repeats list rows by count", () => {
    const node = buildSkeletonNode({ variant: "list", count: 5 });
    expect(node.children).toHaveLength(5);
    expect(node.children?.[0].class).toBe("shk-sk-row");
  });

  it("builds a table of rows x columns", () => {
    const node = buildSkeletonNode({ variant: "table", lines: 3, columns: 4 });
    expect(node.children).toHaveLength(3);
    expect(node.children?.[0].children).toHaveLength(4);
  });

  it("builds a responsive grid by count", () => {
    const node = buildSkeletonNode({ variant: "grid", count: 6 });
    expect(node.class).toContain("shk-sk-grid");
    expect(node.children).toHaveLength(6);
    expect(node.children?.[0].children?.[0].class).toContain("shk-sk--image");
  });
});

describe("nodeToHTML", () => {
  it("serializes classes, styles and attrs and escapes values", () => {
    const html = nodeToHTML(buildLoaderNode({ variant: "dots", size: 40 }));
    expect(html).toContain('class="shk shk--dots"');
    expect(html).toContain("--shk-size:40px");
    expect(html).toContain('role="status"');
    expect(html.match(/shk__part/g)).toHaveLength(3);
  });

  it("escapes injected markup in attribute values", () => {
    const html = nodeToHTML(buildLoaderNode({ label: '"><img src=x>' }));
    expect(html).not.toContain("<img");
    expect(html).toContain("&quot;&gt;&lt;img");
  });
});

describe("STYLES", () => {
  it("contains a rule for every loader variant", () => {
    for (const v of LOADER_VARIANTS) {
      expect(STYLES).toContain(`.shk--${v}`);
    }
  });

  it("respects reduced motion", () => {
    expect(STYLES).toContain("prefers-reduced-motion");
  });
});
