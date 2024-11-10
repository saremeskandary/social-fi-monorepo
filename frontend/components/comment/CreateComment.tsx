// components/comment/CreateComment.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Spinner } from "../ui/loading-spinner";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment cannot exceed 500 characters"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CreateCommentProps {
  onSubmit: (data: CommentFormData) => Promise<void>;
}

export function CreateComment({ onSubmit }: CreateCommentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const handleFormSubmit = async (data: CommentFormData) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Textarea
          placeholder="Write a comment..."
          {...register("content")}
          disabled={isLoading}
          rows={3}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Spinner size="small" className="mr-2" />}
          Post Comment
        </Button>
      </div>
    </form>
  );
}
