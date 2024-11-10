import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/declarations/user_manager/user_manager.did";

interface UserAvatarProps
  extends React.ComponentPropsWithoutRef<typeof Avatar> {
  user?: UserProfile | null;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  className,
  ...props
}) => {
  return (
    <Avatar className={cn("h-8 w-8", className)} {...props}>
      {user?.profilePic[0] ? (
        <AvatarImage
          src={user.profilePic[0]}
          alt={user.username || "User avatar"}
          className="object-cover"
        />
      ) : (
        <AvatarFallback className="bg-muted">
          {user?.username ? (
            <span className="font-medium">
              {user.username.slice(0, 2).toUpperCase()}
            </span>
          ) : (
            <User className="h-4 w-4" />
          )}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
