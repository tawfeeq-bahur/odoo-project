'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Clock, 
  Camera, 
  Filter,
  Search,
  AlertTriangle
} from 'lucide-react';
import { useSharedState } from '@/components/AppLayout';
import { useToast } from '@/hooks/use-toast';
import { OdometerReading } from '@/lib/types';
import { format } from 'date-fns';

export default function OdometerPage() {
  const { user } = useSharedState();
  const { toast } = useToast();
  const [readings, setReadings] = useState<OdometerReading[]>([]);
  const [filteredReadings, setFilteredReadings] = useState<OdometerReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReading, setSelectedReading] = useState<OdometerReading | null>(null);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'approved' | 'rejected'>('approved');

  useEffect(() => {
    if (user?.role !== 'admin') {
      return;
    }
    fetchReadings();
  }, [user]);

  useEffect(() => {
    filterReadings();
  }, [readings, statusFilter, searchTerm]);

  const fetchReadings = async () => {
    try {
      const response = await fetch('/api/odometer/list');
      if (response.ok) {
        const data = await response.json();
        setReadings(data);
      }
    } catch (error) {
      console.error('Error fetching readings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch odometer readings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterReadings = () => {
    let filtered = readings;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reading => reading.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(reading => 
        reading.driverId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.odometerValue.toString().includes(searchTerm)
      );
    }

    setFilteredReadings(filtered);
  };

  const handleStatusUpdate = async () => {
    if (!selectedReading) return;

    try {
      const response = await fetch('/api/odometer/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedReading.id,
          status: newStatus,
          adminNotes: adminNotes || undefined,
        }),
      });

      if (response.ok) {
        setReadings(prev => 
          prev.map(reading => 
            reading.id === selectedReading.id 
              ? { ...reading, status: newStatus, adminNotes }
              : reading
          )
        );
        
        toast({
          title: "Status updated",
          description: `Odometer reading ${newStatus} successfully`,
        });
        
        setShowStatusDialog(false);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: OdometerReading['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This page is only available for administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Odometer Verification</h1>
          <p className="text-muted-foreground">Loading odometer readings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Odometer Verification</h1>
        <p className="text-muted-foreground">Review and verify driver odometer readings with geo-tagged photos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Odometer Readings
          </CardTitle>
          <CardDescription>All submitted odometer readings with photo verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by driver, vehicle, or odometer reading..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Odometer Reading</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReadings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell className="font-medium">{reading.driverId}</TableCell>
                  <TableCell>{reading.vehicleId}</TableCell>
                  <TableCell className="font-mono">{reading.odometerValue.toLocaleString()} km</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {reading.latitude.toFixed(4)}, {reading.longitude.toFixed(4)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(reading.submittedAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(reading.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReading(reading);
                          setShowPhotoDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {reading.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReading(reading);
                              setNewStatus('approved');
                              setAdminNotes('');
                              setShowStatusDialog(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReading(reading);
                              setNewStatus('rejected');
                              setAdminNotes('');
                              setShowStatusDialog(true);
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredReadings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No odometer readings found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo View Dialog */}
      {selectedReading && (
        <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Odometer Reading Details</DialogTitle>
              <DialogDescription>
                Driver: {selectedReading.driverId} | Vehicle: {selectedReading.vehicleId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Odometer Reading</Label>
                  <p className="text-2xl font-mono font-bold">{selectedReading.odometerValue.toLocaleString()} km</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedReading.status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedReading.latitude.toFixed(6)}, {selectedReading.longitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Submitted</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedReading.submittedAt), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
              </div>

              {selectedReading.exifData && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>EXIF Data:</strong> GPS coordinates from photo metadata match submitted location.
                    {selectedReading.exifData.cameraMake && (
                      <span> Camera: {selectedReading.exifData.cameraMake} {selectedReading.exifData.cameraModel}</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label className="text-sm font-medium">Photo</Label>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <img
                    src={selectedReading.photoUrl}
                    alt="Odometer reading"
                    className="w-full h-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/map-placeholder.png';
                    }}
                  />
                </div>
              </div>

              {selectedReading.adminNotes && (
                <div>
                  <Label className="text-sm font-medium">Admin Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedReading.adminNotes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === 'approved' ? 'Approve' : 'Reject'} Odometer Reading
            </DialogTitle>
            <DialogDescription>
              Driver: {selectedReading?.driverId} | Reading: {selectedReading?.odometerValue.toLocaleString()} km
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                placeholder="Add any notes about this verification..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleStatusUpdate}
                variant={newStatus === 'approved' ? 'default' : 'destructive'}
              >
                {newStatus === 'approved' ? 'Approve' : 'Reject'} Reading
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
