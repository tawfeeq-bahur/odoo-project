
'use client';

import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, ClipboardCopy, QrCode, User, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from 'react';

export default function MemberManagementPage() {
  const { user, packages, updatePackage } = useSharedState();
  const { toast } = useToast();

  // Find tours organized by the current user
  const organizedTours = packages.filter(p => p.organizerName === user?.username);

  const [selectedTourId, setSelectedTourId] = useState<string>(organizedTours[0]?.id || '');

  const selectedTour = packages.find(p => p.id === selectedTourId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard!",
      description: "The invite code has been copied.",
    });
  };

  const handleAttendance = (memberName: string, status: 'present' | 'absent') => {
    if (selectedTour && Array.isArray(selectedTour.members) && typeof selectedTour.members[0] === 'object') {
        const updatedMembers = (selectedTour.members as {name: string, status: string}[]).map(member => 
            member.name === memberName ? { ...member, status } : member
        );
        updatePackage(selectedTour.id, { members: updatedMembers });
    }
  };

  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
        case 'present': return <Badge className="bg-green-100 text-green-800">Present</Badge>;
        case 'absent': return <Badge variant="destructive">Absent</Badge>;
        default: return <Badge variant="secondary">Pending</Badge>;
    }
  }


  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Member Management</h1>
          <p className="text-muted-foreground">Generate invite codes and manage members for your tours.</p>
        </div>
        {organizedTours.length > 0 && (
            <div className="w-72">
            <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                <SelectTrigger>
                <SelectValue placeholder="Select a tour to manage" />
                </SelectTrigger>
                <SelectContent>
                {organizedTours.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        )}
      </div>

      {organizedTours.length === 0 ? (
        <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">You are not organizing any tours.</h3>
                <p>Create a tour from your dashboard to start managing members.</p>
            </CardContent>
        </Card>
      ) : selectedTour ? (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                {selectedTour.tripType !== 'school' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Invite Members</CardTitle>
                            <CardDescription>Share this code with members to let them join the tour.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Invite Code</p>
                                <p className="text-4xl font-bold tracking-widest font-mono">{selectedTour.inviteCode}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button className="w-full" onClick={() => copyToClipboard(selectedTour.inviteCode)}>
                                    <ClipboardCopy className="mr-2" /> Copy Code
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <QrCode className="mr-2" /> Generate QR
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
                 {selectedTour.tripType === 'school' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>School Trip</CardTitle>
                            <CardDescription>This is a school trip. Members are added via CSV upload.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{selectedTour.schoolName}</p>
                            <p className="text-sm text-muted-foreground">{selectedTour.schoolLocation}</p>
                        </CardContent>
                    </Card>
                 )}
            </div>
            <div className="lg:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Users /> Tour Members ({selectedTour.members.length})
                        </CardTitle>
                        <CardDescription>
                            A list of all members who have joined the "{selectedTour.name}" tour.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    {selectedTour.tripType === 'school' && <TableHead className="text-right">Attendance</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedTour.members.map((member, index) => {
                                    const memberName = typeof member === 'string' ? member : member.name;
                                    const memberStatus = typeof member === 'object' ? member.status : 'joined';
                                    
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{memberName}</TableCell>
                                            <TableCell><Badge variant="secondary">Member</Badge></TableCell>
                                            {selectedTour.tripType === 'school' && (
                                                <TableCell className="text-right space-x-2">
                                                    {getAttendanceStatusBadge(memberStatus)}
                                                    <Button size="icon" variant="ghost" onClick={() => handleAttendance(memberName, 'present')}><Check className="h-4 w-4 text-green-600"/></Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleAttendance(memberName, 'absent')}><X className="h-4 w-4 text-red-600"/></Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                         {selectedTour.members.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <User className="mx-auto h-8 w-8 mb-2" />
                                <p>No members have joined this tour yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      ) : (
         <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">Select a tour</h3>
                <p>Please select one of your organized tours from the dropdown above.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
