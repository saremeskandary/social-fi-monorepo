// components/layout/Navbar.tsx
import { useAuth } from "@/providers/AuthProvider";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Link from "next/link";
import { Button } from "../ui/button";
import { LogIn, LogOut, User } from "lucide-react";

export function Navbar() {
  const { login, logout } = useAuth();
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const userProfile = useSelector((state: RootState) => state.user.profile);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">Social Media DApp</span>
          </Link>
          {isAuthenticated && (
            <div className="flex gap-6">
              <Link href="/feed" className="hover:text-foreground/80">
                Feed
              </Link>
              <Link href="/explore" className="hover:text-foreground/80">
                Explore
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href={`/profile/${userProfile?.id.toString()}`}>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button onClick={() => logout()} disabled={isLoading}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => login()} disabled={isLoading}>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
