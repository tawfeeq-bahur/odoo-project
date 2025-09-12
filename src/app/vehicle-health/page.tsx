
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Truck, Fuel, Wrench, Upload, Send, Gauge } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VehicleHealthPage() {
  const { user, vehicles, updateVehicleFuelLevel } = useSharedState();
  const { toast } = useToast();
  
  const assignedVehicle = vehicles.find(v => v.id === user?.assignedVehicleId);
  
  const [fuel, setFuel] = useState(assignedVehicle?.fuelLevel ?? 0);
  const [issueImagePreview, setIssueImagePreview] = useState<string | null>(null);
  const [fuelImagePreview, setFuelImagePreview] = useState<string | null>(null);
  
  const issueFileInputRef = useRef<HTMLInputElement>(null);
  const fuelFileInputRef = useRef<HTMLInputElement>(null);

  if (user?.role !== 'employee' || !assignedVehicle) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardHeader>
            <CardTitle>No Vehicle Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be assigned a vehicle to view this page. Please contact your administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFuelUpdate = () => {
    updateVehicleFuelLevel(assignedVehicle.id, fuel);
    toast({
      title: 'Fuel Level Updated',
      description: `Fuel level for ${assignedVehicle.plateNumber} set to ${fuel}%.`,
    });
    setFuelImagePreview(null);
    if(fuelFileInputRef.current) fuelFileInputRef.current.value = '';
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Issue Reported',
      description: `Your issue report for ${assignedVehicle.plateNumber} has been sent to the admin.`,
    });
    // Reset form fields
    setIssueImagePreview(null);
    if(issueFileInputRef.current) issueFileInputRef.current.value = '';
    const form = e.target as HTMLFormElement;
    form.reset();
  };

  const handleIssueImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setIssueImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFuelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFuelImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Vehicle Health</h1>
        <p className="text-muted-foreground">Update fuel status and report issues for your assigned vehicle.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Vehicle</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Truck className="h-10 w-10 text-primary" />
              <div>
                <p className="font-bold text-lg">{assignedVehicle.name}</p>
                <p className="text-muted-foreground">{assignedVehicle.plateNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Gauge /> Update Fuel Level</CardTitle>
              <CardDescription>Drag the slider and upload a geotagged photo of the dashboard's fuel gauge as proof.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Fuel className="h-6 w-6 text-yellow-500" />
                <Slider
                  value={[fuel]}
                  onValueChange={(value) => setFuel(value[0])}
                  max={100}
                  step={1}
                />
                <span className="font-bold text-xl w-16 text-center">{fuel}%</span>
              </div>
              
              <div>
                <Label>Dashboard Photo Proof</Label>
                <div
                  className="relative mt-1 aspect-video w-full border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50"
                  onClick={() => fuelFileInputRef.current?.click()}
                >
                  {fuelImagePreview ? (
                    <Image src={fuelImagePreview} alt="Fuel gauge preview" layout="fill" objectFit="contain" className="rounded-md" data-ai-hint="dashboard gauge" />
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <Upload className="mx-auto h-8 w-8" />
                      <p>Click to upload a photo</p>
                    </div>
                  )}
                </div>
                <Input
                  ref={fuelFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFuelImageChange}
                />
              </div>

              <Button onClick={handleFuelUpdate} className="w-full" disabled={!fuelImagePreview}>
                Save Fuel Level
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench /> Report an Issue</CardTitle>
            <CardDescription>Fill out the form below to report a fault with your vehicle.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReportIssue} className="space-y-4">
              <div>
                <Label htmlFor="issue-description">Issue Description</Label>
                <Textarea id="issue-description" placeholder="e.g., Engine is making a strange noise, there is a flat tire..." required />
              </div>
              <div>
                <Label>Upload Photo (Optional)</Label>
                <div
                  className="relative mt-1 aspect-video w-full border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50"
                  onClick={() => issueFileInputRef.current?.click()}
                >
                  {issueImagePreview ? (
                    <Image src={issueImagePreview} alt="Issue preview" layout="fill" objectFit="contain" className="rounded-md" data-ai-hint="vehicle damage" />
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <Upload className="mx-auto h-8 w-8" />
                      <p>Click to upload a photo</p>
                    </div>
                  )}
                </div>
                <Input
                  ref={issueFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIssueImageChange}
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="mr-2" /> Report Issue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
