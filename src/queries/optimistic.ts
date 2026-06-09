import type { QueryClient } from '@tanstack/react-query';

type Id = number | string;

function getId(item: any): Id | undefined {
  return item?.id ?? item?.post_id ?? item?.comment_id;
}

export interface OptimisticListContext<T> {
  snapshots: Array<[readonly unknown[], T[] | undefined]>;
}

async function snapshotMatching<T>(
  qc: QueryClient,
  queryKey: readonly unknown[]
): Promise<OptimisticListContext<T>> {
  await qc.cancelQueries({ queryKey });
  const snapshots = qc.getQueriesData<T[]>({ queryKey });
  return { snapshots };
}

function rollback<T>(qc: QueryClient, ctx?: OptimisticListContext<T>): void {
  if (!ctx) return;
  for (const [key, data] of ctx.snapshots) {
    qc.setQueryData(key, data);
  }
}

export function optimisticRemove<T>(
  qc: QueryClient,
  queryKey: readonly unknown[]
) {
  return {
    onMutate: async (id: Id): Promise<OptimisticListContext<T>> => {
      const ctx = await snapshotMatching<T>(qc, queryKey);
      for (const [key] of ctx.snapshots) {
        qc.setQueryData<T[]>(key, (old) =>
          Array.isArray(old)
            ? old.filter((item) => getId(item) !== id)
            : old
        );
      }
      return ctx;
    },
    onError: (_err: Error, _id: Id, ctx?: OptimisticListContext<T>) =>
      rollback(qc, ctx),
  };
}

export function optimisticUpdate<T, V extends { id: Id }>(
  qc: QueryClient,
  queryKey: readonly unknown[],
  merge: (item: T, vars: V) => T
) {
  return {
    onMutate: async (vars: V): Promise<OptimisticListContext<T>> => {
      const ctx = await snapshotMatching<T>(qc, queryKey);
      for (const [key] of ctx.snapshots) {
        qc.setQueryData<T[]>(key, (old) =>
          Array.isArray(old)
            ? old.map((item) =>
                getId(item) === vars.id ? merge(item, vars) : item
              )
            : old
        );
      }
      return ctx;
    },
    onError: (_err: Error, _vars: V, ctx?: OptimisticListContext<T>) =>
      rollback(qc, ctx),
  };
}

export function optimisticPrepend<T>(
  qc: QueryClient,
  queryKey: readonly unknown[],
  makeItem: () => T
) {
  return {
    onMutate: async (): Promise<OptimisticListContext<T>> => {
      const ctx = await snapshotMatching<T>(qc, queryKey);
      const item = makeItem();
      for (const [key] of ctx.snapshots) {
        qc.setQueryData<T[]>(key, (old) =>
          Array.isArray(old) ? [item, ...old] : old
        );
      }
      return ctx;
    },
    onError: (_err: Error, _vars: unknown, ctx?: OptimisticListContext<T>) =>
      rollback(qc, ctx),
  };
}
