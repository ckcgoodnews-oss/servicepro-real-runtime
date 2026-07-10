import { ok, created } from '../http/response';
import { requireFields } from '../http/validation';
import { ApiError } from '../http/apiError';

export function validateCreateCustomer(input: Record<string, unknown>) {
  const result = requireFields(input, ['firstName', 'lastName']);
  if (!result.valid) {
    throw new ApiError('validation_failed', 'Customer validation failed.', 400, { issues: result.issues });
  }
}

export const customersControllerContract = {
  list: () => ok([]),
  create: (input: Record<string, unknown>) => {
    validateCreateCustomer(input);
    return created(input);
  },
  get: (id: string) => ok({ id }),
  update: (id: string, input: Record<string, unknown>) => ok({ id, ...input })
};
