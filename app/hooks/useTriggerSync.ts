import useSWRMutation from "swr/mutation";

const triggerSync = async (url: string, { arg }: { arg: { authToken: string } }) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${arg.authToken}`,
      },
    });
    if (!res.ok) throw new Error('Failed to trigger sync');
    return res.json();
  };
  
  export function useTriggerSync(kbId: string, orgId: string) {
    const url = `/api/knowledge-bases/sync/trigger/${kbId}/${orgId}`;
    return useSWRMutation(url, triggerSync);
  }
  