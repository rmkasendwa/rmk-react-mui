import { useEffect, useRef } from 'react';

export const PAGINATION_RECORDS_BASE_REFRESH_INTERVAL = 10000;
const WINDOW_BLUR_THRESHOLD = 60 * 1000;

export type LoadFunction = () => void;

export interface PollingProps {
  /**
   * Whether to automatically sync data.
   */
  autoSync?: boolean;

  /**
   * The error message to display when the data fails to load.
   */
  errorMessage?: string;

  /**
   * Whether the data is loading.
   */
  loading?: boolean;

  /**
   * The interval in milliseconds at which to refresh the data.
   */
  refreshInterval?: number;

  /**
   * The function to load the data.
   */
  load: LoadFunction;
}

/**
 * A hook to automatically sync data.
 *
 * @param param0 The options of the hook.
 */
export const usePolling = ({
  autoSync,
  errorMessage,
  loading,
  refreshInterval,
  load,
}: PollingProps) => {
  const nextSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (
      autoSync &&
      refreshInterval &&
      refreshInterval >= PAGINATION_RECORDS_BASE_REFRESH_INTERVAL &&
      !loading &&
      !errorMessage
    ) {
      let blurTime: number;
      const mouseMoveEventCallback = () => {
        if (nextSyncTimeoutRef.current !== null) {
          clearTimeout(nextSyncTimeoutRef.current);
        }
        nextSyncTimeoutRef.current = setTimeout(() => {
          loadRef.current();
        }, refreshInterval);
      };
      const visiblityChangeEventCallback = (event?: Event) => {
        if (nextSyncTimeoutRef.current !== null) {
          clearTimeout(nextSyncTimeoutRef.current);
        }
        window.removeEventListener('mousemove', mouseMoveEventCallback);
        if (document.hidden) {
          blurTime = Date.now();
        } else {
          window.addEventListener('mousemove', mouseMoveEventCallback);
          mouseMoveEventCallback();
          if (
            event &&
            blurTime != null &&
            Date.now() - blurTime >= WINDOW_BLUR_THRESHOLD
          ) {
            loadRef.current();
          }
        }
      };
      document.addEventListener(
        'visibilitychange',
        visiblityChangeEventCallback
      );
      visiblityChangeEventCallback();
      return () => {
        window.removeEventListener('mousemove', mouseMoveEventCallback);
        document.removeEventListener(
          'visibilitychange',
          visiblityChangeEventCallback
        );
        if (nextSyncTimeoutRef.current !== null) {
          clearTimeout(nextSyncTimeoutRef.current);
        }
      };
    }
  }, [autoSync, errorMessage, loading, refreshInterval]);
};
