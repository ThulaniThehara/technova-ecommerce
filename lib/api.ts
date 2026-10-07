import { NextResponse } from "next/server";
import { z } from "zod";
import { HttpError } from "./errors";

export const ok = <T>(data: T, status = 200) => NextResponse.json({ success: true, data }, { status });

export const fail = (message: string, status: number, errors?: unknown) =>
  NextResponse.json({ success: false, message, ...(errors ? { errors } : {}) }, { status });

// Reads and validates a JSON body in one step. On failure, `response` is ready to return.
export async function readBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<{ data: z.infer<S>; response?: never } | { data?: never; response: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: fail("Invalid request body", 400) };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { response: fail("Validation failed", 400, z.flattenError(parsed.error as z.ZodError).fieldErrors) };
  }
  return { data: parsed.data };
}

// Business-rule errors carry their own safe message and status; anything else is a 500
// whose details stay in the server log, never in the response.
export function handleError(error: unknown, label: string) {
  if (error instanceof HttpError) return fail(error.message, error.status);
  console.error(`${label} failed`, error);
  return fail("Something went wrong. Please try again.", 500);
}
