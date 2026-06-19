import React, { useState } from "react";
import { useSearch } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats, useAdminPartners, useAdminInfluencers, useAdminCampaigns, useAdminPlans, useUpdatePartnerStatus, useUpdateInfluencerStatus, useUpdateCampaignStatus } from "@/hooks/useApi";
import { useListCategories } from "@workspace/api-client-react";
import { Users, Building2, Target, TrendingUp, CheckCircle, XCircle, PauseCircle, DollarSign, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdminTab = "overview" | "partners" | "influencers" | "campaigns" | "categories" | "plans";

const TABS: { id: AdminTab; label: string }[] = [
  { id: "overview", label: "Vue globale" },
  { id: "partners", label: "Partenaires" },
  { id: "influencers", label: "Influenceurs" },
  { id: "campaigns", label: "Campagnes" },
  { id: "categories", label: "Catégories" },
  { id: "plans", label: "Plans" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  suspended: "bg-red-100 text-red-800",
  paused: "bg-orange-100 text-orange-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

function StatCard({ title, value, sub, icon: Icon, color = "text-primary" }: { title: string; value: any; sub?: string; icon: any; color?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value ?? "—"}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const search = useSearch();
  const tab = (new URLSearchParams(search).get("tab") as AdminTab) || "overview";
  const [partnerFilter, setPartnerFilter] = useState<string | undefined>(undefined);
  const [influencerFilter, setInfluencerFilter] = useState<string | undefined>(undefined);
  const [campaignFilter, setCampaignFilter] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: partnersData, isLoading: partnersLoading } = useAdminPartners({ status: partnerFilter, limit: 50 });
  const { data: influencersData, isLoading: influencersLoading } = useAdminInfluencers({ status: influencerFilter, limit: 50 });
  const { data: campaignsData, isLoading: campaignsLoading } = useAdminCampaigns({ status: campaignFilter, limit: 50 });
  const { data: plans, isLoading: plansLoading } = useAdminPlans();
  const { data: categories, isLoading: categoriesLoading } = useListCategories();

  const updatePartner = useUpdatePartnerStatus();
  const updateInfluencer = useUpdateInfluencerStatus();
  const updateCampaign = useUpdateCampaignStatus();

  const handlePartnerStatus = (id: number, status: string) => {
    updatePartner.mutate({ id, status }, {
      onSuccess: () => toast({ title: "Statut mis à jour" }),
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  const handleInfluencerStatus = (id: number, status: string) => {
    updateInfluencer.mutate({ id, status }, {
      onSuccess: () => toast({ title: "Statut mis à jour" }),
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  const handleCampaignStatus = (id: number, status: string) => {
    updateCampaign.mutate({ id, status }, {
      onSuccess: () => toast({ title: "Statut mis à jour" }),
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  return (
    <DashboardLayout title="Administration" role="admin">
      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto border-b mb-6 pb-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => window.location.search = `?tab=${t.id}`}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Utilisateurs totaux" value={stats?.totalUsers} icon={Users} />
                <StatCard title="Partenaires actifs" value={stats?.activePartners} sub={`${stats?.pendingPartners} en attente`} icon={Building2} color="text-blue-500" />
                <StatCard title="Influenceurs actifs" value={stats?.activeInfluencers} sub={`${stats?.pendingInfluencers} en attente`} icon={TrendingUp} color="text-green-500" />
                <StatCard title="Campagnes actives" value={stats?.activeCampaigns} sub={`${stats?.totalCampaigns} au total`} icon={Target} color="text-amber-500" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <StatCard title="Commissions totales" value={`${parseFloat(stats?.totalCommissions || "0").toFixed(2)} DT`} icon={DollarSign} color="text-purple-500" />
                <StatCard title="Partenaires en attente" value={stats?.pendingPartners} sub="Nécessitent une validation" icon={PauseCircle} color="text-orange-500" />
              </div>
            </>
          )}
        </div>
      )}

      {/* Partners */}
      {tab === "partners" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[undefined, "active", "pending", "suspended"].map(s => (
              <Button
                key={s ?? "all"}
                variant={partnerFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setPartnerFilter(s)}
              >
                {s === undefined ? "Tous" : s === "active" ? "Actifs" : s === "pending" ? "En attente" : "Suspendus"}
              </Button>
            ))}
          </div>
          {partnersLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-muted-foreground text-xs uppercase">
                      <th className="text-left p-4 font-medium">Entreprise</th>
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Pays</th>
                      <th className="text-left p-4 font-medium">Statut</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(partnersData?.partners ?? []).map((p: any) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium">{p.companyName}</td>
                        <td className="p-4 text-muted-foreground">{p.email}</td>
                        <td className="p-4">{p.country}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] ?? ""}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {p.status !== "active" && (
                              <Button size="sm" variant="ghost" className="h-7 text-green-600 hover:text-green-700" onClick={() => handlePartnerStatus(p.id, "active")}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Activer
                              </Button>
                            )}
                            {p.status !== "suspended" && (
                              <Button size="sm" variant="ghost" className="h-7 text-red-600 hover:text-red-700" onClick={() => handlePartnerStatus(p.id, "suspended")}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Suspendre
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(partnersData?.partners ?? []).length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucun partenaire</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Influencers */}
      {tab === "influencers" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[undefined, "active", "pending", "suspended"].map(s => (
              <Button
                key={s ?? "all"}
                variant={influencerFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setInfluencerFilter(s)}
              >
                {s === undefined ? "Tous" : s === "active" ? "Actifs" : s === "pending" ? "En attente" : "Suspendus"}
              </Button>
            ))}
          </div>
          {influencersLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-muted-foreground text-xs uppercase">
                      <th className="text-left p-4 font-medium">Nom</th>
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Niveau</th>
                      <th className="text-left p-4 font-medium">Abonnés</th>
                      <th className="text-left p-4 font-medium">Statut</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(influencersData?.influencers ?? []).map((inf: any) => (
                      <tr key={inf.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium">{inf.fullName}</td>
                        <td className="p-4 text-muted-foreground">{inf.email}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">{inf.level}</Badge>
                        </td>
                        <td className="p-4">{inf.totalFollowers?.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[inf.status] ?? ""}`}>
                            {inf.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {inf.status !== "active" && (
                              <Button size="sm" variant="ghost" className="h-7 text-green-600 hover:text-green-700" onClick={() => handleInfluencerStatus(inf.id, "active")}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Activer
                              </Button>
                            )}
                            {inf.status !== "suspended" && (
                              <Button size="sm" variant="ghost" className="h-7 text-red-600 hover:text-red-700" onClick={() => handleInfluencerStatus(inf.id, "suspended")}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Suspendre
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(influencersData?.influencers ?? []).length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Aucun influenceur</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Campaigns */}
      {tab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[undefined, "pending", "active", "paused", "rejected"].map(s => (
              <Button
                key={s ?? "all"}
                variant={campaignFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setCampaignFilter(s)}
              >
                {s === undefined ? "Toutes" : s === "pending" ? "En attente" : s === "active" ? "Actives" : s === "paused" ? "Pausées" : "Rejetées"}
              </Button>
            ))}
          </div>
          {campaignsLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-muted-foreground text-xs uppercase">
                      <th className="text-left p-4 font-medium">Campagne</th>
                      <th className="text-left p-4 font-medium">Partenaire</th>
                      <th className="text-left p-4 font-medium">Commission</th>
                      <th className="text-left p-4 font-medium">Statut</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(campaignsData?.campaigns ?? []).map((c: any) => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium">{c.title}</td>
                        <td className="p-4 text-muted-foreground">{c.partnerName}</td>
                        <td className="p-4">{c.commissionAmount} DT <span className="text-xs text-muted-foreground">({c.commissionModel?.toUpperCase()})</span></td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] ?? ""}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {c.status !== "active" && (
                              <Button size="sm" variant="ghost" className="h-7 text-green-600 hover:text-green-700" onClick={() => handleCampaignStatus(c.id, "active")}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Valider
                              </Button>
                            )}
                            {c.status === "active" && (
                              <Button size="sm" variant="ghost" className="h-7 text-orange-600 hover:text-orange-700" onClick={() => handleCampaignStatus(c.id, "paused")}>
                                <PauseCircle className="h-3.5 w-3.5 mr-1" /> Pauser
                              </Button>
                            )}
                            {c.status !== "rejected" && (
                              <Button size="sm" variant="ghost" className="h-7 text-red-600 hover:text-red-700" onClick={() => handleCampaignStatus(c.id, "rejected")}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeter
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(campaignsData?.campaigns ?? []).length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucune campagne</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Categories */}
      {tab === "categories" && (
        <div className="space-y-4">
          {categoriesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(categories ?? []).map((cat: any) => (
                <Card key={cat.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      {cat.icon && <span>{cat.icon}</span>}
                      {cat.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {(cat.subCategories ?? []).map((sub: any) => (
                        <Badge key={sub.id} variant="secondary" className="text-xs">{sub.name}</Badge>
                      ))}
                      {(cat.subCategories ?? []).length === 0 && (
                        <span className="text-xs text-muted-foreground">Aucune sous-catégorie</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plans */}
      {tab === "plans" && (
        <div className="space-y-4">
          {plansLoading ? (
            <div className="grid gap-4 md:grid-cols-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {(plans ?? []).map((plan: any) => (
                <Card key={plan.id} className={!plan.isActive ? "opacity-60" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      <Badge variant={plan.isActive ? "default" : "secondary"}>{plan.isActive ? "Actif" : "Inactif"}</Badge>
                    </CardTitle>
                    <CardDescription className="text-2xl font-bold text-foreground">{plan.priceMonthly} DT<span className="text-sm font-normal text-muted-foreground">/mois</span></CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-1">
                    <p>Max campagnes : {plan.maxCampaigns ?? "Illimité"}</p>
                    <p>Niveaux : {plan.allowedLevels}</p>
                    <p className="capitalize">Tier : {plan.tier}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
