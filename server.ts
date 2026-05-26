import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiRouter from "./backend/routes/api.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON and urlencoded request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve API endpoints first
  app.use("/api", apiRouter);

  // Fallback and static assets setup holding Vite
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite hot middleware mounting...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hospital SaaS Dashboard Server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical failure during server startup sequence:", error);
});
