"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Home, Search, PlusSquare, User, LogIn } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

const BottomTabs = () => {
  const { login } = useAuth();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userProfile = useSelector((state: RootState) => state.user.profile);

  const tabs = [
    { icon: Home, label: "Home", path: "/feed" },
    { icon: Search, label: "Explore", path: "/explore" },
    { icon: PlusSquare, label: "Create", path: "/feed" },
    {
      icon: User,
      label: "Profile",
      path: userProfile ? `/profile/${userProfile.id.toString()}` : "/profile",
    },
  ];
  console.log("user profile");


  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t h-16 flex items-center justify-center">
        <button
          onClick={() => login()}
          className="flex items-center space-x-2 text-primary px-4 py-2 rounded-md"
        >
          <LogIn className="w-5 h-5" />
          <span>Login to continue</span>
        </button>
      </div>
    );
  }

  return (
    <footer>
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t h-16">
        <div className="flex justify-around items-center h-full px-4">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.path}
              className="flex flex-col items-center justify-center w-16 h-full text-muted-foreground hover:text-primary transition-colors"
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </footer>
  );
};

export default BottomTabs;
