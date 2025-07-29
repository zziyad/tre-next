'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { type CreateRealTimeStatusData, type EventData } from '@/frontend/services/real-time-status.service'
import type { RealTimeStatus } from '@/types'

const formSchema = z.object({
	vehicleCode: z.string().min(1, 'Vehicle code is required'),
	hotelName: z.string().min(1, 'Hotel is required'),
	destination: z.string().min(1, 'Destination is required'),
	status: z.string().min(1, 'Status is required'),
})

interface RealTimeStatusFormProps {
	eventId: number
	eventData: EventData | null
	onSubmit: (data: CreateRealTimeStatusData) => Promise<void>
	onCancel?: () => void
	initialData?: Partial<RealTimeStatus>
	isLoading?: boolean
}

export function RealTimeStatusForm({
	eventId,
	eventData,
	onSubmit,
	onCancel,
	initialData,
	isLoading = false,
}: RealTimeStatusFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			vehicleCode: initialData?.vehicle_code || '',
			hotelName: initialData?.hotel_name || '',
			destination: initialData?.destination || '',
			status: initialData?.status || 'dispatched',
		},
	})

	const handleSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			setIsSubmitting(true)
			await onSubmit({
				eventId,
				vehicleCode: values.vehicleCode,
				hotelName: values.hotelName,
				destination: values.destination,
				status: values.status,
			})
			form.reset()
		} catch (error) {
			console.error('Error submitting form:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!eventData) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-muted-foreground">Loading event data...</div>
			</div>
		)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="vehicleCode"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Vehicle (Flet)</FormLabel>
								{eventData.flets.length > 0 ? (
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a vehicle" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{eventData.flets.map((flet) => (
												<SelectItem key={flet.flet_id} value={flet.name}>
													{flet.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								) : (
									<FormControl>
										<Input placeholder="Enter vehicle name" {...field} />
									</FormControl>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="hotelName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Hotel</FormLabel>
								{eventData.hotels.length > 0 ? (
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a hotel" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{eventData.hotels.map((hotel) => (
												<SelectItem key={hotel.hotel_id} value={hotel.name}>
													{hotel.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								) : (
									<FormControl>
										<Input placeholder="Enter hotel name" {...field} />
									</FormControl>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="destination"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Destination</FormLabel>
								{eventData.destinations.length > 0 ? (
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a destination" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{eventData.destinations.map((destination) => (
												<SelectItem key={destination.destination_id} value={destination.name}>
													{destination.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								) : (
									<FormControl>
										<Input placeholder="Enter destination name" {...field} />
									</FormControl>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Status</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="dispatched">Dispatched</SelectItem>
										<SelectItem value="arrived">Arrived</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>


				</div>

				<div className="flex justify-end space-x-2">
					{onCancel && (
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
					)}
					<Button type="submit" disabled={isSubmitting || isLoading}>
						{isSubmitting ? 'Creating...' : initialData ? 'Update Status' : 'Create Status'}
					</Button>
				</div>
			</form>
		</Form>
	)
} 