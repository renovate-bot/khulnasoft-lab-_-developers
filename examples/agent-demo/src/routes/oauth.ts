import { Hono } from "hono";
import { OAuthHelper } from "../lib/oauthHelper";

const oauth = new Hono<{ Bindings: CloudflareBindings }>();

// OAuth authorization endpoint
oauth.get("/authorize", async c => {
  // Generate a new state for this OAuth flow and store it in KV
  const state = OAuthHelper.generateState();
  await c.env.AIEXEC_TOKENS.put("oauth_state", state);

  const authUrl = OAuthHelper.generateAuthorizationUrl(c.env.AIEXEC_CLIENT_ID, `${c.env.URL}/oauth/callback`, state);
  return c.redirect(authUrl);
});

// OAuth callback endpoint
oauth.get("/callback", async c => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const error = c.req.query("error");

  if (error) {
    return c.json({ error: "Authorization failed", details: error }, 400);
  }

  if (!code || !state) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  try {
    // Retrieve the stored state from KV
    const storedState = await c.env.AIEXEC_TOKENS.get("oauth_state");
    if (!storedState || storedState !== state) {
      return c.json({ error: "Invalid state parameter" }, 400);
    }

    const tokenResponse = await OAuthHelper.exchangeCodeForToken(
      code,
      c.env.AIEXEC_CLIENT_ID,
      c.env.AIEXEC_CLIENT_SECRET,
      `${c.env.URL}/oauth/callback`
    );
    const accessToken = tokenResponse.access_token;

    // Store the access token in KV
    await c.env.AIEXEC_TOKENS.put("access_token", accessToken);

    // Clean up the state
    await c.env.AIEXEC_TOKENS.delete("oauth_state");

    return c.json({
      status: "success",
      message: "OAuth flow completed successfully. The access token has been stored in KV.",
    });
  } catch (error) {
    // Clean up the state if something goes wrong
    await c.env.AIEXEC_TOKENS.delete("oauth_state");

    return c.json(
      {
        status: "error",
        message: "Failed to complete OAuth flow",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      400
    );
  }
});

// OAuth revoke endpoint
oauth.get("/revoke", async c => {
  try {
    // Get the access token from KV
    const accessToken = await c.env.AIEXEC_TOKENS.get("access_token");
    if (!accessToken) {
      return c.json({ error: "No access token found" }, 400);
    }

    // Revoke the token in Aiexec
    const response = await fetch("https://api.aiexec.khulnasoft.com/oauth/revoke", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to revoke token in Aiexec: ${response.statusText}`);
    }

    // Delete the token from KV
    await c.env.AIEXEC_TOKENS.delete("access_token");

    return c.json({
      status: "success",
      message: "Access token has been revoked in Aiexec and removed from storage.",
    });
  } catch (error) {
    return c.json(
      {
        status: "error",
        message: "Failed to revoke access token",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export { oauth };
