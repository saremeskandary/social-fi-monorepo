// hooks/useInfiniteScroll.ts
import { useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  enabled?: boolean;
}

export function useInfiniteScroll({
  threshold = 100,
  enabled = true,
}: UseInfiniteScrollOptions = {}) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [threshold, isLoadingMore, enabled]);

  useEffect(() => {
    const currentTarget = targetRef.current;
    const currentObserver = observerRef.current;

    if (currentTarget && currentObserver) {
      currentObserver.observe(currentTarget);
    }

    return () => {
      if (currentTarget && currentObserver) {
        currentObserver.unobserve(currentTarget);
      }
    };
  }, [targetRef.current]);

  const resetIsLoadingMore = () => {
    setIsLoadingMore(false);
  };

  return {
    targetRef,
    isLoadingMore,
    resetIsLoadingMore,
  };
}
