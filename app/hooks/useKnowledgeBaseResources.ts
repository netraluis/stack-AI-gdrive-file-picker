import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const fetcher = ([url, token]: [string, string]) =>
  fetch(url, {
    headers: {
      Authorization: `${token}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch resources");
    return res.json();
  });

export function useKnowledgeBaseResources(kbId: string | undefined, token: string) {
  const url = `/api/knowledge-bases/${kbId}/resources/children`;
  const shouldFetch = token && kbId;

  const res = useSWR(
    shouldFetch ? [url, token] : null,
    fetcher
  );
  const { data, error, isLoading, mutate } = res;
  return { data, error, isLoading, mutate };
}



async function deleteKnowledgeBaseResource(
  url: string,
  {
    arg,
  }: {
    arg: {
      resourcePath: string;
      token: string;
    };
  }
) {
  const { resourcePath, token } = arg;

  const res = await fetch(`${url}?resource_path=${encodeURIComponent(resourcePath)}`, {
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete resource");
  }

  return data;
}

export function useDeleteKnowledgeBaseResource(kbId: string | undefined) {
  const url = kbId ? `/api/knowledge-bases/${kbId}/resources` : null;

  return useSWRMutation(url, deleteKnowledgeBaseResource);
}