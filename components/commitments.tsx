'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash, X, Check, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/utils/supabaseclient"
import { toast } from "sonner"
import { Commitment } from "@/types/supabase"
import { useSupabase } from '@/components/supabase-provider'

interface CommitmentsProps {
  scheduleId: string;
}

interface CommitmentType {
  type: 'Holidays' | 'Appointments' | 'Meetings';
  title: string;
  flexibility: 'Firm' | 'Flexible';
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
}

export function Commitments({ scheduleId }: CommitmentsProps) {
  const { session } = useSupabase()
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCommitment, setNewCommitment] = useState<CommitmentType>({
    type: 'Holidays',
    title: '',
    flexibility: 'Firm',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: ''
  })
  const [showStartTime, setShowStartTime] = useState(false)
  const [showEndTime, setShowEndTime] = useState(false)

  // Load commitments from Supabase
  useEffect(() => {
    const loadCommitments = async () => {
      const { data, error } = await supabase
        .from('commitments')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to load commitments')
        return
      }

      setCommitments(data)
    }

    if (scheduleId) {
      loadCommitments()
    }
  }, [scheduleId])

  const handleAddCommitment = async () => {
    if (!scheduleId || !newCommitment.type) return

    try {
      const { data, error } = await supabase
        .from('commitments')
        .insert([{
          schedule_id: scheduleId,
          type: newCommitment.type,
          flexibility: newCommitment.flexibility,
          title: newCommitment.title || null,
          start_date: newCommitment.start_date || null,
          start_time: newCommitment.start_time || null,
          end_date: newCommitment.end_date || null,
          end_time: newCommitment.end_time || null
        }])
        .select()
        .single()

      if (error) throw error

      setCommitments(prev => [data, ...prev])
      setNewCommitment({ 
        type: 'Holidays', 
        title: '', 
        flexibility: 'Firm',
        start_date: '', 
        start_time: '', 
        end_date: '', 
        end_time: '' 
      })
      toast.success('Commitment added successfully')
    } catch (error) {
      console.error('Error adding commitment:', error)
      toast.error('Failed to add commitment')
    }
  }

  const handleEditCommitment = (id: string) => {
    const commitmentToEdit = commitments.find(c => c.id === id)
    if (commitmentToEdit) {
      setNewCommitment({
        type: commitmentToEdit.type,
        title: commitmentToEdit.title || '',
        flexibility: commitmentToEdit.flexibility || 'Firm',
        start_date: commitmentToEdit.start_date || '',
        start_time: commitmentToEdit.start_time || '',
        end_date: commitmentToEdit.end_date || '',
        end_time: commitmentToEdit.end_time || ''
      })
      setEditingId(id)
    }
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('commitments')
        .update({
          type: newCommitment.type,
          flexibility: newCommitment.flexibility,
          title: newCommitment.title || null,
          start_date: newCommitment.start_date || null,
          start_time: newCommitment.start_time || null,
          end_date: newCommitment.end_date || null,
          end_time: newCommitment.end_time || null
        })
        .eq('id', id)

      if (error) throw error

      setCommitments(prev => prev.map(c => 
        c.id === id 
          ? { ...c, ...newCommitment }
          : c
      ))
      setEditingId(null)
      setNewCommitment({ type: 'Holidays', title: '', flexibility: 'Firm', start_date: '', start_time: '', end_date: '', end_time: '' })
      toast.success('Commitment updated successfully')
    } catch (error) {
      console.error('Error updating commitment:', error)
      toast.error('Failed to update commitment')
    }
  }

  const handleDeleteCommitment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('commitments')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCommitments(prev => prev.filter(c => c.id !== id))
      toast.success('Commitment deleted successfully')
    } catch (error) {
      console.error('Error deleting commitment:', error)
      toast.error('Failed to delete commitment')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewCommitment({
      type: 'Holidays',
      title: '',
      flexibility: 'Firm',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: ''
    });
  }

  // Add this useEffect to handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStartTime || showEndTime) {
        const target = event.target as HTMLElement;
        if (!target.closest('.time-input-container')) {
          setShowStartTime(false);
          setShowEndTime(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStartTime, showEndTime]);

  const getFlexibilityColor = (flexibility: 'Firm' | 'Flexible') => {
    return flexibility === 'Firm' ? 'bg-orange-100' : 'bg-blue-100'
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="commitment-type">Type</Label>
            <Select
              value={newCommitment.type}
              onValueChange={(value: 'Holidays' | 'Appointments' | 'Meetings') => {
                setNewCommitment({ 
                  ...newCommitment,
                  type: value,
                });
              }}
            >
              <SelectTrigger id="commitment-type" className="h-10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Holidays">Holidays</SelectItem>
                <SelectItem value="Appointments">Appointments</SelectItem>
                <SelectItem value="Meetings">Meetings</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="commitment-flexibility">Flexibility</Label>
            <Select
              value={newCommitment.flexibility}
              onValueChange={(value: 'Firm' | 'Flexible') => {
                setNewCommitment({ 
                  ...newCommitment,
                  flexibility: value,
                });
              }}
            >
              <SelectTrigger id="commitment-flexibility" className="h-10">
                <SelectValue placeholder="Select flexibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Firm">Firm</SelectItem>
                <SelectItem value="Flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="commitment-title">Title</Label>
            <Input
              id="commitment-title"
              placeholder="Title"
              value={newCommitment.title}
              onChange={(e) => setNewCommitment({ ...newCommitment, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="commitment-start">Start Date</Label>
            <div className="flex gap-2">
              <Input
                id="commitment-start"
                type="date"
                value={newCommitment.start_date}
                onChange={(e) => setNewCommitment({ ...newCommitment, start_date: e.target.value })}
              />
              <div className="relative time-input-container">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => setShowStartTime(!showStartTime)}
                  className="h-10 w-10"
                >
                  <Clock className="h-4 w-4" />
                </Button>
                {showStartTime && (
                  <div className="absolute right-0 top-[calc(100%+4px)] z-50 bg-background border rounded-md shadow-md">
                    <Input
                      type="time"
                      value={newCommitment.start_time}
                      onChange={(e) => setNewCommitment({ ...newCommitment, start_time: e.target.value })}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="commitment-stop">End Date</Label>
            <div className="flex gap-2">
              <Input
                id="commitment-stop"
                type="date"
                value={newCommitment.end_date}
                onChange={(e) => setNewCommitment({ ...newCommitment, end_date: e.target.value })}
              />
              <div className="relative time-input-container">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => setShowEndTime(!showEndTime)}
                  className="h-10 w-10"
                >
                  <Clock className="h-4 w-4" />
                </Button>
                {showEndTime && (
                  <div className="absolute right-0 top-[calc(100%+4px)] z-50 bg-background border rounded-md shadow-md">
                    <Input
                      type="time"
                      value={newCommitment.end_time}
                      onChange={(e) => setNewCommitment({ ...newCommitment, end_time: e.target.value })}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-end">
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleAddCommitment();
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Flexibility</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>Stop</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commitments.map((commitment) => (
            <TableRow key={commitment.id}>
              <TableCell>{commitment.type}</TableCell>
              <TableCell>
                {editingId === commitment.id ? (
                  <Select
                    value={newCommitment.flexibility}
                    onValueChange={(value: 'Firm' | 'Flexible') => 
                      setNewCommitment({ ...newCommitment, flexibility: value })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Firm">Firm</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={`px-2 py-1 rounded-md ${getFlexibilityColor(commitment.flexibility)}`}>
                    {commitment.flexibility}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {editingId === commitment.id ? (
                  <Input
                    value={newCommitment.title}
                    onChange={(e) => setNewCommitment({ ...newCommitment, title: e.target.value })}
                  />
                ) : (
                  commitment.title
                )}
              </TableCell>
              <TableCell>
                {editingId === commitment.id ? (
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={newCommitment.start_date}
                      onChange={(e) => setNewCommitment({ ...newCommitment, start_date: e.target.value })}
                    />
                    <div className="relative time-input-container">
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => setShowStartTime(!showStartTime)}
                        className="h-10 w-10"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      {showStartTime && (
                        <div className="absolute right-0 top-[calc(100%+4px)] z-50 bg-background border rounded-md shadow-md">
                          <Input
                            type="time"
                            value={newCommitment.start_time}
                            onChange={(e) => setNewCommitment({ ...newCommitment, start_time: e.target.value })}
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {commitment.start_date ? 
                      `${format(new Date(commitment.start_date), 'yyyy-MM-dd')}${commitment.start_time ? ' ' + commitment.start_time : ''}` 
                      : '-'}
                  </>
                )}
              </TableCell>
              <TableCell>
                {editingId === commitment.id ? (
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={newCommitment.end_date}
                      onChange={(e) => setNewCommitment({ ...newCommitment, end_date: e.target.value })}
                    />
                    <div className="relative time-input-container">
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => setShowEndTime(!showEndTime)}
                        className="h-10 w-10"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      {showEndTime && (
                        <div className="absolute right-0 top-[calc(100%+4px)] z-50 bg-background border rounded-md shadow-md">
                          <Input
                            type="time"
                            value={newCommitment.end_time}
                            onChange={(e) => setNewCommitment({ ...newCommitment, end_time: e.target.value })}
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {commitment.end_date ? 
                      `${format(new Date(commitment.end_date), 'yyyy-MM-dd')}${commitment.end_time ? ' ' + commitment.end_time : ''}` 
                      : '-'}
                    </>
                )}
              </TableCell>
              <TableCell>
                {editingId === commitment.id ? (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSaveEdit(commitment.id);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancelEdit();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEditCommitment(commitment.id);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteCommitment(commitment.id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}