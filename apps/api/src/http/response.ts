export function ok<T>(data: T) {
  return { data };
}

export function created<T>(data: T) {
  return { data };
}

export function deleted() {
  return { data: { deleted: true } };
}
