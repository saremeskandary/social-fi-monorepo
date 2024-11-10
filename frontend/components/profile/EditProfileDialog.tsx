import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { UserProfile } from "@/types/api";
import AccessibleDialog from "../common/AccessibleDialog";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().max(160, "Bio must not exceed 160 characters").optional(),
  profilePic: z.string().url("Must be a valid URL").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileFormData) => Promise<void>;
}

export function EditProfileDialog({
  profile,
  isOpen,
  onClose,
  onSubmit,
}: EditProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username,
      bio: profile.bio[0],
      profilePic: profile.profilePic[0],
    },
  });

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccessibleDialog
      title="Edit Profile"
      description="Update your profile information"
      open={isOpen}
      onOpenChange={onClose}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <Input id="username" {...register("username")} disabled={isLoading} />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">
            Bio
          </label>
          <Textarea id="bio" {...register("bio")} disabled={isLoading} />
          {errors.bio && (
            <p className="text-sm text-red-500">{errors.bio.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="profilePic" className="text-sm font-medium">
            Profile Picture URL
          </label>
          <Input
            id="profilePic"
            {...register("profilePic")}
            disabled={isLoading}
          />
          {errors.profilePic && (
            <p className="text-sm text-red-500">{errors.profilePic.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </AccessibleDialog>
  );
}
