import { InferRequestType, InferResponseType } from 'hono';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { $api } from '@/server/client/react';

export default function useCreateStoryStep() {
  const queryClient = useQueryClient();
  const $post = $api.v1['story-step'].$post;
  return useMutation<
    InferResponseType<typeof $post>,
    Error,
    InferRequestType<typeof $post>['form']
  >({
    mutationFn: async form => {
      const res = await $post({ form });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to create story');
      queryClient.invalidateQueries({
        queryKey: ['stories'],
      });
      return res.json();
    },
  });
}
