// lib/hooks/useUserManagerActor.ts
import { useEffect, useState } from "react";
import { Actor, ActorSubclass } from "@dfinity/agent";
import { useDFX } from "@/providers/DFXProvider";
import { userManagerFactory, UserManagerService } from "@/declarations";
import { Principal } from "@dfinity/principal";

export function useUserManagerActor() {
  const { agent } = useDFX();
  const [actor, setActor] = useState<ActorSubclass<UserManagerService> | null>(
    null
  );

  useEffect(() => {
    if (!agent) return;

    const canisterId = process.env.NEXT_PUBLIC_USER_MANAGER_CANISTER_ID;
    if (!canisterId) {
      console.error(
        "User Manager Canister ID not found in environment variables"
      );
      return;
    }

    try {
      const actor = Actor.createActor<UserManagerService>(userManagerFactory, {
        agent,
        canisterId: Principal.fromText(canisterId),
      });
      setActor(actor);
    } catch (error) {
      console.error("Failed to create user manager actor:", error);
    }
  }, [agent]);

  return actor;
}