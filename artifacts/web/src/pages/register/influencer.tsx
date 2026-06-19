import React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegisterInfluencer, useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const influencerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  bio: z.string().optional(),
  tiktokUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tiktokFollowers: z.coerce.number().optional(),
  instagramUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instagramFollowers: z.coerce.number().optional(),
  facebookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  facebookFollowers: z.coerce.number().optional(),
  youtubeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  youtubeFollowers: z.coerce.number().optional(),
});

type InfluencerFormValues = z.infer<typeof influencerSchema>;

export default function RegisterInfluencer() {
  const [, setLocation] = useLocation();
  const { login: authenticate } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegisterInfluencer();
  const loginMutation = useLogin();

  const form = useForm<InfluencerFormValues>({
    resolver: zodResolver(influencerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      phone: "",
      country: "",
      bio: "",
      tiktokUrl: "",
      tiktokFollowers: 0,
      instagramUrl: "",
      instagramFollowers: 0,
      facebookUrl: "",
      facebookFollowers: 0,
      youtubeUrl: "",
      youtubeFollowers: 0,
    },
  });

  const onSubmit = (data: InfluencerFormValues) => {
    // Clean up empty URLs
    const payload = { ...data };
    if (!payload.tiktokUrl) delete payload.tiktokUrl;
    if (!payload.instagramUrl) delete payload.instagramUrl;
    if (!payload.facebookUrl) delete payload.facebookUrl;
    if (!payload.youtubeUrl) delete payload.youtubeUrl;

    registerMutation.mutate(
      { data: payload },
      {
        onSuccess: () => {
          // Log them in
          loginMutation.mutate(
            { data: { email: data.email, password: data.password } },
            {
              onSuccess: (res) => {
                authenticate(res);
                toast({ title: "Welcome to VOYA!", description: "Your creator account is ready." });
                setLocation("/influencer");
              },
              onError: () => {
                toast({ title: "Registration successful", description: "Please log in." });
                setLocation("/login");
              }
            }
          );
        },
        onError: (err: any) => {
          toast({
            title: "Registration failed",
            description: err.response?.data?.error || "Could not create account.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const isPending = registerMutation.isPending || loginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-muted/30">
      <div className="absolute top-4 left-4">
        <Link href="/register" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Options
        </Link>
      </div>

      <Card className="w-full max-w-3xl shadow-xl border-border/50">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <UserCircle className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Creator Registration</CardTitle>
          <CardDescription>
            Join VOYA to find campaigns and monetize your audience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} data-testid="input-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} data-testid="input-password" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Tunisia" {...field} data-testid="input-country" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl><Input placeholder="+216 20 000 000" {...field} data-testid="input-phone" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell brands about your content..." className="resize-none" {...field} data-testid="input-bio" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Social Networks</h3>
                <FormDescription>Link your profiles and state your follower counts.</FormDescription>
                
                <div className="grid md:grid-cols-2 gap-6 items-end">
                  <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram URL</FormLabel>
                      <FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="instagramFollowers" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Followers</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-end">
                  <FormField control={form.control} name="tiktokUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>TikTok URL</FormLabel>
                      <FormControl><Input placeholder="https://tiktok.com/@..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tiktokFollowers" render={({ field }) => (
                    <FormItem>
                      <FormLabel>TikTok Followers</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-end">
                  <FormField control={form.control} name="youtubeUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube URL</FormLabel>
                      <FormControl><Input placeholder="https://youtube.com/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="youtubeFollowers" render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Subscribers</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit">
                {isPending ? "Creating account..." : "Create Creator Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
