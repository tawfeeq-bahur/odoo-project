
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Vehicle } from '@/lib/types';
import { format } from 'date-fns';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Vehicle name must be at least 2 characters.' }),
  plateNumber: z.string().min(3, { message: 'Plate number is required.' }),
  model: z.string().min(2, { message: 'Model is required.' }),
  status: z.enum(['Idle', 'On Trip', 'Maintenance']),
  fuelLevel: z.coerce.number().min(0).max(100, { message: 'Fuel level must be between 0 and 100.' }),
  lastMaintenance: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  assignedTo: z.enum(['employee', 'none']).optional(),
});

type AddVehicleDialogProps = {
  children: React.ReactNode;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
};

export function AddVehicleDialog({ children, onAddVehicle }: AddVehicleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      plateNumber: '',
      model: '',
      status: 'Idle',
      fuelLevel: 100,
      lastMaintenance: format(new Date(), 'yyyy-MM-dd'),
      assignedTo: 'none',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddVehicle({
      ...values,
      lastMaintenance: new Date(values.lastMaintenance).toISOString(),
      assignedTo: values.assignedTo === 'employee' ? 'employee' : null,
    });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a New Vehicle</DialogTitle>
          <DialogDescription>
            Enter the details for the new vehicle to add it to your fleet.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Volvo Prime Mover" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., VNL 860" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="plateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plate Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., TRK-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
                                <SelectItem value="Idle">Idle</SelectItem>
                                <SelectItem value="On Trip">On Trip</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="fuelLevel"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Fuel Level (%)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 85" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="lastMaintenance"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Last Maintenance Date</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user to assign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
               <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save Vehicle</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
