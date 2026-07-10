import { ok, created } from '../http/response';
import { requireFields } from '../http/validation';
import { ApiError } from '../http/apiError';

export function validateCreateJob(input: Record<string, unknown>) {
  const result = requireFields(input, ['title']);
  if (!result.valid) {
    throw new ApiError('validation_failed', 'Job validation failed.', 400, { issues: result.issues });
  }
}

export const jobsControllerContract = {
  list: () => ok([]),
  create: (input: Record<string, unknown>) => {
    validateCreateJob(input);
    return created(input);
  },
  get: (id: string) => ok({ id }),
  update: (id: string, input: Record<string, unknown>) => ok({ id, ...input })
};
