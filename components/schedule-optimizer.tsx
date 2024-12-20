"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Schedule optimization component
export default function ScheduleOptimizer() {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      // Here we'll integrate with OpenAI API
      toast({
        title: "Schedule Optimization",
        description: "Optimizing schedule based on team availability and project tasks...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to optimize schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Schedule Optimization</h2>
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Optimize Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Use AI to optimize your project schedule
              </p>
            </div>
            <Button onClick={handleOptimize} disabled={isOptimizing}>
              <Wand2 className="mr-2 h-4 w-4" />
              {isOptimizing ? "Optimizing..." : "Optimize"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Optimized Schedule Preview</h3>
          <div className="rounded-lg border">
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              Click "Optimize" to generate an AI-powered schedule recommendation
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}