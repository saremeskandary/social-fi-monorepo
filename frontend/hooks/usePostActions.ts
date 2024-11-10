import {
  useAddCommentMutation,
  useCreatePostMutation,
  useLikePostMutation,
} from "@/store/api/socialMediaApi";
import { useToast } from "./use-toast";
import { useAnalytics } from "./useAnalytics";

export function usePostActions() {
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const handleCreatePost = async (content: string) => {
    try {
      const result = await createPost(content).unwrap(); // Use .unwrap() to handle errors
      toast({
        title: "Success",
        description: "Your post has been published successfully",
      });
      trackEvent("post_created");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      await likePost(postId).unwrap();
      trackEvent("post_liked", { postId });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleAddComment = async (postId: number, content: string) => {
    try {
      await addComment({ postId, content }).unwrap();
      toast({
        title: "Success",
        description: "Your comment has been posted successfully",
      });
      trackEvent("comment_added", { postId });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return {
    handleCreatePost,
    handleLikePost,
    handleAddComment,
    isLoading: isCreating || isLiking || isCommenting,
  };
}
