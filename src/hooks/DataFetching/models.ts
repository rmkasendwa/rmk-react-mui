export interface QueryOptions {
  /**
   * Whether the API function should be called on mount.
   */
  loadOnMount?: boolean;

  /**
   * Whether the API function should automatically be called when the
   * `revalidationKey` value changes.
   *
   * @default true
   */
  autoSync?: boolean;

  /**
   * The key that will trigger a revalidation when it changes.
   */
  revalidationKey?: string;
}

export type GetStaleWhileRevalidateFunction<Data> = (data: Data) => void;
