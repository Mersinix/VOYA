import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, LayoutDashboard, Target, Users, Settings, Bell, Menu, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: "admin" | "partner" | "influencer";
}

export function DashboardLayout({ children, title, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = {
    admin: [
      { name: "Overview", href: "/admin", icon: LayoutDashboard },
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Campaigns", href: "/admin/campaigns", icon: Target },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
    partner: [
      { name: "Dashboard", href: "/partner", icon: LayoutDashboard },
      { name: "My Campaigns", href: "/partner/campaigns", icon: Target },
      { name: "Settings", href: "/partner/settings", icon: Settings },
    ],
    influencer: [
      { name: "Dashboard", href: "/influencer", icon: LayoutDashboard },
      { name: "Marketplace", href: "/influencer/marketplace", icon: Target },
      { name: "Settings", href: "/influencer/settings", icon: Settings },
    ]
  };

  const currentNav = navItems[role];

  const Sidebar = () => (
    <>
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/" className="font-bold text-2xl tracking-tighter text-primary">VOYA</Link>
      </div>
      <div className="flex-1 flex flex-col gap-1 px-4 py-4">
        {currentNav.map((item) => (
          <Link key={item.name} href={item.href}>
            <div className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${location === item.href ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`} data-testid={`nav-${item.name.toLowerCase()}`}>
              <item.icon className="h-5 w-5" />
              {item.name}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-auto p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-4">
          <UserCircle className="h-8 w-8 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">{user?.email || "User"}</span>
            <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={logout} data-testid="button-logout">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/20 md:flex flex-col h-full bg-midnight-blue/5">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/20 px-6 shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-72">
              <Sidebar />
            </SheetContent>
          </Sheet>
          
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
