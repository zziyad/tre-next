'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Calendar, FileText, User, Mail, Clock } from 'lucide-react'

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

interface TransportReportFormProps {
  onSubmit?: (data: TransportReportFormData) => void
  isLoading?: boolean
  eventId?: number
}

export function TransportReportForm({ onSubmit, isLoading = false, eventId }: TransportReportFormProps) {
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
		console.log('Transport Report Form Data:', JSON.stringify(values, null, 2))
		
		try {
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

			if (onSubmit) {
				await onSubmit(values)
			}
		} catch (error) {
			console.error('Error submitting transport report:', error)
			throw error
		}
	}

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Transport Report</h1>
        <p className="text-muted-foreground">
          Complete your weekly transport report with detailed information about your activities
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Provide your personal details and report timing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
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
                      <FormLabel>Surname</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email address" {...field} />
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
                        <Clock className="h-4 w-4" />
                        Date and Time
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Report Sections */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tasks/Projects Completed This Week
                </CardTitle>
                <CardDescription>
                  Describe the tasks and projects you completed during this reporting period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="tasksCompleted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasks Completed</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter details about tasks completed this week, including project names, milestones achieved, and any significant accomplishments..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Key Meetings Attended
                </CardTitle>
                <CardDescription>
                  List important meetings, discussions, and collaborative sessions you participated in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="meetingsAttended"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meetings Attended</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter details about key meetings attended, including meeting topics, participants, decisions made, and action items..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Issues Encountered & Actions Taken
                </CardTitle>
                <CardDescription>
                  Document any challenges, problems, or issues you faced and how you addressed them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="issuesEncountered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issues & Actions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter details about issues encountered, problems solved, challenges faced, and the actions you took to resolve them..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Pending/Upcoming Tasks
                </CardTitle>
                <CardDescription>
                  Outline tasks that are still pending or scheduled for the upcoming period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="pendingTasks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pending Tasks</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter details about pending tasks, upcoming deadlines, scheduled work, and tasks that need to be carried forward..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Support Needed / Notes
                </CardTitle>
                <CardDescription>
                  Specify any support, resources, or assistance you need, plus any additional notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="supportNeeded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support & Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter details about support needed, resources required, additional notes, suggestions, or any other relevant information..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg"
              disabled={isLoading}
              className="min-w-[200px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Submit Report
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 