// store/api/searchApi.ts
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Principal } from "@dfinity/principal";
import { UserManagerService, userManagerFactory } from "@/declarations";
import { Actor } from "@dfinity/agent";
import { UserProfile } from "@/types/api";

// Export the API slice
export const searchApi = createApi({
  reducerPath: "searchApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    searchUsers: builder.query<UserProfile[], string>({
      queryFn: async (searchTerm, { getState }) => {
        try {
          // Get the actor instance
          const actor = await getUserManagerActor(getState);

          // Implement your search logic here
          // For now, returning empty array
          return { data: [] };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
    }),
  }),
});

// Helper function to get the actor instance
async function getUserManagerActor(
  getState: () => any
): Promise<UserManagerService> {
  const state = getState();
  const agent = state.dfx.agent;

  if (!agent) {
    throw new Error("Agent not initialized");
  }

  const canisterId = process.env.NEXT_PUBLIC_USER_MANAGER_CANISTER_ID;
  if (!canisterId) {
    throw new Error("User Manager Canister ID not found");
  }

  return Actor.createActor<UserManagerService>(userManagerFactory, {
    agent,
    canisterId: Principal.fromText(canisterId),
  });
}

// Export the generated hooks
export const { useSearchUsersQuery } = searchApi;
