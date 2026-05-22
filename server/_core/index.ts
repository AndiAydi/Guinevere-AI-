import "dotenv/config";
import express from "express";
import cors from "cors"; 
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers/_app";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

const app = express();

app.use(cors({ origin: '*' })); 
app.use(express.json());


app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);


registerOAuthRoutes(app);


if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  setupVite(app);
}

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Guinevere AI] Multi-Client Server running → http://localhost:${PORT}`);
});