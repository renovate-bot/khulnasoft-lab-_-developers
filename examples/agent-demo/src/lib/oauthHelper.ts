import crypto from "crypto";
import { URL } from "url";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export class OAuthHelper {
  static generateAuthorizationUrl(
    clientId: string,
    redirectUri: string,
    state: string,
    scopes: string[] = ["read", "write", "app:assignable", "app:mentionable"]
  ): string {
    const url = new URL("https://aiexec.khulnasoft.com/oauth/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("actor", "app");
    if (scopes.length > 0) {
      url.searchParams.set("scope", scopes.join(" "));
    }
    return url.toString();
  }

  static async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<TokenResponse> {
    const response = await fetch("https://api.aiexec.khulnasoft.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return response.json() as Promise<TokenResponse>;
  }

  static generateState(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}
