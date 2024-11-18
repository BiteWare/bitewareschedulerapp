'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UserSchedule } from "@/types/supabase"
import { Commitments } from "@/components/commitments"

interface ScheduleProps {
  schedule: Omit<UserSchedule, "id" | "created_at" | "user_id">;
  scheduleId: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onScheduleChange: (schedule: Partial<Omit<UserSchedule, 'id' | 'created_at' | 'user_id'>>) => void;
}

export function ScheduleAvailability({ schedule, scheduleId, isLoading, onSubmit, onScheduleChange }: ScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability & Commitments</CardTitle>
        <CardDescription>Your working hours and commitments</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label>Timezone</Label>
                <Select
                  value={schedule.timezone}
                  onValueChange={(value) => onScheduleChange({ timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label>Work Hours Start</Label>
                <Input 
                  type="time" 
                  value={schedule.work_hours_start || ''}
                  onChange={(e) => onScheduleChange({ work_hours_start: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label>Work Hours End</Label>
                <Input 
                  type="time" 
                  value={schedule.work_hours_end || ''}
                  onChange={(e) => onScheduleChange({ work_hours_end: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label>Commitments</Label>
              <div className="min-h-[300px] w-full">
                <Commitments 
                  scheduleId={scheduleId}
                />
              </div>
            </div>
          </div>
          <CardFooter className="flex justify-between mt-4 p-0">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              {isLoading ? "Saving..." : "Save Schedule"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
} 