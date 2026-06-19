import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, UserCircle } from "lucide-react";

export default function RegisterIndex() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="absolute top-4 left-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="font-bold text-3xl tracking-tighter text-primary mb-2">VOYA</div>
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground">Choose how you want to use VOYA</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/register/partner">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Building2 className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">I'm a Partner</CardTitle>
                <CardDescription>
                  I want to promote my business, launch affiliate campaigns, and find influencers.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/register/influencer">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <UserCircle className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">I'm a Creator</CardTitle>
                <CardDescription>
                  I want to browse campaigns, promote products, and earn commissions.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
