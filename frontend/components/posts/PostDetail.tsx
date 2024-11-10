import { useMemo } from "react";
import { CommentList } from "../comment/CommentList";
import { CreateComment } from "../comment/CreateComment";
import { Card } from "../ui/card";
import { UserProfile } from "@/types/api";
import { Post } from "@/store/api/socialMediaApi";
import { PostCard } from "./PostCard";

interface PostDetailProps {
  post: Post;
  authorProfiles: Map<string, UserProfile>;
  onLike: () => Promise<void>;
  onComment: (content: string) => Promise<void>;
}

export function PostDetail({
  post,
  authorProfiles,
  onLike,
  onComment,
}: PostDetailProps) {
  const commentAuthorIds = useMemo(() => {
    const authors = new Set<string>();
    post.comments.forEach((comment) => {
      authors.add(comment.author);
    });
    return authors;
  }, [post.comments]);

  return (
    <div className="space-y-6">
      <PostCard
        post={post}
        authorProfile={authorProfiles.get(post.author)}
        onLike={onLike}
      />

      <Card className="p-6">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">
            Comments ({post.comments.length})
          </h2>
          <CreateComment
            onSubmit={async (data) => {
              await onComment(data.content);
            }}
          />
          <CommentList
            comments={post.comments}
            authorProfiles={authorProfiles}
          />
        </div>
      </Card>
    </div>
  );
}
