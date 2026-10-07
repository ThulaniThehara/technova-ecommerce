// A business-rule failure whose message is safe to show to the user, with the HTTP status
// the API should answer with (400 bad input, 404 missing, 409 conflicts with current state).
export class HttpError extends Error {
  constructor(
    message: string,
    public status = 409,
  ) {
    super(message);
  }
}
