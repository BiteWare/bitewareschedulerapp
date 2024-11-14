"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ProjectTasks() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Tasks</CardTitle>
            <CardDescription>High-level task breakdown and scheduling</CardDescription>
          </div>
          <Button size="sm" className="ml-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Task List */}
          <div className="grid gap-4">
            {/* Example Task Group */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Planning Phase</CardTitle>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Current Phase</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Individual Task */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Requirements Gathering</h4>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">4-6 hours</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm">Required Participants</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Product Manager</span>
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Tech Lead</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Dependencies</Label>
                        <div className="text-sm text-gray-600">None</div>
                      </div>
                    </div>
                  </div>

                  {/* Another Task */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Technical Design Review</h4>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">2-3 hours</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm">Required Participants</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Tech Lead</span>
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Senior Developer</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Dependencies</Label>
                        <div className="text-sm text-gray-600">Requirements Gathering</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}