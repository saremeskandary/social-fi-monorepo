// app/explore/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { PostList } from "@/components/posts/PostList";
import { Spinner } from "@/components/ui/loading-spinner";
import { Principal } from "@dfinity/principal";
import { useGetAllPostsQuery } from "@/store/api/socialMediaApi";
import { useGetProfileQuery } from "@/store/api/userManagerApi";
import { toast } from "@/hooks/use-toast";
import { usePostActions } from "@/hooks/usePostActions";

export default function ExplorePage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const {
    data: posts,
    isLoading: postsIsLoading,
    error: postsError,
  } = useGetAllPostsQuery();
  const { handleLikePost } = usePostActions();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  if (postsIsLoading || !posts) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="large" />
      </div>
    );
  }

  if (postsError) {
    toast({
      title: "Error",
      description: "Failed to load posts",
      variant: "destructive",
    });
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold">Error loading posts</h1>
        <p className="text-muted-foreground mt-2">Please try again later</p>
      </div>
    );
  }

  // Get userProfiles for all post authors using RTK Query
  const authorIds = new Set(posts.map((post) => post.author.toString()));
  const authorProfiles = new Map();

  Array.from(authorIds).forEach((authorId) => {
    const { data: profile, isSuccess } = useGetProfileQuery(
      Principal.fromText(authorId),
      {
        // Skip fetching if the authorId is invalid
        skip: !authorId,
      }
    );

    if (isSuccess && profile) {
      authorProfiles.set(authorId, profile);
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Explore</h1>
      <PostList
        posts={posts}
        authorProfiles={authorProfiles}
        onLikePost={handleLikePost}
      />
    </div>
  );
}
