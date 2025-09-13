'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Route, MapPin, Clock, Fuel, Leaf, RefreshCw, AlertTriangle } from 'lucide-react';
import { useSharedState } from '@/components/AppLayout';
import { useToast } from '@/hooks/use-toast';

interface RouteData {
  _id: string;
  source: string;
  destination: string;
  vehicleType: string;
  vehicleYear?: number;
  fuelType?: string;
  distance: number;
  emissions: number;
  routeSource?: string;
  routeType?: string;
  traffic?: string;
  claimedEfficiency?: number;
  claimedEfficiencyUnit?: string;
  electricitySource?: string;
  ecoTip?: string;
  date: string;
}

export default function RoutesPage() {
  const { user } = useSharedState();
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAllRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/routes/list');
      const data = await response.json();
      
      if (data.success) {
        setRoutes(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch routes');
      }
    } catch (err) {
      console.error('💥 Network error occurred:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRoutes();
  }, []);

  const handleRefresh = () => {
    fetchAllRoutes();
    toast({
      title: "Refreshed",
      description: "Routes data has been refreshed",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVehicleTypeColor = (vehicleType: string) => {
    const colors: { [key: string]: string } = {
      'petrol': 'bg-red-100 text-red-800',
      'diesel': 'bg-blue-100 text-blue-800',
      'electric': 'bg-green-100 text-green-800',
      'hybrid': 'bg-yellow-100 text-yellow-800',
      'bike': 'bg-purple-100 text-purple-800',
      'bus': 'bg-orange-100 text-orange-800',
      'truck': 'bg-gray-100 text-gray-800',
    };
    return colors[vehicleType.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Routes</h1>
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
        <h1 className="text-3xl font-bold tracking-tight font-headline">Routes</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {routes.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Route className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Admin-Assigned Routes</h3>
            <p className="text-muted-foreground text-center">
              No routes have been assigned by admin yet. Routes will appear here once you assign them through the admin interface.
            </p>
          </CardContent>
        </Card>
      )}

      {routes.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Admin-Assigned Routes</h2>
              <p className="text-muted-foreground">Total: {routes.length} routes assigned by admin</p>
            </div>
          </div>
          
          {routes.map((route, index) => (
            <Card key={route._id || index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-5 w-5" />
                      Route #{index + 1}
                    </CardTitle>
                    <CardDescription>
                      {route.source} → {route.destination}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatDate(route.date)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Route Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">From</p>
                        <p className="text-lg">{route.source}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">To</p>
                        <p className="text-lg">{route.destination}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Vehicle Type</p>
                        <Badge className={getVehicleTypeColor(route.vehicleType)}>
                          {route.vehicleType}
                        </Badge>
                      </div>
                    </div>
                    {route.vehicleYear && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Vehicle Year</p>
                          <p className="text-lg">{route.vehicleYear}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Route Details */}
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{route.distance} km</p>
                    <p className="text-sm text-muted-foreground">Distance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{route.emissions} g</p>
                    <p className="text-sm text-muted-foreground">CO₂ Emissions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {route.routeSource || 'OSM'}
                    </p>
                    <p className="text-sm text-muted-foreground">Route Source</p>
                  </div>
                </div>

                {/* Additional Information */}
                {(route.fuelType || route.routeType || route.traffic) && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Additional Details</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      {route.fuelType && (
                        <div>
                          <p className="text-muted-foreground">Fuel Type</p>
                          <p className="font-medium">{route.fuelType}</p>
                        </div>
                      )}
                      {route.routeType && (
                        <div>
                          <p className="text-muted-foreground">Route Type</p>
                          <p className="font-medium">{route.routeType}</p>
                        </div>
                      )}
                      {route.traffic && (
                        <div>
                          <p className="text-muted-foreground">Traffic</p>
                          <p className="font-medium">{route.traffic}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Eco Tip */}
                {route.ecoTip && (
                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-2">
                      <Leaf className="h-4 w-4 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Eco Tip</p>
                        <p className="text-sm text-green-700">{route.ecoTip}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
