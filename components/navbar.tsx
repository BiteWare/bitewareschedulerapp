"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Users, Settings, Calendar, FolderKanban, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-2">
          <CalendarDays className="h-6 w-6" />
          <span className="text-lg font-semibold">BiteSync</span>
        </div>

        <div className="flex-1 flex justify-center">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Button
              asChild
              variant="ghost"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/schedule" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Link href="/schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/projects" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Link href="/projects">
                <FolderKanban className="h-4 w-4 mr-2" />
                Projects
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/tasks" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Link href="/tasks">
                <CheckSquare className="h-4 w-4 mr-2" />
                Tasks
              </Link>
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4">
            <Users className="h-5 w-5" />
            <Settings className="h-5 w-5" />
            <ModeToggle />
          </nav>
        </div>
      </div>
    </nav>
  );
}