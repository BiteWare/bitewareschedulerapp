"use client";

import * as React from "react";
import { CalendarDays, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-2">
          <CalendarDays className="h-6 w-6" />
          <span className="text-lg font-semibold">BiteSync</span>
        </div>

        <div className="flex-1 flex justify-center">
          {/* Removed navigation buttons */}
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