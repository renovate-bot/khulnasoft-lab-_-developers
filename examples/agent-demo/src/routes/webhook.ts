import { createHmac } from "crypto";
import { Hono } from "hono";
import { Agent } from "../lib/agent";
import { AgentNotificationWebhook, NotificationType } from "../types/webhooks";

const webhook = new Hono<{ Bindings: CloudflareBindings }>();

webhook.post("/", async c => {
  try {
    const payload = await c.req.text();
    const rawWebhook = JSON.parse(payload);

    // Verify signature: https://aiexec.khulnasoft.com/developers/webhooks#securing-webhooks
    const signature = createHmac("sha256", c.env.AIEXEC_WEBHOOK_SECRET).update(payload).digest("hex");
    if (signature !== c.req.header("aiexec-signature")) {
      return c.json({ error: "Invalid signature" }, 400);
    }

    if (rawWebhook.type !== "AppUserNotification") {
      return c.json(
        {
          status: "success",
          message: "Webhook received successfully",
        },
        200
      );
    }

    const webhook = rawWebhook as AgentNotificationWebhook;

    // Get the access token from KV
    const aiexecAccessToken = await c.env.AIEXEC_TOKENS.get("access_token");
    if (!aiexecAccessToken) {
      throw new Error("No access token found. Please complete the OAuth flow first.");
    }

    const agent = new Agent(c.env.OPENAI_API_KEY, aiexecAccessToken);

    // Handle the agent being assigned to an issue or mentioned in the description of an issue
    if (
      webhook.notification.type === NotificationType.issueAssignedToYou ||
      webhook.notification.type === NotificationType.issueMention
    ) {
      if (!webhook.notification.issue) {
        throw new Error("No issue found in webhook");
      }

      await agent.handleIssueAssignedToYou(webhook.notification.issue);
    }

    // Handle a new comment that either mentions the agent or is in a thread that the agent is already a participant in
    else if (
      webhook.notification.type === NotificationType.issueCommentMention ||
      (webhook.notification.type === NotificationType.issueNewComment && webhook.notification.parentCommentId)
    ) {
      if (!webhook.notification.comment) {
        throw new Error("No comment found in webhook");
      }

      await agent.handleComment(
        webhook.notification.comment,
        webhook.notification.type,
        webhook.notification.parentCommentId
      );
    }

    // Return a success response
    return c.json(
      {
        status: "success",
        message: "Webhook received successfully",
      },
      200
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return c.json(
      {
        status: "error",
        message: "Failed to process webhook",
      },
      400
    );
  }
});

export { webhook };
