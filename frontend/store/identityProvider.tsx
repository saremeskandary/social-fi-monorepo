// IdentityContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Identity } from "@dfinity/agent"; // Import Identity type

interface IdentityContextType {
  identity: Identity | null;
  setIdentity: React.Dispatch<React.SetStateAction<Identity | null>>;
}

const IdentityContext = createContext<IdentityContextType | undefined>(
  undefined
);

export const IdentityProvider = ({ children }: { children: ReactNode }) => {
  const [identity, setIdentity] = useState<Identity | null>(null);

  return (
    <IdentityContext.Provider value={{ identity, setIdentity }}>
      {children}
    </IdentityContext.Provider>
  );
};

export const useIdentity = () => {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error("useIdentity must be used within an IdentityProvider");
  }
  return context;
};
