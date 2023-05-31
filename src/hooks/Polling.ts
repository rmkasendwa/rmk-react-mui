import { useEffect, useRef } from 'react';

export const PAGINATION_RECORDS_BASE_REFRESH_INTERVAL = 10000;
const WINDOW_BLUR_THRESHOLD = 60 * 1000;

export type LoadFunction = () => void;

export interface PollingProps {
  autoSync?: boolean;
  errorMessage?: string;
  loading?: boolean;
  refreshInterval?: number;
  load: LoadFunction;
}

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
