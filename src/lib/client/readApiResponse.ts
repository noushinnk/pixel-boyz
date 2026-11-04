export async function readApiResponse(response: Response): Promise<Record<string, unknown>> {
  let payload: unknown;
  try {
    payload = JSON.parse(await response.text());
  } catch {
    throw new Error(
      `The campaign service returned an unexpected response (HTTP ${response.status}). Please refresh and try again.`
    );
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('The campaign service returned an invalid response. Please try again.');
  }

  return payload as Record<string, unknown>;
}
