// lib/hooks/useSocialMediaActor.ts
import { useEffect, useState } from "react";
import { Actor, ActorSubclass } from "@dfinity/agent";
import { useDFX } from "@/providers/DFXProvider";
import { socialMediaFactory, SocialMediaService } from "@/declarations";
import { Principal } from "@dfinity/principal";

export function useSocialMediaActor() {
  const { agent } = useDFX();
  const [actor, setActor] = useState<ActorSubclass<SocialMediaService> | null>(
    null
  );

  useEffect(() => {
    if (!agent) return;

    const canisterId = process.env.NEXT_PUBLIC_SOCIAL_MEDIA_CANISTER_ID;
    if (!canisterId) {
      console.error(
        "Social Media Canister ID not found in environment variables"
      );
      return;
    }

    try {
      const actor = Actor.createActor<SocialMediaService>(socialMediaFactory, {
        agent,
        canisterId: Principal.fromText(canisterId),
      });
      setActor(actor);
    } catch (error) {
      console.error("Failed to create social media actor:", error);
    }
  }, [agent]);

  return actor;
}
