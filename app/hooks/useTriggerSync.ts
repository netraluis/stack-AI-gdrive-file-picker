import useSWRMutation from "swr/mutation";

const triggerSync = async (
  url: string,
  { arg }: { arg: { authToken: string } }
) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `${arg.authToken}`,
    },
  });
  if (!res.ok) throw new Error("Failed to trigger sync");
  return res.json();
};

export function useTriggerSync( orgId: string, kbId?: string,) {
  const url = kbId && orgId ? `/api/knowledge-bases/sync/trigger/${kbId}/${orgId}` : null;
  const { trigger, data, error, isMutating } = useSWRMutation(url, triggerSync);

  return { trigger, data, error, isMutating  };
}
