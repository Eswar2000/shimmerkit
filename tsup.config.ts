import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    react: "src/react/index.tsx",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: "es2020",
  external: ["react", "react-dom", "react/jsx-runtime"],
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
