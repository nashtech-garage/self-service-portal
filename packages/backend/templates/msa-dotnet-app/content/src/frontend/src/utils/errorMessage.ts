export function getErrorMessage(err: unknown, fallback = "Something went wrong!") {
  if (typeof err === "object" && err && "message" in err) {
    return (err as { message?: string }).message ?? fallback;
  }
  if (typeof err === "string") {
    return err;
  }
  return fallback;
}
