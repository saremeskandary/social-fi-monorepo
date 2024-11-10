import { UserProfile } from "@/types/api";
import { PostCard } from "./PostCard";
import { Post } from "@/store/api/socialMediaApi";

interface PostListProps {
  posts: Post[];
  authorProfiles: Map<string, UserProfile>;
  onLikePost: (postId: number) => Promise<void>;
}

export function PostList({ posts, authorProfiles, onLikePost }: PostListProps) {
  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          authorProfile={authorProfiles.get(post.author)}
          onLike={() => onLikePost(post.id)}
        />
      ))}
    </div>
  );
}
