// hooks/useConnections.ts
import useSWR from 'swr';

const fetcher = (url: string, token: string) =>
  fetch(url, {
    headers: { Authorization: token }
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

export const useConnections = (token: string) => {
  const { data, error, isLoading } = useSWR(
    token ? ['/api/connections', token] : null,
    ([url, token]) => fetcher(url, token)
  );

  return {
    connections: data,
    error,
    isLoading,
  };
};
