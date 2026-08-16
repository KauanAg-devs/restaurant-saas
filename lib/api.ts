export const API = '/api';

export async function api(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API}/${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : typeof data?.message === 'string' ? data.message : 'Não foi possível concluir a solicitação.';
    throw new Error(message);
  }
  return data;
}
