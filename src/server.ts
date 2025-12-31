import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import app from "./app";

const nodeApp = new Hono();

// Mount the shared app
nodeApp.route("/", app);

// Serve static assets from frontend/dist
nodeApp.use("/*", serveStatic({ root: "./frontend/dist" }));
// Fallback for SPA (serve index.html)
nodeApp.get("/*", serveStatic({ root: "./frontend/dist", path: "index.html" }));

const port = 8787;
console.log(`Server is running on port ${port}`);

serve({
  fetch: nodeApp.fetch,
  port
});
