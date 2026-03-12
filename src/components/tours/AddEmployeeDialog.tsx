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
import type { EmployeeProfile } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Employee name must be at least 2 characters.' }),
  employeeId: z.string().min(3, { message: 'Employee ID is required.' }),
  email: z.string().email({ message: 'Valid email is required.' }),
  phone: z.string().min(10, { message: 'Phone number is required.' }),
  department: z.string().min(2, { message: 'Department is required.' }),
  position: z.string().min(2, { message: 'Position is required.' }),
  assignedVehicleId: z.string().optional(),
});

type AddEmployeeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: (employee: EmployeeProfile) => void;
};

export function AddEmployeeDialog({ open, onOpenChange, onEmployeeAdded }: AddEmployeeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      employeeId: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      assignedVehicleId: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          assignedVehicleId: values.assignedVehicleId || null,
          emergencyContacts: [],
        }),
      });

      const data = await response.json();

      if (data.success) {
        onEmployeeAdded(data.employee);
        form.reset();
        onOpenChange(false);
      } else {
        console.error('Failed to create employee:', data.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      // You could add a toast notification here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a New Employee</DialogTitle>
          <DialogDescription>
            Enter the details for the new employee to add them to your team.
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
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., EMP003" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., john@fleetflow.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., +1-555-0123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Operations" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Driver" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="assignedVehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Vehicle (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No vehicle assigned</SelectItem>
                      <SelectItem value="vehicle_001">Volvo Prime Mover (TRK-001)</SelectItem>
                      <SelectItem value="vehicle_002">Ford Transit Van (VAN-002)</SelectItem>
                      <SelectItem value="vehicle_003">Scania Rigid Truck (TRK-003)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Employee'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
