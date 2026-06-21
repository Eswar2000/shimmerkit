// Tiny zero-dependency static server for the demo page (ES module imports from
// the browser need http://, not file://).
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, normalize } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT) || 5173;

const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".cjs": "text/javascript",
  ".css": "text/css",
  ".map": "application/json",
};

const server = createServer(async (req, res) => {
  try {
    let url = decodeURIComponent((req.url || "/").split("?")[0]);
    if (url === "/") url = "/demo/index.html";
    const filePath = normalize(join(root, url));
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": types[extname(filePath)] || "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
});

server.listen(port, () => {
  console.log(`shimmerkit demo: http://localhost:${port}/`);
});
