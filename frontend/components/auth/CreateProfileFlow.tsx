import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetProfileQuery, useRegisterUserMutation } from "@/store/api/userManagerApi";
import { Principal } from "@dfinity/principal";
import { RootState } from "@/store";
import { skipToken } from "@reduxjs/toolkit/query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User } from "lucide-react";

const profileSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must not exceed 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CreateProfileFlow({ children }: { children: React.ReactNode }) {
    const [showDialog, setShowDialog] = useState(false);
    const { toast } = useToast();
    const { principal, isAuthenticated } = useSelector(
        (state: RootState) => state.auth
    );

    const {
        data: profile,
        isLoading: profileLoading,
        error,
        refetch
    } = useGetProfileQuery(
        principal ? Principal.fromText(principal) : skipToken,
        {
            skip: !principal,
            refetchOnMountOrArgChange: true
        }
    );

    // Add the register user mutation
    const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (isAuthenticated && !profileLoading && !profile && !error) {
            setShowDialog(true);
        }
    }, [isAuthenticated, profileLoading, profile, error]);

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

            reset();
            setShowDialog(false);
            refetch(); // Refresh profile data after creation

            toast({
                title: "Success",
                description: "Profile created successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create profile",
                variant: "destructive",
            });
        }
    };

    // If user is not authenticated or has a profile, just render children
    if (!isAuthenticated || profile) {
        return children;
    }

    // While checking profile status, render children (prevents flash)
    if (profileLoading) {
        return children;
    }

    return (
        <>
            {children}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
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
                                    {...register("username")}
                                    placeholder="Enter a username"
                                    className="pl-8"
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
                            disabled={isRegistering}
                        >
                            {isRegistering ? (
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
        </>
    );
}