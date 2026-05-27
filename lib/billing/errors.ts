export function getErrorMessage(error: unknown, fallback = "Billing is temporarily unavailable. Please try again in a moment.") {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function readJsonResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
