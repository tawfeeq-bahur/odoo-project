

'use client';

import { useState, useRef } from 'react';
import * as React from 'react';
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
import type { TourPackage } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Upload } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Tour name must be at least 3 characters.' }),
  destination: z.string().min(2, { message: 'Destination is required.' }),
  status: z.enum(['Ongoing', 'Up-Coming', 'Completed']),
  pricePerPerson: z.coerce.number().min(0, { message: 'Price cannot be negative.' }),
  durationDays: z.coerce.number().min(1, { message: 'Duration must be at least 1 day.' }),
  tripType: z.enum(['friends', 'family', 'school'], { required_error: 'Please select a trip type.' }),
  travelStyle: z.enum(['day', 'night', 'whole-day'], { required_error: 'Please select a travel style.' }),
  maxMembers: z.coerce.number().min(1, 'Group must have at least 1 member.'),
  maxBudget: z.coerce.number().min(1, 'Please enter an estimated budget.'),
  schoolName: z.string().optional(),
  schoolLocation: z.string().optional(),
}).refine(data => {
  if (data.tripType === 'school') {
    return !!data.schoolName && !!data.schoolLocation;
  }
  return true;
}, {
  message: "School Name and Location are required for school trips.",
  path: ["schoolName"],
});

type AddPackageDialogProps = {
  children: React.ReactNode;
  onAddPackage: (pkg: Omit<TourPackage, 'id' | 'lastUpdated' | 'organizerName' | 'inviteCode' | 'gallery' | 'driveLink'>) => void;
};

export function AddPackageDialog({ children, onAddPackage }: AddPackageDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [studentList, setStudentList] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      destination: '',
      status: 'Up-Coming',
      pricePerPerson: 0,
      durationDays: 1,
      maxMembers: 1,
      maxBudget: 10000,
      schoolName: '',
      schoolLocation: '',
    },
  });

  const tripType = form.watch('tripType');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Assuming CSV is a single column of names, with a header
        const lines = text.split('\n').slice(1); // Skip header
        const names = lines.map(line => line.trim()).filter(Boolean);
        setStudentList(names);
      };
      reader.readAsText(file);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const membersWithAttendance = studentList.map(name => ({ name, status: 'pending' as 'pending' | 'present' | 'absent' }));
    onAddPackage({
      ...values,
      members: tripType === 'school' ? membersWithAttendance : [],
    });
    form.reset();
    setStudentList([]);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a New Tour</DialogTitle>
          <DialogDescription>
            Enter the details for the new tour you want to organize. More details lead to better AI suggestions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tour Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Himalayan Adventure" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Destination</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Manali, HP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tripType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Trip Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="friends" />
                        </FormControl>
                        <FormLabel className="font-normal">Friends Trip</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="family" />
                        </FormControl>
                        <FormLabel className="font-normal">Family Trip</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="school" />
                        </FormControl>
                        <FormLabel className="font-normal">School Trip</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {tripType === 'school' && (
              <div className="space-y-4 p-4 border bg-muted/50 rounded-lg">
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Mountain View High" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schoolLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Location</FormLabel>
                      <FormControl><Input placeholder="e.g., Shimla, HP" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Student List (CSV)</FormLabel>
                  <Input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <Button type="button" variant="outline" className="w-full mt-1" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2" /> {studentList.length > 0 ? `${studentList.length} students loaded` : 'Upload CSV'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">Upload a CSV file with a 'name' column for all students.</p>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="travelStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Travel Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select travel style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="day">Day Travel</SelectItem>
                      <SelectItem value="night">Night Travel</SelectItem>
                      <SelectItem value="whole-day">Whole Day (Flexible)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxMembers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Group Size</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pricePerPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Person (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 25000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                      <SelectItem value="Up-Coming">Up-Coming</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Create Tour</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
