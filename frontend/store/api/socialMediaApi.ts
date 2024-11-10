import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { HttpAgent, Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { idlFactory } from "@/declarations/social_media_dapp/social_media_dapp.did.js";
import type {
  Post as CanisterPost,
  PostResult,
  Comment as CanisterComment,
  SocialMediaDapp,
} from "@/declarations/social_media_dapp/social_media_dapp.did";

export interface Post {
  id: number;
  content: string;
  author: string;
  timestamp: bigint;
  likes: bigint;
  user_likes: string[];
  comments: Comment[];
}

export interface Comment {
  author: string;
  content: string;
  timestamp: bigint;
}

function convertCanisterPostToPost(post: CanisterPost): Post {
  return {
    id: Number(post.id),
    content: post.content,
    author: post.author.toString(),
    timestamp: post.timestamp,
    likes: post.likes,
    user_likes: post.user_likes.map((principal) => principal.toString()),
    comments: post.comments.map((comment: CanisterComment) => ({
      content: comment.content,
      author: comment.author.toString(),
      timestamp: comment.timestamp,
    })),
  };
}

function createFetchError(error: unknown): FetchBaseQueryError {
  return {
    status: "CUSTOM_ERROR",
    error: String(error),
  };
}

export const socialMediaApi = createApi({
  reducerPath: "socialMediaApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Post", "Posts"],
  endpoints: (builder) => ({
    getAllPosts: builder.query<Post[], void>({
      async queryFn() {
        try {
          const actor = await getSocialMediaActor();
          const posts = await actor.getAllPosts();
          return {
            data: posts.map(convertCanisterPostToPost),
          };
        } catch (error) {
          return {
            error: createFetchError(error),
          };
        }
      },
      providesTags: ["Posts"],
    }),

    getPost: builder.query<Post, number>({
      async queryFn(postId) {
        try {
          const actor = await getSocialMediaActor();
          const result = await actor.getPost(BigInt(postId));
          if ("ok" in result) {
            return { data: convertCanisterPostToPost(result.ok) };
          } else {
            throw new Error(Object.keys(result.err)[0]);
          }
        } catch (error) {
          console.error("Error fetching post:", error);
          return { error: createFetchError(error) };
        }
      },
      providesTags: (_, __, id) => [{ type: "Post", id }],
    }),

    createPost: builder.mutation<Post, string>({
      async queryFn(content) {
        try {
          const actor = await getSocialMediaActor();
          const result = await actor.createPost(content);
          if ("ok" in result) {
            return { data: convertCanisterPostToPost(result.ok) };
          } else {
            throw new Error(Object.keys(result.err)[0]);
          }
        } catch (error) {
          console.error("Error creating post:", error);
          return { error: createFetchError(error) };
        }
      },
      invalidatesTags: ["Posts"],
    }),

    addComment: builder.mutation<Post, { postId: number; content: string }>({
      async queryFn({ postId, content }) {
        try {
          const actor = await getSocialMediaActor();
          const result = await actor.addComment(BigInt(postId), content);
          if ("ok" in result) {
            return { data: convertCanisterPostToPost(result.ok) };
          } else {
            throw new Error(Object.keys(result.err)[0]);
          }
        } catch (error) {
          console.error("Error adding comment:", error);
          return { error: createFetchError(error) };
        }
      },
      invalidatesTags: (_, __, { postId }) => [
        { type: "Post", id: postId },
        "Posts",
      ],
    }),

    likePost: builder.mutation<Post, number>({
      async queryFn(postId) {
        try {
          const actor = await getSocialMediaActor();
          const result = await actor.likePost(BigInt(postId));
          if ("ok" in result) {
            return { data: convertCanisterPostToPost(result.ok) };
          } else {
            throw new Error(Object.keys(result.err)[0]);
          }
        } catch (error) {
          console.error("Error liking post:", error);
          return { error: createFetchError(error) };
        }
      },
      invalidatesTags: (_, __, id) => [{ type: "Post", id }, "Posts"],
    }),

    unlikePost: builder.mutation<Post, number>({
      async queryFn(postId) {
        try {
          const actor = await getSocialMediaActor();
          const result = await actor.unlikePost(BigInt(postId));
          if ("ok" in result) {
            return { data: convertCanisterPostToPost(result.ok) };
          } else {
            throw new Error(Object.keys(result.err)[0]);
          }
        } catch (error) {
          console.error("Error unliking post:", error);
          return { error: createFetchError(error) };
        }
      },
      invalidatesTags: (_, __, id) => [{ type: "Post", id }, "Posts"],
    }),
  }),
});

async function getSocialMediaActor(): Promise<SocialMediaDapp> {
  const canisterId = process.env.NEXT_PUBLIC_SOCIAL_MEDIA_CANISTER_ID;
  if (!canisterId) {
    throw new Error("Social Media Canister ID not found");
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

  return Actor.createActor<SocialMediaDapp>(idlFactory, {
    agent,
    canisterId: Principal.fromText(canisterId),
  });
}

export const {
  useGetAllPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useAddCommentMutation,
  useLikePostMutation,
  useUnlikePostMutation,
} = socialMediaApi;
