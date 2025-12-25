import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { apiRouter } from "./routes";
import { handleStripeWebhook } from "./controllers/stripeWebhook.controller";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { errorHandler } from "./middlewares/error.middleware";

export const app = express();

app.use(cors());

// Serve uploaded files (avatars, etc.)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// IMPORTANT: Stripe requires the raw body to validate the signature.
// Mount webhook routes BEFORE the JSON parser so the body isn't consumed/modified.
app.post("/api/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// Keep JSON parsing enabled for the rest of the API.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);


