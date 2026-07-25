/**
 * Client helper for calling the GestaltView rendering API.  Provides a
 * function `renderArtifact` that posts content to `/api/render/decide`
 * and returns a Blob or string representing the rendered artifact.  Use
 * this in front‑end components (e.g. Creation Corner) to fetch previews or
 * downloads.
 */
export async function renderArtifact(options: {
  artifactKind: string;
  content: any;
  format: string;
}): Promise<Blob | string> {
  const response = await fetch('/api/render/decide', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Failed to render artifact');
  }
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.startsWith('text/') || contentType === 'application/json') {
    return response.text();
  }
  return response.blob();
}
