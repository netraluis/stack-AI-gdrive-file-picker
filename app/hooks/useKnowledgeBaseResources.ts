import useSWR from "swr";

const fetcher = (url: string, token: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch resources");
    return res.json();
  });

export function useKnowledgeBaseResources(kbId: string, token: string) {
  const url = `/api/knowledge-bases/${kbId}/resources/children`;
  const { data, error, isLoading, mutate } = useSWR(
    token ? [url, token] : null,
    ([url, token]) => fetcher(url, token)
  );
  return { data, error, isLoading, mutate };
}
