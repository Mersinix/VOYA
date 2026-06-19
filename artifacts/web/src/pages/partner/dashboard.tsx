import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useListPublicCampaigns } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Link as LinkIcon, DollarSign, MousePointerClick, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PartnerDashboard() {
  const { data: campaignsData, isLoading } = useListPublicCampaigns({ limit: 5 });

  const stats = [
    { title: "Total Clicks", value: "12,543", change: "+15% this month", icon: MousePointerClick },
    { title: "Qualified Leads", value: "842", change: "+8% this month", icon: LinkIcon },
    { title: "Sales Generated", value: "145", change: "+12% this month", icon: BarChart },
    { title: "Commissions Paid", value: "$4,250", change: "Last 30 days", icon: DollarSign },
  ];

  return (
    <DashboardLayout title="Partner Dashboard" role="partner">
      <div className="space-y-8">
        
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-border/50 shadow-sm">
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Active Campaigns */}
          <Card className="lg:col-span-2 border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Active Campaigns</CardTitle>
                <CardDescription>Your currently running affiliation programs</CardDescription>
              </div>
              <Button size="sm" className="hidden sm:flex">
                <Plus className="mr-2 h-4 w-4" /> New Campaign
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
              ) : campaignsData?.campaigns && campaignsData.campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaignsData.campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{campaign.title}</p>
                        <p className="text-sm text-muted-foreground">{campaign.commissionAmount} • {campaign.commissionModel}</p>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="mx-auto h-12 w-12 text-muted/50 mb-4" />
                  <p>No active campaigns found.</p>
                  <Button variant="outline" className="mt-4">Create your first campaign</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Info */}
          <Card className="border-border/50 shadow-sm bg-midnight-blue text-white">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription className="text-gray-400">Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="font-medium">Plan</span>
                <Badge className="bg-primary hover:bg-primary/90">Pack Business</Badge>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="font-medium text-gray-300">Renewal</span>
                <span>Oct 12, 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300">Campaigns limit</span>
                <span>2 / 5 used</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">Upgrade Plan</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Temporary icon fallback if Target isn't imported above
function Target(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
