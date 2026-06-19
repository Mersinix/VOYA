import React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegisterPartner, useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const partnerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(2, "Company name is required"),
  managerName: z.string().min(2, "Manager name is required"),
  phone: z.string().min(8, "Valid phone number is required"),
  country: z.string().min(2, "Country is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

export default function RegisterPartner() {
  const [, setLocation] = useLocation();
  const { login: authenticate } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegisterPartner();
  const loginMutation = useLogin();

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      email: "",
      password: "",
      companyName: "",
      managerName: "",
      phone: "",
      country: "",
      website: "",
      logoUrl: "",
      description: "",
    },
  });

  const onSubmit = (data: PartnerFormValues) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: () => {
          // After successful registration, log them in
          loginMutation.mutate(
            { data: { email: data.email, password: data.password } },
            {
              onSuccess: (res) => {
                authenticate(res);
                toast({ title: "Welcome to VOYA!", description: "Your partner account has been created." });
                setLocation("/partner");
              },
              onError: () => {
                toast({ title: "Registration successful", description: "Please log in with your credentials." });
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

      <Card className="w-full max-w-2xl shadow-xl border-border/50">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Partner Registration</CardTitle>
          <CardDescription>
            Join VOYA as a brand and start connecting with top influencers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Acme Corp" {...field} data-testid="input-company" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="managerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager Full Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Jane Doe" {...field} data-testid="input-manager" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="email" placeholder="jane@acmecorp.com" {...field} data-testid="input-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} data-testid="input-password" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="+216 20 000 000" {...field} data-testid="input-phone" /></FormControl>
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

              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="website" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://www.acmecorp.com" {...field} data-testid="input-website" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="logoUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://cdn.acmecorp.com/logo.png" {...field} data-testid="input-logo" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us a bit about what your company does..." 
                      className="resize-none" 
                      {...field} 
                      data-testid="input-description" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit">
                {isPending ? "Creating account..." : "Create Partner Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
