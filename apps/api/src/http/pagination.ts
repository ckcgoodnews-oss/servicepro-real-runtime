export type PageRequest = {
  limit: number;
  cursor?: string;
};

export type PageResponse<T> = {
  data: T[];
  page: {
    limit: number;
    nextCursor?: string;
    hasMore: boolean;
  };
};

export function parsePageRequest(query: Record<string, unknown>): PageRequest {
  const requestedLimit = Number(query.limit || 50);
  const limit = Math.min(Math.max(requestedLimit, 1), 250);
  const cursor = typeof query.cursor === 'string' ? query.cursor : undefined;
  return { limit, cursor };
}

export function pageResponse<T>(data: T[], limit: number, nextCursor?: string): PageResponse<T> {
  return {
    data,
    page: {
      limit,
      nextCursor,
      hasMore: Boolean(nextCursor)
    }
  };
}
