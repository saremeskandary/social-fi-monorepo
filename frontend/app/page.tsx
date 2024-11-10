// ./app/page.tsx
"use client";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { LogIn } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto mt-16">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Social Media DApp
          </h1>
          <p className="text-muted-foreground mb-8">
            {isAuthenticated
              ? "Welcome back! Connect, share, and interact on our decentralized platform."
              : "Connect, share, and interact on our decentralized platform. Log in to get started."}
          </p>
          {!isAuthenticated && (
            <Button onClick={() => login()} disabled={isLoading}>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </section>

        {isAuthenticated && (
          <section className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent>
                <CardTitle>Explore</CardTitle>
                <CardDescription>
                  Discover new people and trending posts.
                </CardDescription>
                <Link href="/explore">
                  <Button variant="outline" className="mt-4 w-full">
                    Explore Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  Manage your profile and settings.
                </CardDescription>
                <Link href="/profile">
                  <Button variant="outline" className="mt-4 w-full">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <CardTitle>Create a Post</CardTitle>
                <CardDescription>
                  Share your thoughts and experiences.
                </CardDescription>
                <Link href="/feed">
                  <Button variant="outline" className="mt-4 w-full">
                    Create Post
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
