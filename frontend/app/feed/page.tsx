"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useGetAllPostsQuery } from "@/store/api/socialMediaApi";
import { PostList } from "@/components/posts/PostList";
import { Spinner } from "@/components/ui/loading-spinner";
import { Principal } from "@dfinity/principal";
import { usePostActions } from "@/hooks/usePostActions";
import CreatePost from "@/components/posts/CreatePost";
import { useGetProfilesQuery } from "@/store/api/userManagerApi";

export default function FeedPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: posts, isLoading: isLoadingPosts } = useGetAllPostsQuery();
  const { handleCreatePost, handleLikePost } = usePostActions();

  // Get unique author IDs
  const authorIds = useMemo(() => {
    if (!posts) return [];
    return Array.from(new Set(posts.map((post) => post.author.toString())));
  }, [posts]);

  // Fetch profiles for all authors in a single query
  const { data: profiles = new Map() } = useGetProfilesQuery(authorIds, {
    skip: authorIds.length === 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  if (isLoadingPosts) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreatePost
        onSubmit={async (data) => {
          await handleCreatePost(data.content);
        }}
      />
      {posts && (
        <PostList
          posts={posts}
          authorProfiles={profiles}
          onLikePost={handleLikePost}
        />
      )}
    </div>
  );
}
