export type PageState =
  | { state: 'loading'; message?: string }
  | { state: 'empty'; message: string; actionLabel?: string }
  | { state: 'error'; message: string; retryLabel?: string }
  | { state: 'ready' };

export const defaultPageStates = {
  loading: 'Loading...',
  empty: 'No records found.',
  error: 'Something went wrong.'
};
