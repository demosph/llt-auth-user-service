import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { buildSwagger } from "./config/swagger.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  const swaggerDoc = buildSwagger();
  app.use("/auth/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/static", express.static(path.resolve(process.cwd(), "public")));

  app.get("/auth/health", (_req, res) => res.json({ ok: true }));

  app.use((err, _req, res, next) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res
        .status(400)
        .json({ error: "InvalidJSON", message: err.message });
    }
    next(err);
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "InternalServerError" });
  });

  return app;
}
