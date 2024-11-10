import { Button } from "../ui/button";
import { Loader2, Settings, UserPlus, UserMinus } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { formatDistance } from "date-fns";
import { UserProfile } from "@/types/api";

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onFollow?: () => Promise<void>;
  onUnfollow?: () => Promise<void>;
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  onFollow,
  onUnfollow,
}: ProfileHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const currentUserProfile = useSelector(
    (state: RootState) => state.user.profile
  );

  const isFollowing = currentUserProfile?.following.some(
    (id) => id.toString() === profile.id.toString()
  );

  const handleFollowAction = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      if (isFollowing) {
        await onUnfollow?.();
      } else {
        await onFollow?.();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          {profile.profilePic[0] ? (
            <img
              src={profile.profilePic[0]}
              alt={profile.username}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-muted" />
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-sm text-muted-foreground">
              Joined{" "}
              {formatDistance(
                Number(profile.joinDate) / 1_000_000,
                new Date(),
                { addSuffix: true }
              )}
            </p>
            {profile.bio && <p className="text-sm">{profile.bio}</p>}
          </div>
        </div>
        {isOwnProfile ? (
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant={isFollowing ? "outline" : "default"}
            onClick={handleFollowAction}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isFollowing ? (
              <UserMinus className="mr-2 h-4 w-4" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>
      <div className="flex gap-6">
        <div className="text-center">
          <p className="font-semibold">{profile.followers.length}</p>
          <p className="text-sm text-muted-foreground">Followers</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{profile.following.length}</p>
          <p className="text-sm text-muted-foreground">Following</p>
        </div>
      </div>
    </div>
  );
}
