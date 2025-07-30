'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { frontendEventService } from '@/frontend/services/event.service';

const formSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().optional(),
  flets: z.array(z.object({
    name: z.string().min(1, 'Fleet marker name is required'),
    description: z.string().optional(),
  })),
  hotels: z.array(z.object({
    name: z.string().min(1, 'Hotel name is required'),
    description: z.string().optional(),
  })),
  destinations: z.array(z.object({
    name: z.string().min(1, 'Destination name is required'),
    description: z.string().optional(),
  })),
});

interface CreateEventModalProps {
  onEventCreated: () => void;
}

const STEPS = [
  { id: 1, title: 'Event Details', description: 'Basic event information' },
  { id: 2, title: 'Fleet Markers', description: 'Add transport markers' },
  { id: 3, title: 'Hotels', description: 'Add hotel information' },
  { id: 4, title: 'Destinations', description: 'Add destination points' },
  { id: 5, title: 'Review', description: 'Review and create event' },
];

export default function CreateEventModal({ onEventCreated }: CreateEventModalProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
      description: '',
      flets: [],
      hotels: [],
      destinations: [],
    },
  });

  const fletsArray = useFieldArray({
    control: form.control,
    name: 'flets',
  });

  const hotelsArray = useFieldArray({
    control: form.control,
    name: 'hotels',
  });

  const destinationsArray = useFieldArray({
    control: form.control,
    name: 'destinations',
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await frontendEventService.createEvent(values);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create event');
      }

      toast.success('Event created successfully!');
      setOpen(false);
      form.reset();
      setCurrentStep(1);
      onEventCreated();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter event description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Fleet Markers</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fletsArray.append({ name: '', description: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Fleet Marker
              </Button>
            </div>
            {fletsArray.fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`flets.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fleet Marker Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter fleet marker name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`flets.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fletsArray.remove(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {fletsArray.fields.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No fleet markers added yet. Click &quot;Add Fleet Marker&quot; to get started.
              </p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Hotels</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => hotelsArray.append({ name: '', description: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Hotel
              </Button>
            </div>
            {hotelsArray.fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`hotels.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hotel Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter hotel name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`hotels.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => hotelsArray.remove(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {hotelsArray.fields.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No hotels added yet. Click &quot;Add Hotel&quot; to get started.
              </p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Destinations</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => destinationsArray.append({ name: '', description: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Destination
              </Button>
            </div>
            {destinationsArray.fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`destinations.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter destination name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`destinations.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => destinationsArray.remove(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {destinationsArray.fields.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No destinations added yet. Click &quot;Add Destination&quot; to get started.
              </p>
            )}
          </div>
        );

      case 5:
        const values = form.getValues();
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review Event Details</h3>
            <Card>
              <CardHeader>
                <CardTitle>{values.name}</CardTitle>
                {values.description && <CardDescription>{values.description}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                {(values.start_date || values.end_date) && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {values.start_date && new Date(values.start_date).toLocaleDateString()}
                      {values.start_date && values.end_date && ' - '}
                      {values.end_date && new Date(values.end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Fleet Markers</h4>
                    <div className="space-y-1">
                      {values.flets.map((flet, index) => (
                        <Badge key={index} variant="secondary">{flet.name}</Badge>
                      ))}
                      {values.flets.length === 0 && (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Hotels</h4>
                    <div className="space-y-1">
                      {values.hotels.map((hotel, index) => (
                        <Badge key={index} variant="secondary">{hotel.name}</Badge>
                      ))}
                      {values.hotels.length === 0 && (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Destinations</h4>
                    <div className="space-y-1">
                      {values.destinations.map((destination, index) => (
                        <Badge key={index} variant="secondary">{destination.name}</Badge>
                      ))}
                      {values.destinations.length === 0 && (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-2 sm:px-0">
          <DialogTitle className="text-lg sm:text-xl">Create New Event</DialogTitle>
          <DialogDescription className="text-sm">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    step.id === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.id < currentStep
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.id}
                </div>
                {step.id < STEPS.length && (
                  <div
                    className={`w-4 sm:w-8 h-px mx-1 sm:mx-2 ${
                      step.id < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {renderStepContent()}

            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < STEPS.length ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 