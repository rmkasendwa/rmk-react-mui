export interface QueryOptions {
  loadOnMount?: boolean;
  autoSync?: boolean;
  revalidationKey?: string;
}

export type GetStaleWhileRevalidateFunction<Data> = (data: Data) => void;
