import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { HttpAgent, Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { idlFactory } from "@/declarations/user_manager/user_manager.did.js";
import type {
  UserManager,
  UserProfile,
  Result as UserResult,
} from "@/declarations/user_manager/user_manager.did";

function createFetchError(error: unknown): FetchBaseQueryError {
  return {
    status: "CUSTOM_ERROR",
    error: String(error),
  };
}

interface RegisterUserRequest {
  username: string;
  bio?: string;
  profilePic?: string;
}

export const userManagerApi = createApi({
  reducerPath: "userManagerApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Profile", "Followers"],
  endpoints: (builder) => ({
    registerUser: builder.mutation<UserProfile, RegisterUserRequest>({
      async queryFn(request, { getState }) {
        try {
          const actor = await getUserManagerActor();

          // Create user profile object
          const userProfile: UserProfile = {
            id: Principal.fromText((getState() as any).auth.principal),
            username: request.username,
            bio: request.bio ? [request.bio] : [],
            profilePic: request.profilePic ? [request.profilePic] : [],
            followers: [],
            following: [],
            joinDate: BigInt(Date.now()) * BigInt(1000000), // Convert to nanoseconds
          };

          const result = await actor.registerUser(userProfile);

          if ("ok" in result) {
            return { data: result.ok };
          }

          // Handle specific error cases
          const errorType = Object.keys(result.err)[0];
          let errorMessage: string;

          switch (errorType) {
            case "UsernameTaken":
              errorMessage = "This username is already taken";
              break;
            case "AlreadyExists":
              errorMessage = "You already have a profile";
              break;
            case "InvalidInput":
              errorMessage = "Invalid username format";
              break;
            case "NotAuthorized":
              errorMessage = "Not authorized to perform this action";
              break;
            default:
              errorMessage = "Failed to create profile";
          }

          return {
            error: createFetchError(errorMessage),
          };
        } catch (error) {
          return {
            error: createFetchError(error),
          };
        }
      },
      invalidatesTags: (result) =>
        result ? [{ type: "Profile", id: result.id.toString() }] : ["Profile"],
    }),

    getProfile: builder.query<UserProfile, Principal>({
      async queryFn(userId) {
        try {
          const actor = await getUserManagerActor();
          const result = await actor.getProfile(userId);
          if ("ok" in result) {
            return { data: result.ok };
          }
          return {
            error: createFetchError(Object.keys(result.err)[0]),
          };
        } catch (error) {
          return {
            error: createFetchError(error),
          };
        }
      },
      providesTags: (_, __, id) => [{ type: "Profile", id: id.toString() }],
    }),

    getProfiles: builder.query<Map<string, UserProfile>, string[]>({
      async queryFn(userIds) {
        try {
          const actor = await getUserManagerActor();
          const profiles = new Map<string, UserProfile>();
          const results = await Promise.all(
            userIds.map(async (id) => {
              const result = await actor.getProfile(Principal.fromText(id));
              if ("ok" in result) {
                profiles.set(id, result.ok);
              }
              return result;
            })
          );
          return { data: profiles };
        } catch (error) {
          return {
            error: createFetchError(error),
          };
        }
      },
      providesTags: (_, __, ids) => [
        ...ids.map((id) => ({ type: "Profile" as const, id })),
      ],
    }),

    updateProfile: builder.mutation<
      UserProfile,
      { username: string; bio?: string; profilePic?: string }
    >({
      async queryFn(request) {
        try {
          const actor = await getUserManagerActor();
          const result = await actor.updateProfile(
            request.username,
            request.bio ? [request.bio] : [],
            request.profilePic ? [request.profilePic] : []
          );
          if ("ok" in result) {
            return { data: result.ok };
          }
          return {
            error: createFetchError(Object.keys(result.err)[0]),
          };
        } catch (error) {
          return {
            error: createFetchError(error),
          };
        }
      },
      invalidatesTags: (result) =>
        result ? [{ type: "Profile", id: result.id.toString() }] : ["Profile"],
    }),

    followUser: builder.mutation<UserProfile, Principal>({
      async queryFn(userToFollow) {
        try {
          const actor = await getUserManagerActor();
          const result = await actor.followUser(userToFollow);
          if ("ok" in result) {
            return { data: result.ok };
          }
          return {
            error: createFetchError(Object.keys(result.err)[0]),
          };
        } catch (error) {
          return {
            error: createFetchError(error),
          };
        }
      },
      invalidatesTags: ["Profile", "Followers"],
    }),

    unfollowUser: builder.mutation<UserProfile, Principal>({
      async queryFn(userToUnfollow) {
        try {
          const actor = await getUserManagerActor();
          const result = await actor.unfollowUser(userToUnfollow);
          if ("ok" in result) {
            return { data: result.ok };
          }
          return {
            error: createFetchError(Object.keys(result.err)[0]),
          };
        } catch (error) {
          return {
            error: createFetchError(error),
          };
        }
      },
      invalidatesTags: ["Profile", "Followers"],
    }),
  }),
});

async function getUserManagerActor(): Promise<UserManager> {
  const canisterId = process.env.NEXT_PUBLIC_USER_MANAGER_CANISTER_ID;
  if (!canisterId) {
    throw new Error("User Manager Canister ID not found");
  }
  const agent = new HttpAgent({
    host: process.env.NEXT_PUBLIC_IC_HOST,
  });
  if (
    process.env.NEXT_PUBLIC_IC_HOST?.includes("localhost") ||
    process.env.NEXT_PUBLIC_IC_HOST?.includes("127.0.0.1")
  ) {
    await agent.fetchRootKey();
  }
  return Actor.createActor<UserManager>(idlFactory, {
    agent,
    canisterId: Principal.fromText(canisterId),
  });
}

export const {
  useRegisterUserMutation,
  useGetProfileQuery,
  useGetProfilesQuery,
  useUpdateProfileMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = userManagerApi;
