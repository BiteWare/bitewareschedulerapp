"use client";

import * as React from "react";
import { User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import BiteSyncLogo from "@/app/assets/bitesynclogo.png";
import { supabase } from "@/utils/supabaseclient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    };
    getUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      router.push("/auth");
      router.refresh();
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center w-full">
        <div className="flex items-center space-x-2 px-4">
          <Image 
            src={BiteSyncLogo} 
            alt="BiteSync Logo" 
            width={32} 
            height={32}
          />
          <span className="text-lg font-semibold">BiteSync</span>
        </div>

        <div className="flex-1">
          {/* Removed navigation buttons */}
        </div>
        
        <div className="flex items-center space-x-4 pr-4">
          {userEmail && (
            <span className="text-sm text-muted-foreground">
              {userEmail}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <User className="h-5 w-5 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/50"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Settings className="h-5 w-5" />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}