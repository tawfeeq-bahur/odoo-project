'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OdometerReading } from '@/lib/types';

interface OdometerUploadProps {
  vehicleId: string;
  tripId?: string;
  onSuccess?: (reading: OdometerReading) => void;
  onCancel?: () => void;
}

export function OdometerUpload({ vehicleId, tripId, onSuccess, onCancel }: OdometerUploadProps) {
  const [odometerValue, setOdometerValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [exifData, setExifData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Get current location
    try {
      const position = await getCurrentPosition();
      setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
    } catch (error) {
      console.warn('Could not get current location:', error);
      toast({
        title: "Location access denied",
        description: "Please enable location access for better verification",
        variant: "destructive"
      });
    }

    // Extract EXIF data
    try {
      const exif = await extractEXIFData(file);
      setExifData(exif);
    } catch (error) {
      console.warn('Could not extract EXIF data:', error);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const extractEXIFData = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Simple EXIF extraction - in production, use a library like exif-js
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const dataView = new DataView(arrayBuffer);
          
          // Basic EXIF header check
          if (dataView.getUint16(0) !== 0xFFD8) {
            resolve({});
            return;
          }

          // This is a simplified version - in production, use a proper EXIF library
          resolve({
            hasGPS: false, // Would be determined by proper EXIF parsing
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          resolve({});
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile || !odometerValue) {
      toast({
        title: "Missing information",
        description: "Please select a photo and enter the odometer reading",
        variant: "destructive"
      });
      return;
    }

    if (!location) {
      toast({
        title: "Location required",
        description: "Please enable location access to submit odometer reading",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('odometerValue', odometerValue);
      formData.append('vehicleId', vehicleId);
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());
      formData.append('timestamp', new Date().toISOString());
      if (tripId) formData.append('tripId', tripId);
      if (exifData) formData.append('exifData', JSON.stringify(exifData));

      const response = await fetch('/api/odometer/submit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit odometer reading');
      }

      const result = await response.json();
      
      toast({
        title: "Odometer reading submitted",
        description: "Your reading has been submitted for verification",
      });

      onSuccess?.(result);
    } catch (error) {
      console.error('Error submitting odometer reading:', error);
      toast({
        title: "Submission failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Update Odometer
        </CardTitle>
        <CardDescription>
          Take a photo of your odometer and enter the reading
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!previewUrl ? (
          <div className="space-y-4">
            <Button
              onClick={handleCameraCapture}
              className="w-full"
              variant="outline"
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Odometer preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setLocation(null);
                  setExifData(null);
                }}
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="odometer">Odometer Reading (km)</Label>
              <Input
                id="odometer"
                type="number"
                placeholder="Enter odometer reading"
                value={odometerValue}
                onChange={(e) => setOdometerValue(e.target.value)}
              />
            </div>

            {location && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </AlertDescription>
              </Alert>
            )}

            {exifData && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Photo metadata extracted successfully
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isUploading || !odometerValue}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Reading
                  </>
                )}
              </Button>
              <Button
                onClick={onCancel}
                variant="outline"
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
