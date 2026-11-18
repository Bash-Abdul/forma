import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useState } from 'react';
import { AppData } from '@/types';
import { initialData } from '@/mocks/seed';
import { hydrateData } from './hydrate';
const KEY = 'forma:v1';
let queue: Promise<unknown> = Promise.resolve();
const PersistenceContext = createContext({
  memoryOnly: false,
  enableMemory: () => {},
});
export function PersistenceProvider({ children }: { children: ReactNode }) {
  const [memoryOnly, setMemoryOnly] = useState(false);
  return (
    <PersistenceContext.Provider
      value={{ memoryOnly, enableMemory: () => setMemoryOnly(true) }}
    >
      {children}
    </PersistenceContext.Provider>
  );
}
export function usePersistence() {
  return useContext(PersistenceContext);
}
async function bounded<T>(work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('Local storage did not respond.')),
          8000,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
export function useData() {
  return useQuery<AppData>({
    queryKey: ['forma'],
    queryFn: async () => {
      const raw = await bounded(AsyncStorage.getItem(KEY));
      if (raw) return hydrateData(JSON.parse(raw));
      const data = initialData();
      await bounded(AsyncStorage.setItem(KEY, JSON.stringify(data)));
      return data;
    },
    staleTime: Infinity,
    retry: false,
  });
}
export function useSave() {
  const client = useQueryClient();
  const { memoryOnly } = usePersistence();
  return useMutation({
    mutationFn: (update: (data: AppData) => AppData) => {
      const task = queue
        .catch(() => undefined)
        .then(async () => {
          const current = client.getQueryData<AppData>(['forma']);
          if (!current) throw new Error('Data is still loading.');
          const next = update(current);
          if (!memoryOnly)
            await bounded(AsyncStorage.setItem(KEY, JSON.stringify(next)));
          client.setQueryData(['forma'], next);
        });
      queue = task;
      return task;
    },
  });
}
export function useMemorySession() {
  const client = useQueryClient();
  const { enableMemory } = usePersistence();
  return () => {
    enableMemory();
    client.setQueryData(['forma'], initialData());
  };
}
