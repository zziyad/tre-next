'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Calendar, FileText, User, Mail, Clock, Plus } from 'lucide-react'
import { toast } from 'sonner'

const transportReportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  surname: z.string().min(1, 'Surname is required'),
  email: z.string().email('Please enter a valid email address'),
  dateTime: z.string().min(1, 'Date and time is required'),
  tasksCompleted: z.string().min(1, 'Please provide details about tasks completed'),
  meetingsAttended: z.string().min(1, 'Please provide details about meetings attended'),
  issuesEncountered: z.string().min(1, 'Please provide details about issues encountered'),
  pendingTasks: z.string().min(1, 'Please provide details about pending tasks'),
  supportNeeded: z.string().min(1, 'Please provide details about support needed')
})

type TransportReportFormData = z.infer<typeof transportReportSchema>

interface CreateTransportReportModalProps {
  eventId: number
  onSuccess?: () => void
  hasWritePermission?: boolean
}

export function CreateTransportReportModal({ eventId, onSuccess, hasWritePermission = false }: CreateTransportReportModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<TransportReportFormData>({
    resolver: zodResolver(transportReportSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      dateTime: '',
      tasksCompleted: '',
      meetingsAttended: '',
      issuesEncountered: '',
      pendingTasks: '',
      supportNeeded: ''
    }
  })

  const handleSubmit = async (values: TransportReportFormData) => {
    if (!hasWritePermission) {
      toast.error('You do not have permission to create transport reports')
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/transport-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          eventId: eventId,
          reportDate: values.dateTime,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit transport report')
      }

      toast.success('Transport report submitted successfully!')
      form.reset()
      setIsOpen(false)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error submitting transport report:', error)
      toast.error('Failed to submit transport report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      form.reset()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {hasWritePermission && (
        <>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create Transport Report
          </DialogTitle>
          <DialogDescription>
            Complete your transport report with detailed information about your activities and observations
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Report Date & Time *
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Activities Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activities & Observations
              </h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="tasksCompleted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasks Completed *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the tasks you completed today..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meetingsAttended"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meetings Attended *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List the meetings you attended..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="issuesEncountered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issues Encountered *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe any issues or challenges you faced..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pendingTasks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pending Tasks *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List tasks that are still pending..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supportNeeded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support Notes *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe any support or resources you need..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
        </>
      )}
    </Dialog>
  )
} 