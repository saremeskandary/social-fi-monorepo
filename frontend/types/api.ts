// Re-export types from declarations
export type {
  UserProfile,
  Result as UserResult,
} from "@/declarations/user_manager/user_manager.did";

export type {
  Post,
  Comment,
  PostResult,
  Error as PostError,
} from "@/declarations/social_media_dapp/social_media_dapp.did";

// You can also add type utilities or transformations here if needed
export type WithId<T> = T & { id: number | string };
