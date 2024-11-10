import { formatDistance } from "date-fns";
import Link from "next/link";
import { UserProfile } from "@/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Comment } from "@/store/api/socialMediaApi";

interface CommentListProps {
  comments: Comment[];
  authorProfiles: Map<string, UserProfile>;
}

export function CommentList({ comments, authorProfiles }: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment, index) => {
        const authorProfile = authorProfiles.get(comment.author);
        const formattedDate = formatDistance(
          Number(comment.timestamp) / 1_000_000,
          new Date(),
          { addSuffix: true }
        );

        return (
          <div key={index} className="flex space-x-3">
            <Avatar className="h-8 w-8">
              {authorProfile?.profilePic[0] && (
                <AvatarImage src={authorProfile.profilePic[0]} />
              )}
              <AvatarFallback>
                {authorProfile?.username?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Link
                  href={`/profile/${comment.author}`}
                  className="text-sm font-medium hover:underline"
                >
                  {authorProfile?.username || "Anonymous"}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {formattedDate}
                </span>
              </div>
              <p className="text-sm mt-1">{comment.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
