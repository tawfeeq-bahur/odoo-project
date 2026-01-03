'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, Upload, Globe, AlertTriangle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSharedState } from '@/components/AppLayout';

const formSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
    password: z.string().min(3, { message: 'Password must be at least 3 characters.' }),
    firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
    lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
    city: z.string().min(2, { message: 'City is required.' }),
    country: z.string().min(2, { message: 'Country is required.' }),
    additionalInfo: z.string().optional(),
});

export default function SignupPage() {
    const router = useRouter();
    const { signup } = useSharedState();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            city: '',
            country: '',
            additionalInfo: '',
        },
    });

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        const { username, password } = values;

        // Try to register the user
        const registered = signup(username, password);

        if (!registered) {
            setError('Username already taken. Please choose a different username.');
            setSuccess(false); // Ensure success is false if there's an error
            return;
        }

        console.log('Registration Data:', values);
        setSuccess(true);
        setError(null);
        // Simulate registration success, then redirect to login
        setTimeout(() => {
            router.push('/login');
        }, 2000);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            {/* Registration Card */}
            <Card className="w-full max-w-3xl border-2 shadow-2xl">
                <CardContent className="pt-12 pb-8 px-8">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="h-8 w-8 text-emerald-500" />
                            <h1 className="text-3xl font-bold font-headline">Registration</h1>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">Create your GlobeTrotter account</p>
                    </div>

                    {/* Photo Upload */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <input
                                type="file"
                                id="photo-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />
                            <label htmlFor="photo-upload" className="cursor-pointer">
                                <Avatar className="h-24 w-24 border-4 border-dashed border-primary/30 hover:border-primary/60 transition-colors">
                                    {photoPreview ? (
                                        <AvatarImage src={photoPreview} alt="Profile" />
                                    ) : (
                                        <AvatarFallback className="bg-muted">
                                            <div className="flex flex-col items-center gap-1">
                                                <Upload className="h-6 w-6 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">Photo</span>
                                            </div>
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                            </label>
                        </div>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <Alert className="mb-6 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <AlertTitle className="text-emerald-800 dark:text-emerald-200">Registration Successful!</AlertTitle>
                            <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                                Redirecting to login page...
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Registration Failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Registration Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Username and Password */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Username */}
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Username"
                                                    className="h-12 px-4 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Password"
                                                    className="h-12 px-4 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Two Column Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* First Name */}
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="First Name"
                                                    className="h-12 px-4 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Last Name */}
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Last Name"
                                                    className="h-12 px-4 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Email Address */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Email Address"
                                                    className="h-12 px-4 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Phone Number */}
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    placeholder="Phone Number"
                                                    className="h-12 px-4 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* City */}
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="City"
                                                    className="h-12 px-4 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Country */}
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Country"
                                                    className="h-12 px-4 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Additional Information */}
                            <FormField
                                control={form.control}
                                name="additionalInfo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Additional Information ...."
                                                className="min-h-[100px] px-4 py-3 text-base resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Register Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold"
                                disabled={success}
                            >
                                Register Users
                            </Button>

                            {/* Login Link */}
                            <div className="text-center text-sm">
                                <span className="text-muted-foreground">Already have an account? </span>
                                <Link href="/login" className="text-primary hover:underline font-medium">
                                    Login here
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
