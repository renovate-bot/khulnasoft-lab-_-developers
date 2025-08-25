/**
 * Input options for creating a Aiexec Client
 */
export interface AiexecClientOptions extends RequestInit {
  /** Personal api token generated from https://aiexec.khulnasoft.com/settings/account/security */
  apiKey?: string;
  /** The access token returned from oauth endpoints configured in https://aiexec.khulnasoft.com/settings/account/security */
  accessToken?: string;
  /** The url to the Aiexec graphql api */
  apiUrl?: string;
}

/**
 * Validated AiexecGraphQLClient options
 */
export interface AiexecClientParsedOptions extends RequestInit {
  /** The url to the Aiexec graphql api defaulted to production */
  apiUrl: string;
}

/**
 * The raw response from the Aiexec GraphQL Client
 */
export interface AiexecRawResponse<Data> {
  /** The returned data */
  data?: Data;
  /** Any extensions returned by the Aiexec API */
  extensions?: unknown;
  /** Response headers */
  headers?: Headers;
  /** Response status */
  status?: number;
  /** An error message */
  error?: string;
  /** Any GraphQL errors returned by the Aiexec API */
  errors?: AiexecGraphQLErrorRaw[];
}

/**
 * The error types returned by the Aiexec API
 */
export enum AiexecErrorType {
  "FeatureNotAccessible" = "FeatureNotAccessible",
  "InvalidInput" = "InvalidInput",
  "Ratelimited" = "Ratelimited",
  "NetworkError" = "NetworkError",
  "AuthenticationError" = "AuthenticationError",
  "Forbidden" = "Forbidden",
  "BootstrapError" = "BootstrapError",
  "Unknown" = "Unknown",
  "InternalError" = "InternalError",
  "Other" = "Other",
  "UserError" = "UserError",
  "GraphqlError" = "GraphqlError",
  "LockTimeout" = "LockTimeout",
  "UsageLimitExceeded" = "UsageLimitExceeded",
}

/**
 * One of potentially many raw graphql errors returned by the Aiexec API
 */
export interface AiexecGraphQLErrorRaw {
  /** The error type */
  message?: AiexecErrorType;
  /** The path to the graphql node at which the error occured */
  path?: string[];
  extensions?: {
    /** The error type */
    type?: AiexecErrorType;
    /** If caused by the user input */
    userError?: boolean;
    /** A friendly error message */
    userPresentableMessage?: string;
  };
}

/**
 * Description of a GraphQL request used in error handling
 */
export interface GraphQLRequestContext<Variables extends Record<string, unknown>> {
  query: string;
  variables?: Variables;
}

/**
 * The raw error returned by the Aiexec API
 */
export interface AiexecErrorRaw {
  /** Error name if available */
  name?: string;
  /** Error message if available */
  message?: string;
  /** Error information for the request */
  request?: GraphQLRequestContext<Record<string, unknown>>;
  /** Error information for the response */
  response?: AiexecRawResponse<unknown>;
}

/**
 * @deprecated These types have been moved to `@aiexec/sdk/webhooks`. Import from there instead.
 */
export type {
  AppUserNotificationWebhookPayloadWithNotification,
  EntityWebhookPayloadWithUnknownEntityData,
  EntityWebhookPayloadWithEntityData,
  EntityWebhookPayloadWithAttachmentData,
  EntityWebhookPayloadWithAuditEntryData,
  EntityWebhookPayloadWithCommentData,
  EntityWebhookPayloadWithCustomerData,
  EntityWebhookPayloadWithCustomerNeedData,
  EntityWebhookPayloadWithCycleData,
  EntityWebhookPayloadWithDocumentData,
  EntityWebhookPayloadWithInitiativeData,
  EntityWebhookPayloadWithInitiativeUpdateData,
  EntityWebhookPayloadWithIssueData,
  EntityWebhookPayloadWithIssueLabelData,
  EntityWebhookPayloadWithProjectData,
  EntityWebhookPayloadWithProjectUpdateData,
  EntityWebhookPayloadWithReactionData,
  EntityWebhookPayloadWithUserData,
} from "./webhooks/types";
