import { Hono } from "hono";
import { oauth } from "./routes/oauth";
import { webhook } from "./routes/webhook";

interface CloudflareBindings {
  AIEXEC_TOKENS: KVNamespace;
  OPENAI_API_KEY: string;
  AIEXEC_CLIENT_ID: string;
  AIEXEC_CLIENT_SECRET: string;
  URL: string;
  AIEXEC_WEBHOOK_SECRET: string;
}

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", c => {
  return c.text("Hello!");
});

app.route("/webhook", webhook);
app.route("/oauth", oauth);

export default app;
