// components/profile/FollowersList.tsx
import Link from "next/link";
import { UserProfile } from "@/types/api";

interface FollowersListProps {
  followers: UserProfile[];
}

export function FollowersList({ followers }: FollowersListProps) {
  return (
    <div className="space-y-4">
      {followers.map((follower) => (
        <Link
          key={follower.id.toString()}
          href={`/profile/${follower.id.toString()}`}
          className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors"
        >
          {follower.profilePic[0] ? (
            <img
              src={follower.profilePic[0]}
              alt={follower.username}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-muted" />
          )}
          <div>
            <p className="font-semibold">{follower.username}</p>
            {follower.bio && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {follower.bio}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
