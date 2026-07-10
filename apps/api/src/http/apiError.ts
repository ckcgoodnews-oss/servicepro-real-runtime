export type ApiErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'validation_failed'
  | 'rate_limited'
  | 'internal_error';

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details: Record<string, unknown> = {}
  ) {
    super(message);
  }
}

export function toApiErrorPayload(error: ApiError) {
  return {
    error: {
      code: error.code,
      message: error.message,
      details: error.details
    }
  };
}
