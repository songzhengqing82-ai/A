import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const assets = ["index.html", "styles.css", "app.js"];

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "client"), { recursive: true });
await mkdir(path.join(dist, "server"), { recursive: true });

const content = {};
for (const asset of assets) {
  content[asset] = await readFile(path.join(root, asset), "utf8");
  await cp(path.join(root, asset), path.join(dist, "client", asset));
}

const worker = `const assets = new Map(${JSON.stringify([
  ["/", { body: content["index.html"], type: "text/html; charset=UTF-8" }],
  ["/index.html", { body: content["index.html"], type: "text/html; charset=UTF-8" }],
  ["/styles.css", { body: content["styles.css"], type: "text/css; charset=UTF-8" }],
  ["/app.js", { body: content["app.js"], type: "text/javascript; charset=UTF-8" }],
])});

export default {
  async fetch(request) {
    const pathname = new URL(request.url).pathname;
    const asset = assets.get(pathname);
    if (!asset) return new Response("Not Found", { status: 404 });
    return new Response(request.method === "HEAD" ? null : asset.body, {
      status: 200,
      headers: {
        "Content-Type": asset.type,
        "Cache-Control": pathname === "/" || pathname.endsWith(".html") ? "no-cache" : "public, max-age=3600",
        "X-Content-Type-Options": "nosniff"
      }
    });
  }
};
`;

await writeFile(path.join(dist, "server", "index.js"), worker, "utf8");
console.log("Static site built successfully.");
