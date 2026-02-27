
'use client';

import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/LanguageContext';

export default function ProfilePage() {
  const { user, vehicles } = useSharedState();
  const { t } = useLanguage();

  if (user?.role !== 'employee') {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("Access Denied")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t("This page is only available for employees.")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assignedVehicle = vehicles.find(v => v.id === user.assignedVehicleId);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t("My Profile")}</h1>
        <p className="text-muted-foreground">{t("View and manage your personal and professional details.")}</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
            <Card>
                <CardHeader className="items-center text-center">
                    <Avatar className="w-24 h-24 mb-4">
                        <AvatarImage src={`https://placehold.co/100x100.png?text=${user.username.substring(0,2)}`} data-ai-hint="person portrait" />
                        <AvatarFallback>{user.username.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <CardTitle>{user.username}</CardTitle>
                    <CardDescription>Driver</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" className="w-full">
                        <Camera className="mr-2"/> {t("Change Picture")}
                    </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t("Assigned Vehicle")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {assignedVehicle ? (
                        <div className="space-y-2">
                            <p className="font-semibold">{assignedVehicle.name}</p>
                            <p className="text-sm text-muted-foreground">{assignedVehicle.plateNumber}</p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">{t("No vehicle assigned.")}</p>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t("Personal Information")}</CardTitle>
                    <CardDescription>{t("These details are managed by your administrator.")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="name">{t("Full Name")}</Label>
                            <Input id="name" value={user.username} readOnly />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="email">{t("Email Address")}</Label>
                            <Input id="email" value={`${user.username.toLowerCase()}@fleetflow.com`} readOnly />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="phone">{t("Phone Number")}</Label>
                        <Input id="phone" value="+1 (123) 456-7890" readOnly />
                    </div>
                    <Button variant="secondary" className="cursor-not-allowed">{t("Update Details (Disabled)")}</Button>
                </CardContent>

                <Separator className="my-6" />

                 <CardHeader>
                    <CardTitle>{t("License & Documents")}</CardTitle>
                    <CardDescription>{t("Upload your documents for verification.")}</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="p-6 border-2 border-dashed rounded-lg text-center">
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2"/>
                        <p className="text-muted-foreground">{t("Drag & drop your files here or click to upload.")}</p>
                    </div>
                    <Button>
                        <Upload className="mr-2"/> {t("Upload License")}
                    </Button>
                </CardContent>

                 <Separator className="my-6" />

                 <CardHeader>
                    <CardTitle>{t("Payment Information")}</CardTitle>
                    <CardDescription>{t("Your payment details for salary and reimbursements.")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="bank">{t("Bank Name")}</Label>
                        <Input id="bank" placeholder={t("Enter your bank name")} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="account">{t("Account Number")}</Label>
                        <Input id="account" placeholder={t("Enter your account number")} />
                    </div>
                     <Button variant="secondary">{t("Save Payment Info")}</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
