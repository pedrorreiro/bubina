/**
 * Motor base para requisições de rede.
 * Lida com o fetch, headers padrão e tratamento de erro unificado.
 */
export async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Erro na requisição: ${res.status}`);
  }

  // Retornar null para 204 No Content
  if (res.status === 204) return null as T;

  return res.json();
}
