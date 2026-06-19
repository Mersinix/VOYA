import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useListPublicCampaigns } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Target, Trophy, ArrowRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function InfluencerDashboard() {
  const { data: campaignsData, isLoading } = useListPublicCampaigns({ limit: 10 });

  // In a real app, this would come from the user's profile
  const userLevel = "Gold";
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#F59E0B';
      case 'Platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  };

  return (
    <DashboardLayout title="Creator Dashboard" role="influencer">
      <div className="space-y-8">
        
        {/* Top Section */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Level Badge Card */}
          <Card className="border-border/50 shadow-sm md:col-span-1 bg-midnight-blue text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Creator Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center border-4" style={{ borderColor: getLevelColor(userLevel), backgroundColor: `${getLevelColor(userLevel)}20` }}>
                  <Trophy className="w-6 h-6" style={{ color: getLevelColor(userLevel) }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: getLevelColor(userLevel) }}>{userLevel}</h3>
                  <p className="text-xs text-gray-400">12 sales to Platinum</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card className="border-border/50 shadow-sm md:col-span-2 bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-32 h-32" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">Available Balance</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-end">
              <div>
                <div className="text-4xl font-bold mb-1">1,245.50 DT</div>
                <p className="text-sm text-primary-foreground/80">+320 DT this month</p>
              </div>
              <Button variant="secondary" className="z-10">Withdraw Funds</Button>
            </CardContent>
          </Card>
        </div>

        {/* Marketplace Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Campaign Marketplace</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              View all <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
            </div>
          ) : campaignsData?.campaigns && campaignsData.campaigns.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaignsData.campaigns.map((campaign) => (
                <Card key={campaign.id} className="border-border/50 flex flex-col hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        {campaign.category || 'General'}
                      </Badge>
                      <Badge style={{ backgroundColor: `${getLevelColor(campaign.minInfluencerLevel)}20`, color: getLevelColor(campaign.minInfluencerLevel), borderColor: getLevelColor(campaign.minInfluencerLevel) }} variant="outline">
                        {campaign.minInfluencerLevel} minimum
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1">{campaign.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pb-4">
                    <div className="bg-muted rounded-md p-3 flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Commission</span>
                      <span className="font-bold text-primary">{campaign.commissionAmount}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button className="w-full" variant="outline">
                      <Share2 className="w-4 h-4 mr-2" /> Generate Link
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed">
              <Target className="mx-auto h-12 w-12 text-muted/50 mb-4" />
              <h3 className="text-lg font-medium">No campaigns available</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                There are currently no active campaigns in the marketplace. Check back soon!
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
