import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage } from "node:http";
import { resolve } from "node:path";

const financeDataPath = resolve(process.cwd(), "finance-data.json");

export default defineConfig({
  plugins: [
    react(),
    {
      name: "purrfinance-data-api",
      configureServer(server) {
        server.middlewares.use("/api/finance-data", async (request, response, next) => {
          if (!request.url?.startsWith("/")) {
            next();
            return;
          }

          try {
            if (request.method === "GET") {
              const data = await readFile(financeDataPath, "utf8");
              response.statusCode = 200;
              response.setHeader("Content-Type", "application/json");
              response.end(data);
              return;
            }

            if (request.method === "PUT") {
              const body = await readRequestBody(request);
              JSON.parse(body);
              await writeFile(financeDataPath, `${JSON.stringify(JSON.parse(body), null, 2)}\n`, "utf8");
              response.statusCode = 204;
              response.end();
              return;
            }

            response.statusCode = 405;
            response.end("Method not allowed");
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") {
              response.statusCode = 404;
              response.end("finance-data.json not found");
              return;
            }

            response.statusCode = 500;
            response.end(error instanceof Error ? error.message : "Unknown data API error");
          }
        });
      },
    },
  ],
});

function readRequestBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    let body = "";

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolveBody(body));
    request.on("error", reject);
  });
}
