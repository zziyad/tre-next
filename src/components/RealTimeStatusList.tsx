'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RealTimeStatusForm } from './RealTimeStatusForm'
import { useRealTimeStatus } from '@/frontend/hooks/useRealTimeStatus'
import type { CreateRealTimeStatusData } from '@/frontend/services/real-time-status.service'
import { format } from 'date-fns'
import { Plus, Clock, Car, Building, MapPin, User, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { RealTimeStatus } from '@/types'

interface RealTimeStatusListProps {
	eventId: number
	hasWritePermission?: boolean
	hasDeletePermission?: boolean
}

export function RealTimeStatusList({ eventId, hasWritePermission = false, hasDeletePermission = false }: RealTimeStatusListProps) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [editingStatus, setEditingStatus] = useState<RealTimeStatus | null>(null)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	
	const { statuses = [], eventData, isLoading, error, createStatus, updateStatus, deleteStatus } = useRealTimeStatus(eventId)

	const handleCreateStatus = async (data: CreateRealTimeStatusData) => {
		if (!hasWritePermission) {
			toast.error('You do not have permission to create status entries')
			return
		}
		
		try {
			await createStatus(data)
			setIsCreateDialogOpen(false)
			toast.success('Status created successfully')
		} catch (error) {
			console.error('Error creating status:', error)
			toast.error('Failed to create status')
		}
	}

	const handleUpdateStatus = async (data: CreateRealTimeStatusData) => {
		if (!hasWritePermission) {
			toast.error('You do not have permission to update status entries')
			return
		}
		
		if (!editingStatus) return
		
		try {
			await updateStatus(editingStatus.status_id, data)
			setIsEditDialogOpen(false)
			setEditingStatus(null)
			toast.success('Status updated successfully')
		} catch (error) {
			console.error('Error updating status:', error)
			toast.error('Failed to update status')
		}
	}

	const handleDeleteStatus = async (statusId: number) => {
		if (!hasDeletePermission) {
			toast.error('You do not have permission to delete status entries')
			return
		}
		
		if (!confirm('Are you sure you want to delete this status?')) return
		
		try {
			await deleteStatus(statusId)
			toast.success('Status deleted successfully')
		} catch (error) {
			console.error('Error deleting status:', error)
			toast.error('Failed to delete status')
		}
	}

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'dispatched':
				return 'bg-green-100 text-green-800 border-green-200'
			case 'arrived':
				return 'bg-red-100 text-red-800 border-red-200'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200'
		}
	}

	const getStatusCircleColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'dispatched':
				return 'bg-green-500'
			case 'arrived':
				return 'bg-red-500'
			default:
				return 'bg-gray-500'
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-muted-foreground">Loading statuses...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-destructive">Error: {error}</div>
			</div>
		)
	}

	// Ensure statuses is always an array
	const safeStatuses = Array.isArray(statuses) ? statuses : []

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground">Real-Time Status</h2>
					<p className="text-muted-foreground">
						Track vehicle status and guest movements in real-time
					</p>
				</div>
				{hasWritePermission && (
					<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="w-4 h-4 mr-2" />
								New Status
							</Button>
						</DialogTrigger>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Create New Status</DialogTitle>
							<DialogDescription>
								Add a new real-time status entry for vehicle tracking.
							</DialogDescription>
						</DialogHeader>
						<RealTimeStatusForm
							eventId={eventId}
							eventData={eventData}
							onSubmit={handleCreateStatus}
						/>
					</DialogContent>
					</Dialog>
				)}
			</div>

			{safeStatuses.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Clock className="w-12 h-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold text-foreground mb-2">
							No Status Entries
						</h3>
						<p className="text-muted-foreground text-center mb-4">
							No real-time status entries have been created yet.
						</p>
						{hasWritePermission && (
							<Button onClick={() => setIsCreateDialogOpen(true)}>
								<Plus className="w-4 h-4 mr-2" />
								Create First Status
							</Button>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{safeStatuses.map((status) => {
						// Skip invalid status objects
						if (!status || typeof status !== 'object') {
							return null
						}
						
						return (
						<Card key={status.status_id} className="relative">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div className={`w-4 h-4 rounded-full ${getStatusCircleColor(status.status)}`} />
										<div>
											<CardTitle className="text-lg flex items-center space-x-2">
												<Car className="w-4 h-4" />
												<span>{status.vehicle_code}</span>
											</CardTitle>
											<CardDescription>
												Last updated: {format(new Date(status.updated_at), 'MMM dd, yyyy HH:mm')}
											</CardDescription>
										</div>
									</div>
									<Badge className={getStatusColor(status.status)}>
										{status.status.charAt(0).toUpperCase() + status.status.slice(1)}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="flex items-center space-x-2">
										<Building className="w-4 h-4 text-muted-foreground" />
										<span className="font-medium">{status.hotel_name}</span>
									</div>
									<div className="flex items-center space-x-2">
										<MapPin className="w-4 h-4 text-muted-foreground" />
										<span className="font-medium">{status.destination}</span>
									</div>
									{status.guest_name && (
										<div className="flex items-center space-x-2">
											<User className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">{status.guest_name}</span>
										</div>
									)}
								</div>
								
								{(hasWritePermission || hasDeletePermission) && (
									<div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
										{hasWritePermission && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setEditingStatus(status)
													setIsEditDialogOpen(true)
												}}
											>
												<Edit className="w-4 h-4 mr-2" />
												Edit
											</Button>
										)}
										{hasDeletePermission && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDeleteStatus(status.status_id)}
											>
												<Trash2 className="w-4 h-4 mr-2" />
												Delete
											</Button>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					)})}
				</div>
			)}

			{editingStatus && hasWritePermission && (
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Edit Status</DialogTitle>
							<DialogDescription>
								Update the real-time status entry.
							</DialogDescription>
						</DialogHeader>
						<RealTimeStatusForm
							eventId={eventId}
							eventData={eventData}
							onSubmit={handleUpdateStatus}
							initialData={editingStatus}
						/>
					</DialogContent>
				</Dialog>
			)}
		</div>
	)
} 