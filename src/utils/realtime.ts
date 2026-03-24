export async function notifyRealtime(event: string, payload?: Record<string, unknown>) {
  const baseUrl = process.env.REALTIME_SERVER_URL;
  if (!baseUrl) return;

  try {
    await fetch(`${baseUrl}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, payload: payload ?? {} }),
    });
  } catch {
    // ignore realtime errors
  }
}
