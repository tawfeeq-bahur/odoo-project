
"use client";

import { useSharedState } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Eye, MapPin, CalendarDays, Users, Star, UserPlus } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddPackageDialog } from "@/components/fleet/AddVehicleDialog"; // Will rename this component later
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user, packages, addPackage, deletePackage } = useSharedState();
  const { toast } = useToast();

  if (!user) return null;

  const toursOrganizing = packages.filter(p => p.organizerName === user.username);
  const toursJoined = packages.filter(p => p.members.includes(user.username));

  const handleCreateTour = (pkg: Omit<any, 'id' | 'lastUpdated' | 'organizerName' | 'inviteCode' | 'members'>) => {
    addPackage(pkg);
  };
  
  const handleDeleteTour = (pkgId: string) => {
      const pkg = packages.find(p => p.id === pkgId);
      if (!pkg) return;

      if (pkg.organizerName !== user.username) {
          toast({
              title: "Permission Denied",
              description: "You can only delete tours that you are organizing.",
              variant: "destructive"
          });
          return;
      }
      deletePackage(pkgId);
      toast({
          title: "Tour Deleted",
          description: `"${pkg.name}" has been successfully deleted.`
      });
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.username}! Here's an overview of your tours.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild variant="outline">
                <Link href="/join"><UserPlus className="mr-2"/> Join a Tour</Link>
            </Button>
            <AddPackageDialog onAddPackage={handleCreateTour}>
                <Button>
                    <PlusCircle className="mr-2" /> Create New Tour
                </Button>
            </AddPackageDialog>
        </div>
      </div>
      
      {/* Tours I'm Organizing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2"><Star className="text-amber-500" /> Tours I'm Organizing ({toursOrganizing.length})</h2>
        {toursOrganizing.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {toursOrganizing.map((pkg) => (
              <Card key={pkg.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="leading-tight">{pkg.name}</CardTitle>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="mr-2" /> Edit Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTour(pkg.id)}>
                          <Trash2 className="mr-2" /> Delete Tour
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="flex items-center gap-2 pt-1">
                    <MapPin className="h-4 w-4" /> {pkg.destination}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-semibold">{pkg.members.length} Joined</span>
                  </div>
                   <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Invite Code</span>
                    <Badge variant="secondary" className="font-mono">{pkg.inviteCode}</Badge>
                  </div>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button asChild className="w-full">
                    <Link href={`/tours/${pkg.id}`}><Eye className="mr-2" /> Manage Tour</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>You haven't created any tours yet. Click "Create New Tour" to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Tours I've Joined */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2"><Users /> Tours I've Joined ({toursJoined.length})</h2>
         {toursJoined.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {toursJoined.map((pkg) => (
                <Card key={pkg.id} className="flex flex-col">
                    <CardHeader>
                    <CardTitle className="leading-tight">{pkg.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1">
                        <MapPin className="h-4 w-4" /> {pkg.destination}
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Organizer</span>
                        <span className="font-semibold">{pkg.organizerName}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Members</span>
                        <span className="font-semibold">{pkg.members.length + 1}</span>
                    </div>
                    </CardContent>
                    <div className="p-6 pt-0">
                    <Button asChild className="w-full" variant="secondary">
                        <Link href={`/tours/${pkg.id}`}><Eye className="mr-2" /> View Details</Link>
                    </Button>
                    </div>
                </Card>
                ))}
            </div>
            ) : (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                <p>You haven't joined any tours. Find a tour and use the invite code to join!</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
