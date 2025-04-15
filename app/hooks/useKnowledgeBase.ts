import useSWRMutation from "swr/mutation";

const createKnowledgeBase = async (
  url: string,
  {
    arg,
  }: {
    arg: {
      authToken: string;
      body: {
        connectionId: string;
        connectionSourceIds: string[];
        name: string;
      };
    };
  }
) => {
  console.log({arg})
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${arg.authToken}`,
    },
    body: JSON.stringify(arg.body),
  });
  if (!res.ok) throw new Error("Failed to create knowledge base");
  return res.json();
};

export function useCreateKnowledgeBase() {
  return useSWRMutation("/api/knowledge-bases", createKnowledgeBase);
}
