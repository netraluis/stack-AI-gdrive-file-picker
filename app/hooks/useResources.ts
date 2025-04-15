// hooks/useResources.ts
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { ResourceResponse } from '../types/stack-api';

const fetcher = (url: string, token: string) =>
  fetch(url, {
    headers: {
      Authorization: token,
    },
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch resources');
    return res.json();
  });

export const useResources = (connectionId: string, authToken: string, resourceId?: string) => {
  
  const [resources, setResources] = useState<ResourceResponse | null>(null)


  const url = connectionId
    ? resourceId
      ? `/api/connections/${connectionId}/resources/children?resource_id=${resourceId}`
      : `/api/connections/${connectionId}/resources/children`
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    url ? [url, authToken] : null,
    ([url, token]) => fetcher(url, token)
  );

  useEffect(() => {
    if (data?.resources) {
      console.log('Resources:', data);
      setResources(data);
    }
  }, [data]);

  return {
    setResources,
    resources,
    error,
    isLoading,
    mutate,
  };
};
