import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="absolute top-4 left-4">
        <Link href="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre adresse email et nous vous enverrons un lien de réinitialisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-semibold text-lg">Email envoyé !</p>
              <p className="text-muted-foreground text-sm">
                Si un compte est associé à <strong>{email}</strong>, vous recevrez un email avec les instructions de réinitialisation.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full mt-4">Retour à la connexion</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit">
                Envoyer le lien de réinitialisation
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
