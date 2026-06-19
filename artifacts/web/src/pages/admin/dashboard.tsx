import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Target, Zap, Activity } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Users", value: "1,248", change: "+12% from last month", icon: Users },
    { title: "Active Partners", value: "84", change: "+4 this week", icon: Building2 },
    { title: "Active Influencers", value: "892", change: "+48 this week", icon: Zap },
    { title: "Total Campaigns", value: "312", change: "+24 this month", icon: Target },
  ];

  return (
    <DashboardLayout title="Admin Overview" role="admin">
      <div className="space-y-8">
        
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-card text-card-foreground border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Activity */}
          <Card className="lg:col-span-4 border-border/50">
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Recent signups and platform events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  { user: "TechStore Inc.", action: "registered as Partner", time: "2 minutes ago", type: "partner" },
                  { user: "Sarah Content", action: "reached Gold tier", time: "1 hour ago", type: "influencer" },
                  { user: "Acme SaaS", action: "launched a new campaign", time: "3 hours ago", type: "campaign" },
                  { user: "John Vlogger", action: "registered as Creator", time: "5 hours ago", type: "influencer" },
                  { user: "DevTools Pro", action: "upgraded to Premium", time: "1 day ago", type: "partner" },
                ].map((event, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{event.user}</p>
                      <p className="text-sm text-muted-foreground">{event.action}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {event.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-3 border-border/50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm leading-none">Review pending payouts</p>
                  <p className="text-xs text-muted-foreground">12 requests waiting</p>
                </div>
              </div>
              <div className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm leading-none">Manage Categories</p>
                  <p className="text-xs text-muted-foreground">Add or edit campaign categories</p>
                </div>
              </div>
              <div className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm leading-none">System Settings</p>
                  <p className="text-xs text-muted-foreground">Configure global commission rates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
