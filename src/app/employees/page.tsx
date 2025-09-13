'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, Plus, Mail, Phone, Building, Car, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddEmployeeDialog } from '@/components/fleet/AddEmployeeDialog';

interface EmployeeProfile {
  id: string;
  name: string;
  employeeId: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  assignedVehicleId?: string | null;
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/employees');
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      console.error('💥 Network error occurred:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleRefresh = () => {
    fetchEmployees();
    toast({
      title: "Refreshed",
      description: "Employee data has been refreshed",
    });
  };

  const handleEmployeeAdded = (newEmployee: EmployeeProfile) => {
    setEmployees(prev => [newEmployee, ...prev]);
    setShowAddDialog(false);
    toast({
      title: "Employee Added",
      description: `${newEmployee.name} has been added successfully`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Employees</h1>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Employees</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {employees.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Employees Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              No employees have been added yet. Add your first employee to get started.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Employee
            </Button>
          </CardContent>
        </Card>
      )}

      {employees.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Employee Directory</h2>
              <p className="text-muted-foreground">Total: {employees.length} employees</p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {employee.name}
                      </CardTitle>
                      <CardDescription>
                        ID: {employee.employeeId}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatDate(employee.createdAt)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-2">
                    {employee.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{employee.email}</span>
                      </div>
                    )}
                    {employee.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{employee.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Department & Position */}
                  {(employee.department || employee.position) && (
                    <div className="space-y-2">
                      {employee.department && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employee.department}</span>
                        </div>
                      )}
                      {employee.position && (
                        <div className="text-sm text-muted-foreground">
                          {employee.position}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vehicle Assignment */}
                  {employee.assignedVehicleId && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Vehicle Assigned</span>
                    </div>
                  )}

                  {/* Emergency Contacts */}
                  {employee.emergencyContacts && employee.emergencyContacts.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Emergency Contacts ({employee.emergencyContacts.length})
                      </p>
                      <div className="space-y-1">
                        {employee.emergencyContacts.slice(0, 2).map((contact, index) => (
                          <div key={index} className="text-xs text-muted-foreground">
                            {contact.name} - {contact.phone}
                          </div>
                        ))}
                        {employee.emergencyContacts.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{employee.emergencyContacts.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onEmployeeAdded={handleEmployeeAdded}
      />
    </div>
  );
}