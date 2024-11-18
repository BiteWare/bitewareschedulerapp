'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash, X, Check } from 'lucide-react'
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

export function Commitments({ scheduleId }: CommitmentsProps) {
  const { session } = useSupabase()
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCommitment, setNewCommitment] = useState<{
    type: 'Holidays' | 'Appointments' | 'Meetings';
    title: string;
    start_date: string;
    end_date: string;
  }>({
    type: 'Holidays',
    title: '',
    start_date: '',
    end_date: ''
  })

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
          title: newCommitment.title || null,
          start_date: newCommitment.start_date || null,
          end_date: newCommitment.end_date || null
        }])
        .select()
        .single()

      if (error) throw error

      setCommitments(prev => [data, ...prev])
      setNewCommitment({ type: 'Holidays', title: '', start_date: '', end_date: '' })
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
        start_date: commitmentToEdit.start_date || '',
        end_date: commitmentToEdit.end_date || ''
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
          title: newCommitment.title || null,
          start_date: newCommitment.start_date || null,
          end_date: newCommitment.end_date || null
        })
        .eq('id', id)

      if (error) throw error

      setCommitments(prev => prev.map(c => 
        c.id === id 
          ? { ...c, ...newCommitment }
          : c
      ))
      setEditingId(null)
      setNewCommitment({ type: 'Holidays', title: '', start_date: '', end_date: '' })
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
      start_date: '',
      end_date: ''
    });
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
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
              <SelectTrigger id="commitment-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Holidays">Holidays</SelectItem>
                <SelectItem value="Appointments">Appointments</SelectItem>
                <SelectItem value="Meetings">Meetings</SelectItem>
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
            <Input
              id="commitment-start"
              type="date"
              value={newCommitment.start_date}
              onChange={(e) => setNewCommitment({ ...newCommitment, start_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="commitment-stop">End Date</Label>
            <Input
              id="commitment-stop"
              type="date"
              value={newCommitment.end_date}
              onChange={(e) => setNewCommitment({ ...newCommitment, end_date: e.target.value })}
            />
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
            <TableHead>Title</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>Stop</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commitments.map((commitment) => (
            <TableRow key={commitment.id}>
              <TableCell>
                {editingId === commitment.id ? (
                  <Select
                    value={newCommitment.type}
                    onValueChange={(value: 'Holidays' | 'Appointments' | 'Meetings') => setNewCommitment({ ...newCommitment, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Holidays">Holidays</SelectItem>
                      <SelectItem value="Appointments">Appointments</SelectItem>
                      <SelectItem value="Meetings">Meetings</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  commitment.type
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
                  <Input
                    type="date"
                    value={newCommitment.start_date}
                    onChange={(e) => setNewCommitment({ ...newCommitment, start_date: e.target.value })}
                  />
                ) : (
                  commitment.start_date ? format(new Date(commitment.start_date), 'yyyy-MM-dd') : '-'
                )}
              </TableCell>
              <TableCell>
                {editingId === commitment.id ? (
                  <Input
                    type="date"
                    value={newCommitment.end_date}
                    onChange={(e) => setNewCommitment({ ...newCommitment, end_date: e.target.value })}
                  />
                ) : (
                  commitment.end_date ? format(new Date(commitment.end_date), 'yyyy-MM-dd') : '-'
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