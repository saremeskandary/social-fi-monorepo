import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Spinner } from "@/components/ui/loading-spinner";
import { Principal } from "@dfinity/principal";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { PostList } from "@/components/posts/PostList";
import {
  useGetAllPostsQuery,
  useLikePostMutation,
} from "@/store/api/socialMediaApi";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/store/api/userManagerApi";
import { toast } from "@/hooks/use-toast";
import { UserProfile } from "@/types/api";
import { Post } from "@/store/api/socialMediaApi";

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  const { isAuthenticated, principal } = useSelector(
    (state: RootState) => state.auth
  );

  const userId = Principal.fromText(params.id);

  // Queries and mutations
  const {
    data: posts,
    isLoading: postsIsLoading,
    error: postsError,
  } = useGetAllPostsQuery();

  const [likePost] = useLikePostMutation();

  const {
    data: rawProfile,
    isLoading: profileIsLoading,
    error: profileError,
  } = useGetProfileQuery(userId);

  const [updateProfile] = useUpdateProfileMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const isOwnProfile = principal?.toString() === params.id;

  if (postsIsLoading || profileIsLoading || !posts || !rawProfile)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="large" />
      </div>
    );

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

  // Convert the raw profile to include Principal type
  const userProfile: UserProfile = {
    ...rawProfile,
    id: Principal.fromText(rawProfile.id.toString()),
    // followers and following are already Principal[] type, no need to convert
  };

  const userPosts =
    posts.filter((post: Post) => post.author.toString() === params.id) || [];

  const authorProfiles = new Map<string, UserProfile>();
  if (userProfile) {
    authorProfiles.set(params.id, userProfile);
  }

  if (profileError) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <p className="text-muted-foreground mt-2">
          The profile you're looking for doesn't exist
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProfileHeader
        profile={userProfile}
        isOwnProfile={isOwnProfile}
        onFollow={async () => {
          await followUser(userId);
        }}
        onUnfollow={async () => {
          await unfollowUser(userId);
        }}
      />

      <PostList
        posts={userPosts}
        authorProfiles={authorProfiles}
        onLikePost={async (postId) => {
          await likePost(postId);
        }}
      />

      {isOwnProfile && (
        <EditProfileDialog
          profile={userProfile}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={async (data) => {
            await updateProfile(data);
          }}
        />
      )}
    </div>
  );
}
