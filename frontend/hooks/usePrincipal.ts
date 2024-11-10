// hooks/usePrincipal.ts
import { Principal } from "@dfinity/principal";

export function usePrincipal() {
  const validatePrincipal = (value: string): boolean => {
    try {
      Principal.fromText(value);
      return true;
    } catch {
      return false;
    }
  };

  const getPrincipalFromText = (value: string): Principal | null => {
    try {
      return Principal.fromText(value);
    } catch {
      return null;
    }
  };

  const shortenPrincipal = (principal: Principal): string => {
    const text = principal.toString();
    if (text.length <= 12) return text;
    return `${text.slice(0, 6)}...${text.slice(-6)}`;
  };

  return {
    validatePrincipal,
    getPrincipalFromText,
    shortenPrincipal,
  };
}
