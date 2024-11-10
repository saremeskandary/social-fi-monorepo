import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Loader2, PlusSquare } from "lucide-react";
import { useCreatePostMutation } from "@/store/api/socialMediaApi";
import { toast } from "@/hooks/use-toast";

const postSchema = z.object({
  content: z
    .string()
    .min(1, "Post cannot be empty")
    .max(280, "Post cannot exceed 280 characters"),
});

type PostFormData = z.infer<typeof postSchema>;

interface CreatePostProps {
  onSubmit: (data: PostFormData) => Promise<void>;
}

export default function CreatePost({ onSubmit }: CreatePostProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
    },
  });

  const content = useWatch({
    control,
    name: "content",
    defaultValue: "",
  });

  const [createPost, { isLoading, error }] = useCreatePostMutation();

  const handleFormSubmit = async (data: PostFormData) => {
    try {
      await createPost(data.content).unwrap();
      reset();
      toast({
        title: "Success",
        description: "Your post has been published successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
      if (error instanceof Error) {
        console.error("Error creating post:", error.message);
      } else {
        console.error("Unknown error creating post:", error);
      }
    }
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="pt-6">
          <Textarea
            placeholder="What's on your mind?"
            {...register("content")}
            disabled={isLoading}
            className="min-h-32 resize-none"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-500">
              {errors.content.message}
            </p>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-500">
              An error occurred while creating your post
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {280 - (content?.length || 0)} characters remaining
          </p>
          <span className="flex gap-2">
            <Button
              type="button"
              onClick={() => reset()}
              variant="outline"
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  Post
                  <PlusSquare className="h-4 w-4" />
                </>
              )}
            </Button>
          </span>
        </CardFooter>
      </form>
    </Card>
  );
}
