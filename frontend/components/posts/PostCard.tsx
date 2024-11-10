import { formatDistance } from "date-fns";
import { Heart, MessageCircle, Share2, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { Post } from "@/declarations/social_media_dapp/social_media_dapp.did";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useLikePostMutation,
  useUnlikePostMutation,
} from "@/store/api/socialMediaApi";
import { UserProfile } from "@/declarations/user_manager/user_manager.did";
import UserAvatar from "../user/UserAvatar";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useState } from "react";

interface PostCardProps {
  post: Post;
  authorProfile?: UserProfile;
  onLike?: () => Promise<void>;
}

function PostCard({ post, authorProfile, onLike }: PostCardProps) {
  const { principal } = useSelector((state: RootState) => state.auth);
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);

  // Use optimistic state if available, otherwise use the actual post state
  const hasLiked =
    optimisticLiked !== null
      ? optimisticLiked
      : post.user_likes.some((p) => p.toString() === principal?.toString());

  const formattedDate = formatDistance(
    Number(post.timestamp) / 1_000_000,
    new Date(),
    { addSuffix: true }
  );

  const handleLikeToggle = async () => {
    if (isLoading || !principal) return;

    setIsLoading(true);
    try {
      if (onLike) {
        await onLike();
      } else {
        // Set optimistic state
        setOptimisticLiked(!hasLiked);

        if (hasLiked) {
          await unlikePost(Number(post.id)).unwrap();
        } else {
          await likePost(Number(post.id)).unwrap();
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticLiked(hasLiked);
      console.error("Failed to toggle like:", error);

      // If the error is "AlreadyLiked", force the liked state to true
      if (error instanceof Error && error.message === "AlreadyLiked") {
        setOptimisticLiked(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate likes count with optimistic updates
  const likesCount =
    Number(post.likes) +
    (optimisticLiked === null ? 0 : optimisticLiked ? 1 : -1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        {authorProfile ? (
          <UserAvatar user={authorProfile} className="h-10 w-10" />
        ) : (
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col">
          <Link
            href={`/profile/${post.author.toString()}`}
            className="font-semibold hover:underline"
          >
            {authorProfile?.username || "Anonymous"}
          </Link>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLikeToggle}
          disabled={isLoading || !principal}
          className={hasLiked ? "text-red-500 hover:text-red-600" : ""}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Heart
              className="mr-2 h-4 w-4"
              fill={hasLiked ? "currentColor" : "none"}
            />
          )}
          {likesCount}
        </Button>
        <Link href={`/post/${post.id}`}>
          <Button variant="ghost" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            {post.comments.length}
          </Button>
        </Link>
        <Button variant="ghost" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
}

export { PostCard };
