import type {
  FieldError,
  FieldErrors,
  FieldValues,
  Resolver,
} from "react-hook-form";
import type { ZodType } from "zod";

/**
 * A ~20-line React Hook Form resolver for Zod.
 *
 * Deliberately hand-rolled instead of pulling in @hookform/resolvers: that
 * package drags in a peer-dependency graph for a dozen validation libraries
 * this project does not use, to do exactly what is below.
 *
 * Client-side validation is a convenience for the visitor. The same schema is
 * re-run on the server in the action, which is what actually decides.
 */
export function createZodResolver<TValues extends FieldValues>(
  schema: ZodType,
): Resolver<TValues> {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values, errors: {} };
    }

    const errors: Record<string, FieldError> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key !== "string") continue;
      // First issue per field wins — it is the most specific.
      if (errors[key]) continue;
      errors[key] = { type: issue.code, message: issue.message };
    }

    return {
      values: {},
      // Zod paths and form field names are the same strings by construction;
      // the cast bridges Zod's untyped issue paths to RHF's mapped error type.
      errors: errors as unknown as FieldErrors<TValues>,
    };
  };
}
