'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import type { CreateTransportReportData } from '@/frontend/services/transport-report.service'

// Zod schema for form validation
const reportFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Please enter a valid email address'),
	reportDate: z.string().min(1, 'Date and time is required'),
	tasksCompleted: z.string().optional(),
	meetingsAttended: z.string().optional(),
	issuesEncountered: z.string().optional(),
	pendingTasks: z.string().optional(),
	supportNotes: z.string().optional(),
})

type ReportFormData = z.infer<typeof reportFormSchema>

interface ReportFormProps {
	eventId: number
	userId: number
	onSubmit?: (data: CreateTransportReportData) => Promise<void>
}

export function ReportForm({ eventId, userId, onSubmit }: ReportFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<ReportFormData>({
		resolver: zodResolver(reportFormSchema),
		defaultValues: {
			name: '',
			email: '',
			reportDate: '',
			tasksCompleted: '',
			meetingsAttended: '',
			issuesEncountered: '',
			pendingTasks: '',
			supportNotes: '',
		},
	})

	const handleSubmit = async (data: ReportFormData) => {
		setIsSubmitting(true)
		try {
			// Convert the datetime string to ISO format
			const reportDate = new Date(data.reportDate).toISOString()

			// Call the onSubmit callback with the complete data
			await onSubmit?.({
				name: data.name,
				email: data.email,
				reportDate,
				tasksCompleted: data.tasksCompleted,
				meetingsAttended: data.meetingsAttended,
				issuesEncountered: data.issuesEncountered,
				pendingTasks: data.pendingTasks,
				supportNotes: data.supportNotes,
				eventId,
				userId,
			})

			toast.success('Transport report submitted successfully!')
			form.reset()
		} catch (error) {
			console.error('Error submitting report:', error)
			toast.error('Failed to submit report. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle>Transport Report</CardTitle>
				<CardDescription>
					Please fill out this form to submit your weekly transport report.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
						{/* Basic Info Section */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-foreground">
								Basic Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name & Surname</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter your full name"
													{...field}
												/>
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
											<FormLabel>Email Address</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="Enter your email address"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name="reportDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Date and Time</FormLabel>
										<FormControl>
											<Input
												type="datetime-local"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Report Sections */}
						<div className="space-y-6">
							<h3 className="text-lg font-semibold text-foreground">
								Report Details
							</h3>
							
							<FormField
								control={form.control}
								name="tasksCompleted"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tasks/Projects Completed This Week</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter details about tasks completed this week..."
												className="min-h-[120px]"
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
										<FormLabel>Key Meetings Attended</FormLabel>
										<FormControl>
											<Textarea
												placeholder="List the key meetings you attended this week..."
												className="min-h-[120px]"
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
										<FormLabel>Issues Encountered & Actions Taken</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe any issues you encountered and the actions you took to resolve them..."
												className="min-h-[120px]"
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
										<FormLabel>Pending/Upcoming Tasks</FormLabel>
										<FormControl>
											<Textarea
												placeholder="List any pending or upcoming tasks..."
												className="min-h-[120px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="supportNotes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Support Needed / Notes</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Any additional notes or support needed..."
												className="min-h-[120px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Submit Button */}
						<div className="flex justify-end pt-4">
							<Button
								type="submit"
								disabled={isSubmitting}
								className="min-w-[120px]"
							>
								{isSubmitting ? 'Submitting...' : 'Submit Report'}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
} 