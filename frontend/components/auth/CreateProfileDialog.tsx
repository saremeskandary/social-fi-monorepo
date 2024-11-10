import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRegisterUserMutation } from '@/store/api/userManagerApi';

// Form validation schema
const profileSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must not exceed 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface CreateProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateProfileDialog = ({ isOpen, onClose }: CreateProfileDialogProps) => {
    const { toast } = useToast();
    const { principal } = useSelector((state: RootState) => state.auth);
    const [registerUser, { isLoading: isSubmitting }] = useRegisterUserMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    const handleProfileSubmit = async (data: ProfileFormData) => {
        if (!principal) {
            toast({
                title: "Error",
                description: "Not authenticated",
                variant: "destructive",
            });
            return;
        }

        try {
            await registerUser({
                username: data.username,
            }).unwrap();

            toast({
                title: "Success",
                description: "Profile created successfully",
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create profile:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create profile",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Your Profile</DialogTitle>
                    <DialogDescription>
                        Choose a username to get started
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                            <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="username"
                                {...register('username')}
                                placeholder="Enter a username"
                                className="pl-8"
                                disabled={isSubmitting}
                            />
                        </div>
                        {errors.username && (
                            <Alert variant="destructive">
                                <AlertDescription>{errors.username.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Profile...
                            </>
                        ) : (
                            'Create Profile'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateProfileDialog;