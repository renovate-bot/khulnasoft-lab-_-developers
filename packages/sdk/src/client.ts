import { DocumentNode } from "graphql/language/ast";
import { parseAiexecError } from "./error";
import { AiexecGraphQLClient } from "./graphql-client";
import { AiexecClientOptions, AiexecClientParsedOptions } from "./types";
import { serializeUserAgent } from "./utils";
import { AiexecSdk } from "./_generated_sdk";

/**
 * Validate and return default AiexecGraphQLClient options
 *
 * @param options initial request options to pass to the graphql client
 * @returns parsed graphql client options
 */
function parseClientOptions({
  apiKey,
  accessToken,
  apiUrl,
  headers,
  ...opts
}: AiexecClientOptions): AiexecClientParsedOptions {
  if (!accessToken && !apiKey) {
    throw new Error(
      "No accessToken or apiKey provided to the AiexecClient - create one here: https://aiexec.khulnasoft.com/settings/account/security"
    );
  }

  return {
    headers: {
      /** Use bearer if oauth token exists, otherwise use the provided apiKey */
      Authorization: accessToken
        ? accessToken.startsWith("Bearer ")
          ? accessToken
          : `Bearer ${accessToken}`
        : (apiKey ?? ""),
      /** Use configured headers */
      ...headers,
      /** Override any user agent with the sdk name and version */
      "User-Agent": serializeUserAgent({
        [process.env.npm_package_name ?? "@aiexec/sdk"]: process.env.npm_package_version ?? "unknown",
      }),
    },
    /** Default to production aiexec api */
    apiUrl: apiUrl ?? "https://api.aiexec.khulnasoft.com/graphql",
    ...opts,
  };
}

/**
 * Create a Aiexec API client
 *
 * @param options request options to pass to the AiexecGraphQLClient
 */
export class AiexecClient extends AiexecSdk {
  public options: AiexecClientParsedOptions;
  public client: AiexecGraphQLClient;

  public constructor(options: AiexecClientOptions) {
    const parsedOptions = parseClientOptions(options);
    const graphQLClient = new AiexecGraphQLClient(parsedOptions.apiUrl, parsedOptions);

    super(<Data, Variables extends Record<string, unknown>>(doc: DocumentNode, vars?: Variables) =>
      /** Call the AiexecGraphQLClient */
      this.client.request<Data, Variables>(doc, vars).catch(error => {
        /** Catch and wrap errors from the AiexecGraphQLClient */
        throw parseAiexecError(error);
      })
    );

    this.options = parsedOptions;
    this.client = graphQLClient;
  }
}
