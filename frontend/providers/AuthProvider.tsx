import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { setIdentity, logout as reduxLogout } from "@/store/slices/authSlice";
import { clearProfile } from "@/store/slices/userSlice";
import { useDFX } from "./DFXProvider";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
  login: async () => {},
  logout: async () => {},
  isLoggingIn: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authClient } = useDFX();
  const dispatch = useDispatch();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = async () => {
    if (!authClient) {
      toast({
        title: "Error",
        description: "Authentication client not initialized",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (isLoggingIn) {
      return;
    }

    try {
      setIsLoggingIn(true);
      const identityProvider =
        process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL ||
        "https://identity.ic0.app/#authorize";

      await authClient.login({
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        identityProvider,
        onSuccess: () => {
          const principal = authClient.getIdentity().getPrincipal().toString();
          dispatch(setIdentity({ principal }));
          toast({
            title: "Success",
            description: "Successfully logged in",
            duration: 2000,
          });
        },
        onError: (error) => {
          console.error("Login failed:", error);
          // Only show error toast if it's not a user interruption
          if (error !== "UserInterrupt") {
            toast({
              title: "Login Failed",
              description: "Please try again",
              variant: "destructive",
              duration: 2000,
            });
          }
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (!authClient) {
      toast({
        title: "Error",
        description: "Authentication client not initialized",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    try {
      await authClient.logout();
      dispatch(reduxLogout());
      dispatch(clearProfile());
      toast({
        title: "Success",
        description: "Successfully logged out",
        duration: 2000,
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "Failed to log out properly",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (authClient) {
        const isAuthenticated = await authClient.isAuthenticated();
        if (!isAuthenticated) {
          dispatch(reduxLogout());
          dispatch(clearProfile());
        } else {
          // If authenticated, set the identity
          const principal = authClient.getIdentity().getPrincipal().toString();
          dispatch(setIdentity({ principal }));
        }
      }
    };
    checkAuth();
  }, [authClient, dispatch]);

  return (
    <AuthContext.Provider value={{ login, logout: handleLogout, isLoggingIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
