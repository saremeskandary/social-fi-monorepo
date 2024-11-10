// hooks/useRequireAuth.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useToast } from "./use-toast";

export function useRequireAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        duration: 5000,
      });
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router, toast]);

  return { isAuthenticated, isLoading };
}
