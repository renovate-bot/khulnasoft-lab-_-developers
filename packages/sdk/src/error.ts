import { AiexecErrorRaw, AiexecErrorType, AiexecGraphQLErrorRaw } from "./types";
import { capitalize, getKeyByValue, nonNullable } from "./utils";

/**
 * A map between the Aiexec API string type and the AiexecErrorType enum
 */
const errorMap: Record<AiexecErrorType, string> = {
  [AiexecErrorType.FeatureNotAccessible]: "feature not accessible",
  [AiexecErrorType.InvalidInput]: "invalid input",
  [AiexecErrorType.Ratelimited]: "ratelimited",
  [AiexecErrorType.NetworkError]: "network error",
  [AiexecErrorType.AuthenticationError]: "authentication error",
  [AiexecErrorType.Forbidden]: "forbidden",
  [AiexecErrorType.BootstrapError]: "bootstrap error",
  [AiexecErrorType.Unknown]: "unknown",
  [AiexecErrorType.InternalError]: "internal error",
  [AiexecErrorType.Other]: "other",
  [AiexecErrorType.UserError]: "user error",
  [AiexecErrorType.GraphqlError]: "graphql error",
  [AiexecErrorType.LockTimeout]: "lock timeout",
  [AiexecErrorType.UsageLimitExceeded]: "usage limit exceeded",
};

/**
 * Match the error type or return unknown
 */
function getErrorType(type?: string): AiexecErrorType {
  return getKeyByValue(errorMap, type) ?? AiexecErrorType.Unknown;
}
/**
 * The error shown if no other message is available
 */
const defaultError = "Unknown error from AiexecClient";

/**
 * One of potentially many graphql errors returned by the Aiexec API
 *
 * @error the raw graphql error returned on the error response
 */
export class AiexecGraphQLError {
  /** The type of this graphql error */
  public type: AiexecErrorType;
  /** A friendly error message */
  public message: string;
  /** If this error is caused by the user input */
  public userError?: boolean;
  /** The path to the graphql node at which the error occured */
  public path?: string[];

  public constructor(error?: AiexecGraphQLErrorRaw) {
    this.type = getErrorType(error?.extensions?.type);
    this.userError = error?.extensions?.userError;
    this.path = error?.path;

    /** Select most readable message */
    this.message =
      error?.extensions?.userPresentableMessage ?? error?.message ?? error?.extensions?.type ?? defaultError;
  }
}

/**
 * An error from the Aiexec API
 *
 * @param error a raw error returned from the AiexecGraphQLClient
 */
export class AiexecError extends Error {
  /** The type of the first error returned by the Aiexec API */
  public type?: AiexecErrorType;
  /** A list of graphql errors returned by the Aiexec API */
  public errors?: AiexecGraphQLError[];
  /** The graphql query that caused this error */
  public query?: string;
  /** The graphql variables that caused this error */
  public variables?: Record<string, unknown>;
  /** Any data returned by this request */
  public data?: unknown;
  /** The http status of this request */
  public status?: number;
  /** The raw AiexecGraphQLClient error */
  public raw?: AiexecErrorRaw;

  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[], type?: AiexecErrorType) {
    /** Find messages, duplicate and join, or default */
    super(
      Array.from(
        new Set(
          [capitalize(error?.message?.split(": {")?.[0]), error?.response?.error, errors?.[0]?.message].filter(
            nonNullable
          )
        )
      )
        .filter(nonNullable)
        .join(" - ") ?? defaultError
    );

    this.type = type;

    /** Set error properties */
    this.errors = errors;
    this.query = error?.request?.query;
    this.variables = error?.request?.variables;
    this.status = error?.response?.status;
    this.data = error?.response?.data;
    this.raw = error;
  }
}

export class FeatureNotAccessibleAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.FeatureNotAccessible);
  }
}

export class InvalidInputAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.InvalidInput);
  }
}

export class RatelimitedAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.Ratelimited);

    const headers = error?.response?.headers;
    this.retryAfter = this.parseNumber(headers?.get("retry-after"));
    this.requestsLimit = this.parseNumber(headers?.get("x-ratelimit-requests-limit"));
    this.requestsRemaining = this.parseNumber(headers?.get("x-ratelimit-requests-remaining"));
    this.requestsResetAt = this.parseNumber(headers?.get("x-ratelimit-requests-reset"));
    this.complexityLimit = this.parseNumber(headers?.get("x-ratelimit-complexity-limit"));
    this.complexityRemaining = this.parseNumber(headers?.get("x-ratelimit-complexity-remaining"));
    this.complexityResetAt = this.parseNumber(headers?.get("x-ratelimit-complexity-reset"));
  }

  /** How long, in seconds, the user agent should wait before making a follow-up request. */
  public retryAfter: number | undefined;

  /** The max amount of requests allowed in the duration. */
  public requestsLimit: number | undefined;
  /** The remaining requests before rate limiting kicks in. */
  public requestsRemaining: number | undefined;
  /** Unix timestamp at which the requests will be reset. */
  public requestsResetAt: number | undefined;

  /** The max amount of complexity allowed in the duration. */
  public complexityLimit: number | undefined;
  /** The remaining complexity before rate limiting kicks in. */
  public complexityRemaining: number | undefined;
  /** Unix timestamp at which the complexity will be reset. */
  public complexityResetAt: number | undefined;

  private parseNumber(value: string | undefined | null): number | undefined {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    return Number(value) ?? undefined;
  }
}

export class NetworkAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.NetworkError);
  }
}

export class AuthenticationAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.AuthenticationError);
  }
}

export class ForbiddenAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.Forbidden);
  }
}

export class BootstrapAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.BootstrapError);
  }
}

export class UnknownAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.Unknown);
  }
}

export class InternalAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.InternalError);
  }
}

export class OtherAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.Other);
  }
}

export class UserAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.UserError);
  }
}

export class GraphqlAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.GraphqlError);
  }
}

export class LockTimeoutAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.LockTimeout);
  }
}

export class UsageLimitExceededAiexecError extends AiexecError {
  public constructor(error?: AiexecErrorRaw, errors?: AiexecGraphQLError[]) {
    super(error, errors, AiexecErrorType.UsageLimitExceeded);
  }
}

/**
 * A map between the Aiexec error type and the AiexecError class
 */
const errorConstructorMap: Record<AiexecErrorType, typeof AiexecError> = {
  [AiexecErrorType.FeatureNotAccessible]: FeatureNotAccessibleAiexecError,
  [AiexecErrorType.InvalidInput]: InvalidInputAiexecError,
  [AiexecErrorType.Ratelimited]: RatelimitedAiexecError,
  [AiexecErrorType.NetworkError]: NetworkAiexecError,
  [AiexecErrorType.AuthenticationError]: AuthenticationAiexecError,
  [AiexecErrorType.Forbidden]: ForbiddenAiexecError,
  [AiexecErrorType.BootstrapError]: BootstrapAiexecError,
  [AiexecErrorType.Unknown]: UnknownAiexecError,
  [AiexecErrorType.InternalError]: InternalAiexecError,
  [AiexecErrorType.Other]: OtherAiexecError,
  [AiexecErrorType.UserError]: UserAiexecError,
  [AiexecErrorType.GraphqlError]: GraphqlAiexecError,
  [AiexecErrorType.LockTimeout]: LockTimeoutAiexecError,
  [AiexecErrorType.UsageLimitExceeded]: UsageLimitExceededAiexecError,
};

export function parseAiexecError(error?: AiexecErrorRaw | AiexecError): AiexecError {
  if (error instanceof AiexecError) {
    return error;
  }

  /** Parse graphQL errors */
  const errors = (error?.response?.errors ?? []).map(graphqlError => {
    return new AiexecGraphQLError(graphqlError);
  });

  /** Set type based first graphql error or http status */
  const status = error?.response?.status;
  const type =
    errors[0]?.type ??
    (status === 403
      ? AiexecErrorType.Forbidden
      : status === 429
        ? AiexecErrorType.Ratelimited
        : `${status}`.startsWith("4")
          ? AiexecErrorType.AuthenticationError
          : status === 500
            ? AiexecErrorType.InternalError
            : `${status}`.startsWith("5")
              ? AiexecErrorType.NetworkError
              : AiexecErrorType.Unknown);

  const AiexecErrorConstructor = errorConstructorMap[type] ?? AiexecError;

  return new AiexecErrorConstructor(error, errors);
}
