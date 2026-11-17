import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppData } from '@/types';
import { seedData } from '@/mocks/seed';
import { hydrateData } from './hydrate';
const KEY = 'forma:v1';
let queue: Promise<unknown> = Promise.resolve();
export function useData() {
  return useQuery<AppData>({
    queryKey: ['forma'],
    queryFn: async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        return hydrateData(JSON.parse(raw));
      }
      const data = hydrateData(seedData());
      await AsyncStorage.setItem(KEY, JSON.stringify(data));
      return data;
    },
    staleTime: Infinity,
    retry: false,
  });
}
export function useSave() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (update: (data: AppData) => AppData) => {
      const task = queue
        .catch(() => undefined)
        .then(async () => {
          const current = client.getQueryData<AppData>(['forma']);
          if (!current) throw new Error('Data is still loading.');
          const next = update(current);
          await AsyncStorage.setItem(KEY, JSON.stringify(next));
          client.setQueryData(['forma'], next);
        });
      queue = task;
      return task;
    },
  });
}
