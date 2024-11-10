"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { useDispatch } from "react-redux";
import { setIdentity, logout } from "@/store/slices/authSlice";

interface DFXContextType {
  agent: HttpAgent | null;
  authClient: AuthClient | null;
  isInitialized: boolean;
}

const DFXContext = createContext<DFXContextType>({
  agent: null,
  authClient: null,
  isInitialized: false,
});

export function DFXProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<HttpAgent | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);

        const agent = new HttpAgent({
          host: process.env.NEXT_PUBLIC_IC_HOST,
        });

        const identity = client.getIdentity();

        if (await client.isAuthenticated()) {
          agent.replaceIdentity(identity);
          const principal = identity.getPrincipal().toString();
          dispatch(setIdentity({ principal }));
        }

        setAgent(agent);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize DFX:", error);
        dispatch(logout());
      }
    };

    init();
  }, [dispatch]);

  return (
    <DFXContext.Provider value={{ agent, authClient, isInitialized }}>
      {children}
    </DFXContext.Provider>
  );
}

export const useDFX = () => useContext(DFXContext);
