import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  LogOut, LayoutDashboard, Target, Users, Settings, Bell, Menu,
  UserCircle, Building2, TrendingUp, Trophy, Wallet, BarChart3,
  Tag, CreditCard, Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: "admin" | "partner" | "influencer";
}

const navItems: Record<string, NavItem[]> = {
  admin: [
    { name: "Vue globale", href: "?tab=overview", icon: LayoutDashboard },
    { name: "Partenaires", href: "?tab=partners", icon: Building2 },
    { name: "Influenceurs", href: "?tab=influencers", icon: Users },
    { name: "Campagnes", href: "?tab=campaigns", icon: Target },
    { name: "Catégories", href: "?tab=categories", icon: Tag },
    { name: "Plans", href: "?tab=plans", icon: CreditCard },
  ],
  partner: [
    { name: "Tableau de bord", href: "?tab=dashboard", icon: LayoutDashboard },
    { name: "Mes campagnes", href: "?tab=campaigns", icon: Target },
    { name: "Influenceurs", href: "?tab=influencers", icon: Users },
    { name: "Performance", href: "?tab=performance", icon: BarChart3 },
    { name: "Intégration", href: "?tab=integration", icon: TrendingUp },
  ],
  influencer: [
    { name: "Tableau de bord", href: "?tab=dashboard", icon: LayoutDashboard },
    { name: "Marketplace", href: "?tab=marketplace", icon: Store },
    { name: "Mes liens", href: "?tab=links", icon: TrendingUp },
    { name: "Classement", href: "?tab=leaderboard", icon: Trophy },
    { name: "Retrait", href: "?tab=withdrawal", icon: Wallet },
    { name: "Profil", href: "?tab=profile", icon: Settings },
  ],
};

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  partner: "Partenaire",
  influencer: "Influenceur",
};

export function DashboardLayout({ children, title, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const searchString = typeof window !== "undefined" ? window.location.search : "";
  const currentTab = new URLSearchParams(searchString).get("tab") ?? "";

  const currentNav = navItems[role] ?? [];

  const Sidebar = () => (
    <>
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50">
        <Link href="/" className="font-bold text-2xl tracking-tighter text-primary">VOYA</Link>
      </div>
      <div className="flex-1 flex flex-col gap-1 px-3 py-4">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Navigation</p>
        {currentNav.map((item) => {
          const tabValue = new URLSearchParams(item.href.slice(1)).get("tab") ?? "";
          const isActive = currentTab === tabValue || (currentTab === "" && tabValue === "overview") || (currentTab === "" && tabValue === "dashboard");
          return (
            <a key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs">{item.badge}</Badge>
                )}
              </div>
            </a>
          );
        })}
      </div>
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-2 py-2 mb-3 rounded-lg bg-muted/50">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <UserCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium leading-none truncate">{user?.email || "Utilisateur"}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{roleLabels[role] ?? role}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground text-sm"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-card md:flex flex-col h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-card/50 backdrop-blur px-6 sticky top-0 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <h1 className="text-base font-semibold">{title}</h1>
          </div>

          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-4 w-4" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
