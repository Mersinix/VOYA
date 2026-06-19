import React, { useState } from "react";
import { useSearch } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  usePartnerStats, usePartnerCampaigns, usePartnerInfluencers,
  usePartnerSubscription, useCreateCampaign, useDeleteCampaign,
} from "@/hooks/useApi";
import { useListCategories } from "@workspace/api-client-react";
import {
  MousePointerClick, TrendingUp, ShoppingCart, DollarSign,
  Plus, Trash2, Users, Target, BarChart3, CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Tab = "dashboard" | "campaigns" | "influencers";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Tableau de bord" },
  { id: "campaigns", label: "Mes campagnes" },
  { id: "influencers", label: "Annuaire influenceurs" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  paused: "bg-orange-100 text-orange-800",
  completed: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
};

const LEVEL_COLORS: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-800",
  silver: "bg-gray-100 text-gray-800",
  gold: "bg-yellow-100 text-yellow-800",
  platinum: "bg-purple-100 text-purple-800",
};

function StatCard({ title, value, sub, icon: Icon, color = "text-primary" }: any) {
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

function CreateCampaignForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: categories } = useListCategories();
  const create = useCreateCampaign();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "", description: "", productUrl: "", productPrice: "",
    commissionModel: "cpa" as "cpa" | "cpl", commissionAmount: "",
    minInfluencerLevel: "bronze" as "bronze" | "silver" | "gold" | "platinum",
    categoryId: undefined as number | undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(form, {
      onSuccess: () => {
        toast({ title: "Campagne créée avec succès !" });
        onSuccess();
      },
      onError: (err: any) => toast({ title: "Erreur", description: err?.message, variant: "destructive" }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Titre de la campagne *</Label>
          <Input placeholder="Ex: Programme d'affiliation BeautyTN" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>URL du produit *</Label>
          <Input placeholder="https://votre-site.com/produit" required value={form.productUrl} onChange={e => setForm(f => ({ ...f, productUrl: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea placeholder="Décrivez votre campagne d'affiliation..." required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Modèle de commission *</Label>
          <Select value={form.commissionModel} onValueChange={v => setForm(f => ({ ...f, commissionModel: v as "cpa" | "cpl" }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cpa">CPA — Par vente</SelectItem>
              <SelectItem value="cpl">CPL — Par lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Montant commission (DT) *</Label>
          <Input placeholder="15.00" required value={form.commissionAmount} onChange={e => setForm(f => ({ ...f, commissionAmount: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Niveau minimum influenceur</Label>
          <Select value={form.minInfluencerLevel} onValueChange={v => setForm(f => ({ ...f, minInfluencerLevel: v as any }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select onValueChange={v => setForm(f => ({ ...f, categoryId: parseInt(v, 10) }))}>
            <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
            <SelectContent>
              {(categories ?? []).map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Prix produit (DT)</Label>
          <Input placeholder="99.00" value={form.productPrice} onChange={e => setForm(f => ({ ...f, productPrice: e.target.value }))} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? "Création en cours..." : "Créer la campagne"}
      </Button>
    </form>
  );
}

export default function PartnerDashboard() {
  const search = useSearch();
  const tab = (new URLSearchParams(search).get("tab") as Tab) || "dashboard";
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = usePartnerStats();
  const { data: campaignsData, isLoading: campaignsLoading } = usePartnerCampaigns({ limit: 50 });
  const { data: influencersData, isLoading: influencersLoading } = usePartnerInfluencers({ level: levelFilter, limit: 50 });
  const { data: subscription } = usePartnerSubscription();
  const deleteCampaign = useDeleteCampaign();

  const handleDelete = (id: number) => {
    if (!confirm("Supprimer cette campagne ?")) return;
    deleteCampaign.mutate(id, {
      onSuccess: () => toast({ title: "Campagne supprimée" }),
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  return (
    <DashboardLayout title="Espace Partenaire" role="partner">
      <div className="flex gap-1 overflow-x-auto border-b mb-6 pb-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { window.location.search = `?tab=${t.id}`; }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Dashboard KPIs */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Campagnes actives" value={stats?.activeCampaigns} sub={`${stats?.totalCampaigns} au total`} icon={Target} />
              <StatCard title="Influenceurs actifs" value={stats?.totalInfluencers} icon={Users} color="text-blue-500" />
              <StatCard title="Clics totaux" value={stats?.totalClicks?.toLocaleString()} icon={MousePointerClick} color="text-green-500" />
              <StatCard title="Commissions versées" value={`${stats?.totalCommissions ?? "0"} DT`} icon={DollarSign} color="text-amber-500" />
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Campagnes récentes</CardTitle>
                  <CardDescription>Vos programmes d'affiliation actifs</CardDescription>
                </div>
                <Button size="sm" onClick={() => { window.location.search = "?tab=campaigns"; setShowCreateForm(true); }}>
                  <Plus className="h-4 w-4 mr-1" /> Nouvelle
                </Button>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
                ) : (campaignsData?.campaigns ?? []).length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Target className="mx-auto h-10 w-10 mb-3 text-muted-foreground/50" />
                    <p>Aucune campagne. Créez la première !</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(campaignsData?.campaigns ?? []).slice(0, 5).map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="font-medium text-sm">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.commissionAmount} DT · {c.commissionModel?.toUpperCase()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] ?? ""}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#1E1B4B] text-white border-0">
              <CardHeader>
                <CardTitle className="text-white">Abonnement actuel</CardTitle>
                <CardDescription className="text-gray-400">Plan souscrit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {subscription ? (
                  <>
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-gray-300 text-sm">Plan</span>
                      <Badge className="bg-primary">{subscription.plan?.name}</Badge>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-gray-300 text-sm">Prix</span>
                      <span className="font-semibold">{subscription.plan?.priceMonthly} DT/mois</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Campagnes max</span>
                      <span>{subscription.plan?.maxCampaigns ?? "Illimité"}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">Aucun abonnement actif</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">Changer de plan</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* Campaigns */}
      {tab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Mes campagnes ({campaignsData?.total ?? 0})</h2>
            <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-1" /> {showCreateForm ? "Annuler" : "Nouvelle campagne"}
            </Button>
          </div>

          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Créer une nouvelle campagne</CardTitle>
                <CardDescription>La campagne sera soumise pour validation par l'admin.</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateCampaignForm onSuccess={() => setShowCreateForm(false)} />
              </CardContent>
            </Card>
          )}

          {campaignsLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-3">
              {(campaignsData?.campaigns ?? []).map((c: any) => (
                <Card key={c.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{c.title}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[c.status] ?? ""}`}>{c.status}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{c.commissionAmount} DT / {c.commissionModel?.toUpperCase()}</span>
                        <span>Niveau min: {c.minInfluencerLevel}</span>
                        <span>{c.totalClicks} clics · {c.totalSales} ventes</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 shrink-0" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {(campaignsData?.campaigns ?? []).length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <BarChart3 className="mx-auto h-12 w-12 mb-4 text-muted-foreground/40" />
                  <p>Aucune campagne. Créez votre première !</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Influencer Directory */}
      {tab === "influencers" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[undefined, "bronze", "silver", "gold", "platinum"].map(l => (
              <Button
                key={l ?? "all"}
                variant={levelFilter === l ? "default" : "outline"}
                size="sm"
                onClick={() => setLevelFilter(l)}
                className="capitalize"
              >
                {l === undefined ? "Tous les niveaux" : l}
              </Button>
            ))}
          </div>
          {influencersLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(influencersData?.influencers ?? []).map((inf: any) => (
                <Card key={inf.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                        {inf.fullName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{inf.fullName}</p>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${LEVEL_COLORS[inf.level] ?? ""}`}>{inf.level}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{inf.country}</p>
                        <p className="text-xs font-medium mt-1">{inf.totalFollowers?.toLocaleString()} abonnés</p>
                        {inf.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{inf.bio}</p>}
                        <div className="flex gap-2 mt-2">
                          {inf.instagramUrl && <span className="text-xs text-muted-foreground">📸 Instagram</span>}
                          {inf.tiktokUrl && <span className="text-xs text-muted-foreground">🎵 TikTok</span>}
                          {inf.youtubeUrl && <span className="text-xs text-muted-foreground">▶️ YouTube</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(influencersData?.influencers ?? []).length === 0 && (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4 text-muted-foreground/40" />
                  <p>Aucun influenceur trouvé pour ce filtre.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
