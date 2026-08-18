const API_URL =
  'https://vacmthkdjgcabxujykvs.supabase.co/functions/v1/cricai-app-api';

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const response = await fetch(`${API_URL}${cleanPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `API error ${response.status}`);
  }

  return data;
}

export default API_URL;
