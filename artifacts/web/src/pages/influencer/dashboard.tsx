import React, { useState, useEffect } from "react";
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
  useInfluencerStats, useInfluencerProfile, useInfluencerAvailableCampaigns, useInfluencerMyCampaigns,
  useInfluencerLeaderboard, useInfluencerWithdrawals, useJoinCampaign,
  useUpdateInfluencerProfile, useRequestWithdrawal,
} from "@/hooks/useApi";
import {
  TrendingUp, DollarSign, MousePointerClick, ShoppingCart,
  Copy, Trophy, Wallet, Star, CheckCircle, Link as LinkIcon,
  ExternalLink, ChevronLeft, Instagram, Youtube, Facebook,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "wouter";

// ─── Level system ──────────────────────────────────────────────────────────────
const LEVEL_ORDER = ["bronze", "silver", "gold", "platinum"];
const LEVEL_THRESHOLDS: Record<string, number> = { bronze: 0, silver: 500, gold: 2000, platinum: 5000 };
const LEVEL_NEXT: Record<string, string | null> = { bronze: "silver", silver: "gold", gold: "platinum", platinum: null };

function getProgressToNext(level: string, totalEarnings: number) {
  const current = LEVEL_THRESHOLDS[level] ?? 0;
  const nextLevel = LEVEL_NEXT[level];
  if (!nextLevel) return { percent: 100, current: totalEarnings, next: null, nextName: null };
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel] ?? 999999;
  const range = nextThreshold - current;
  const progress = Math.min(totalEarnings - current, range);
  return { percent: Math.max(0, Math.round((progress / range) * 100)), current: progress, next: range, nextName: nextLevel };
}

// ─── Leaderboard Tab ───────────────────────────────────────────────────────────
function LeaderboardTab({ stats }: { stats: any }) {
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("all");
  const { data: leaderboard, isLoading } = useInfluencerLeaderboard({ period });

  const top3 = (leaderboard ?? []).slice(0, 3);
  const rest = (leaderboard ?? []).slice(3);

  const myLevel = stats?.level ?? "bronze";
  const myEarnings = parseFloat(stats?.totalEarnings ?? "0");
  const progress = getProgressToNext(myLevel, myEarnings);

  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = ["h-24", "h-32", "h-20"];
  const podiumTrophies = ["🥈", "🥇", "🥉"];
  const podiumRings = [
    "ring-2 ring-gray-300",
    "ring-4 ring-yellow-400 shadow-yellow-200 shadow-lg",
    "ring-2 ring-amber-500",
  ];

  return (
    <div className="space-y-6">
      {/* My level progress */}
      {stats && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{LEVEL_EMOJIS[myLevel]}</span>
                <div>
                  <p className="font-semibold text-sm">Mon niveau : <span className="text-primary capitalize">{myLevel}</span></p>
                  <p className="text-xs text-muted-foreground">{myEarnings.toFixed(2)} DT gagnés</p>
                </div>
              </div>
              {progress.nextName ? (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Prochain niveau</p>
                  <p className="text-sm font-semibold capitalize text-primary">{progress.nextName}</p>
                </div>
              ) : (
                <Badge className="bg-purple-600 text-white">Niveau max !</Badge>
              )}
            </div>
            {progress.nextName && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{progress.current} DT / {progress.next} DT</span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Period filter */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">🏆 Classement des créateurs</h2>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["7d", "30d", "all"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "7d" ? "7 jours" : p === "30d" ? "30 jours" : "Tout"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : (
        <>
          {/* Podium top 3 */}
          {top3.length === 3 && (
            <div className="flex items-end justify-center gap-4 py-6 px-4 bg-gradient-to-b from-yellow-50 to-transparent rounded-xl border border-yellow-100">
              {podiumOrder.map((inf: any, pos: number) => inf ? (
                <div key={inf.id} className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
                  <span className="text-2xl">{podiumTrophies[pos]}</span>
                  <div className={`w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary ${podiumRings[pos]}`}>
                    {inf.photoUrl ? (
                      <img src={inf.photoUrl} alt={inf.fullName} className="w-full h-full rounded-full object-cover" />
                    ) : inf.fullName?.charAt(0)}
                  </div>
                  <p className="font-semibold text-xs text-center truncate w-full text-center">{inf.fullName}</p>
                  <p className="text-xs font-bold text-primary">{parseFloat(inf.earnings ?? inf.totalEarnings ?? "0").toFixed(0)} DT</p>
                  <div className={`${podiumHeights[pos]} w-full rounded-t-lg flex items-end justify-center pb-2 ${
                    pos === 1 ? "bg-yellow-400/20" : pos === 0 ? "bg-gray-300/30" : "bg-amber-400/20"
                  }`}>
                    <span className="text-xs font-bold text-muted-foreground">#{pos === 1 ? 1 : pos === 0 ? 2 : 3}</span>
                  </div>
                </div>
              ) : null)}
            </div>
          )}

          {/* Rest of ranking */}
          <Card>
            <div className="divide-y">
              {rest.map((inf: any) => (
                <div key={inf.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                    {inf.rank}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {inf.photoUrl ? (
                      <img src={inf.photoUrl} alt={inf.fullName} className="w-full h-full rounded-full object-cover" />
                    ) : inf.fullName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{inf.fullName}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${LEVEL_COLORS[inf.level] ?? ""}`}>{inf.level}</span>
                      <p className="text-xs text-muted-foreground">{inf.totalFollowers?.toLocaleString()} abonnés</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-primary">{parseFloat(inf.earnings ?? inf.totalEarnings ?? "0").toFixed(2)} DT</p>
                    <p className="text-xs text-muted-foreground">{LEVEL_EMOJIS[inf.level]}</p>
                  </div>
                </div>
              ))}
              {(leaderboard ?? []).length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Trophy className="mx-auto h-10 w-10 mb-3 text-muted-foreground/40" />
                  <p>Aucun classement disponible pour cette période.</p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

type Tab = "dashboard" | "marketplace" | "links" | "leaderboard" | "profile" | "withdrawal";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Tableau de bord" },
  { id: "marketplace", label: "Marketplace" },
  { id: "links", label: "Mes liens" },
  { id: "leaderboard", label: "Classement" },
  { id: "profile", label: "Profil" },
  { id: "withdrawal", label: "Retrait" },
];

const LEVEL_COLORS: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-800",
  silver: "bg-gray-100 text-gray-700",
  gold: "bg-yellow-100 text-yellow-800",
  platinum: "bg-purple-100 text-purple-800",
};

const LEVEL_EMOJIS: Record<string, string> = {
  bronze: "🥉", silver: "🥈", gold: "🥇", platinum: "💎",
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

export default function InfluencerDashboard() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const activeTab = (params.get("tab") as Tab) || "dashboard";
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useInfluencerStats();
  const { data: profile, isLoading: profileLoading } = useInfluencerProfile();
  const { data: availableCampaigns, isLoading: availableLoading } = useInfluencerAvailableCampaigns({ limit: 50 });
  const { data: myCampaigns, isLoading: myLoading } = useInfluencerMyCampaigns();
  const { data: withdrawals } = useInfluencerWithdrawals();

  const joinCampaign = useJoinCampaign();
  const updateProfile = useUpdateInfluencerProfile();
  const requestWithdrawal = useRequestWithdrawal();

  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

  const [profileForm, setProfileForm] = useState({
    fullName: "", bio: "", phone: "", country: "", photoUrl: "",
    instagramUrl: "", instagramFollowers: 0,
    tiktokUrl: "", tiktokFollowers: 0,
    youtubeUrl: "", youtubeFollowers: 0,
    facebookUrl: "", facebookFollowers: 0,
  });
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "", paymentMethod: "", paymentDetails: "",
  });

  // Pre-populate profile form when data loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName ?? "",
        bio: profile.bio ?? "",
        phone: profile.phone ?? "",
        country: profile.country ?? "",
        photoUrl: profile.photoUrl ?? "",
        instagramUrl: profile.instagramUrl ?? "",
        instagramFollowers: profile.instagramFollowers ?? 0,
        tiktokUrl: profile.tiktokUrl ?? "",
        tiktokFollowers: profile.tiktokFollowers ?? 0,
        youtubeUrl: profile.youtubeUrl ?? "",
        youtubeFollowers: profile.youtubeFollowers ?? 0,
        facebookUrl: profile.facebookUrl ?? "",
        facebookFollowers: profile.facebookFollowers ?? 0,
      });
    }
  }, [profile]);

  const handleJoin = (campaignId: number) => {
    joinCampaign.mutate(campaignId, {
      onSuccess: (data: any) => {
        toast({ title: "Campagne rejointe !", description: `Votre lien: ${data.affiliateUrl}` });
      },
      onError: (err: any) => toast({ title: "Erreur", description: err?.data?.error || err?.message, variant: "destructive" }),
    });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profileForm, {
      onSuccess: (data: any) => toast({ title: "Profil mis à jour", description: `Niveau: ${data.level}` }),
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestWithdrawal.mutate(withdrawalForm, {
      onSuccess: () => {
        toast({ title: "Demande de retrait envoyée !" });
        setWithdrawalForm({ amount: "", paymentMethod: "", paymentDetails: "" });
      },
      onError: (err: any) => toast({ title: "Erreur", description: err?.data?.error || err?.message, variant: "destructive" }),
    });
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Lien copié !" });
  };

  const tab = activeTab;

  return (
    <DashboardLayout title="Espace Créateur" role="influencer">
      {/* Tab nav */}
      <div className="flex gap-1 overflow-x-auto border-b mb-6 pb-0">
        {TABS.map(t => (
          <a
            key={t.id}
            href={`?tab=${t.id}`}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {/* ── Dashboard ── */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Revenus totaux" value={`${stats?.totalEarnings ?? "0"} DT`} icon={DollarSign} color="text-green-500" />
                <StatCard title="Campagnes actives" value={stats?.activeCampaigns} sub={`${stats?.totalCampaigns} au total`} icon={TrendingUp} />
                <StatCard title="Clics générés" value={stats?.totalClicks?.toLocaleString()} icon={MousePointerClick} color="text-blue-500" />
                <StatCard title="Ventes réalisées" value={stats?.totalSales} icon={ShoppingCart} color="text-amber-500" />
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1 bg-primary text-primary-foreground border-0">
                  <CardHeader>
                    <CardTitle className="text-primary-foreground/80 text-sm font-medium">Solde disponible</CardTitle>
                    <div className="text-3xl font-bold">{stats?.availableBalance ?? "0"} DT</div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${LEVEL_COLORS[stats?.level] ?? "bg-white/20 text-white"}`}>
                        {LEVEL_EMOJIS[stats?.level] ?? ""} {stats?.level?.toUpperCase()}
                      </span>
                      <span className="text-primary-foreground/70 text-xs">{stats?.totalFollowers?.toLocaleString()} abonnés</span>
                    </div>
                    <p className="text-primary-foreground/60 text-xs">En attente: {stats?.pendingWithdrawal ?? "0"} DT</p>
                  </CardContent>
                  <CardFooter>
                    <a href="?tab=withdrawal" className="w-full">
                      <Button variant="secondary" className="w-full">
                        <Wallet className="h-4 w-4 mr-2" /> Demander un retrait
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Mes derniers liens</CardTitle>
                      <CardDescription>Performances de vos campagnes récentes</CardDescription>
                    </div>
                    <a href="?tab=marketplace"><Button size="sm" variant="outline">Explorer</Button></a>
                  </CardHeader>
                  <CardContent>
                    {myLoading ? (
                      <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
                    ) : (myCampaigns ?? []).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <LinkIcon className="mx-auto h-8 w-8 mb-3 text-muted-foreground/40" />
                        <p className="text-sm">Rejoignez votre première campagne !</p>
                        <a href="?tab=marketplace"><Button size="sm" className="mt-3">Voir le marketplace</Button></a>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(myCampaigns ?? []).slice(0, 4).map((link: any) => (
                          <div key={link.linkId} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
                            <div>
                              <p className="font-medium text-sm">{link.title}</p>
                              <p className="text-xs text-muted-foreground">{link.totalClicks} clics · {link.totalSales} ventes · {link.totalEarnings} DT</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => copyLink(link.affiliateUrl)}>
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Marketplace ── */}
      {tab === "marketplace" && (
        <div className="space-y-4">
          {selectedCampaign ? (
            /* ── Campaign Detail View ── */
            <div className="space-y-5">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Retour aux campagnes
              </button>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main info */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-xl leading-tight">{selectedCampaign.title}</CardTitle>
                          <CardDescription className="mt-1">{selectedCampaign.partnerName} · {selectedCampaign.categoryName}</CardDescription>
                        </div>
                        <Badge variant="outline" className="capitalize shrink-0">{selectedCampaign.minInfluencerLevel}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Description</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedCampaign.description}</p>
                      </div>
                      {selectedCampaign.productUrl && (
                        <div>
                          <p className="text-sm font-medium mb-1">Lien produit</p>
                          <a
                            href={selectedCampaign.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {selectedCampaign.productUrl}
                          </a>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Influenceurs actifs</p>
                          <p className="font-semibold">{selectedCampaign.totalInfluencers ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ventes totales</p>
                          <p className="font-semibold">{selectedCampaign.totalSales ?? 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Commission + action sidebar */}
                <div className="space-y-4">
                  <Card className="bg-primary text-primary-foreground border-0">
                    <CardHeader>
                      <CardTitle className="text-primary-foreground/80 text-sm">Commission</CardTitle>
                      <div className="text-4xl font-bold">{selectedCampaign.commissionAmount} DT</div>
                      <p className="text-primary-foreground/70 text-sm">
                        par {selectedCampaign.commissionModel === "cpa" ? "vente (CPA)" : "lead (CPL)"}
                      </p>
                    </CardHeader>
                    {selectedCampaign.productPrice && (
                      <CardContent>
                        <div className="bg-white/10 rounded-lg px-3 py-2">
                          <p className="text-xs text-primary-foreground/70">Prix du produit</p>
                          <p className="font-semibold">{selectedCampaign.productPrice} DT</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Niveau requis</span>
                        <span className="font-medium capitalize">{selectedCampaign.minInfluencerLevel}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Catégorie</span>
                        <span className="font-medium">{selectedCampaign.categoryName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Modèle</span>
                        <span className="font-medium uppercase">{selectedCampaign.commissionModel}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedCampaign.alreadyJoined ? (
                    <Button variant="outline" className="w-full text-green-600" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" /> Déjà rejoint
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        handleJoin(selectedCampaign.id);
                        setSelectedCampaign(null);
                      }}
                      disabled={joinCampaign.isPending}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      {joinCampaign.isPending ? "Génération..." : "Générer mon lien"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── Campaign List ── */
            <>
              <div>
                <h2 className="font-semibold text-lg">Campagnes disponibles</h2>
                <p className="text-sm text-muted-foreground">Filtrées selon votre niveau ({stats?.level ?? "bronze"})</p>
              </div>
              {availableLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(availableCampaigns?.campaigns ?? []).map((c: any) => (
                    <Card
                      key={c.id}
                      className={`cursor-pointer transition-all ${c.alreadyJoined ? "opacity-70" : "hover:shadow-md hover:border-primary/30"}`}
                      onClick={() => setSelectedCampaign(c)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm leading-tight">{c.title}</CardTitle>
                          <Badge variant="outline" className="text-xs shrink-0 capitalize">{c.minInfluencerLevel}</Badge>
                        </div>
                        <CardDescription className="text-xs">{c.partnerName} · {c.categoryName}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-lg font-bold text-primary">{c.commissionAmount} DT</p>
                            <p className="text-xs text-muted-foreground">par {c.commissionModel === "cpa" ? "vente" : "lead"}</p>
                          </div>
                          {c.productPrice && <p className="text-sm text-muted-foreground">Produit: {c.productPrice} DT</p>}
                        </div>
                      </CardContent>
                      <CardFooter onClick={e => e.stopPropagation()}>
                        {c.alreadyJoined ? (
                          <Button variant="outline" className="w-full text-green-600" disabled>
                            <CheckCircle className="h-4 w-4 mr-2" /> Déjà rejoint
                          </Button>
                        ) : (
                          <Button className="w-full" onClick={(e) => { e.stopPropagation(); handleJoin(c.id); }} disabled={joinCampaign.isPending}>
                            <LinkIcon className="h-4 w-4 mr-2" /> Générer mon lien
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                  {(availableCampaigns?.campaigns ?? []).length === 0 && (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                      <Star className="mx-auto h-12 w-12 mb-4 text-muted-foreground/40" />
                      <p>Aucune campagne disponible pour votre niveau.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── My Links ── */}
      {tab === "links" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Mes liens d'affiliation ({(myCampaigns ?? []).length})</h2>
          {myLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
          ) : (myCampaigns ?? []).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <LinkIcon className="mx-auto h-12 w-12 mb-4 text-muted-foreground/40" />
              <p>Vous n'avez encore rejoint aucune campagne.</p>
              <a href="?tab=marketplace"><Button className="mt-4">Aller au marketplace</Button></a>
            </div>
          ) : (
            <div className="space-y-3">
              {(myCampaigns ?? []).map((link: any) => (
                <Card key={link.linkId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium truncate">{link.title}</p>
                          <Badge variant="outline" className="text-xs shrink-0">{link.campaignStatus}</Badge>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded bg-muted/50 text-xs font-mono mb-2">
                          <span className="truncate text-muted-foreground">{link.affiliateUrl}</span>
                          <Button size="sm" variant="ghost" className="h-5 px-1 shrink-0" onClick={() => copyLink(link.affiliateUrl)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>👆 {link.totalClicks} clics</span>
                          <span>🛒 {link.totalSales} ventes</span>
                          <span>💰 {link.totalEarnings} DT</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Leaderboard ── */}
      {tab === "leaderboard" && <LeaderboardTab stats={stats} />}

      {/* ── Profile ── */}
      {tab === "profile" && (
        <div className="max-w-2xl space-y-6">
          <h2 className="font-semibold text-lg">Mon profil</h2>
          {profileLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations et réseaux sociaux.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom complet</Label>
                      <Input value={profileForm.fullName} onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Votre nom" />
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+216 XX XXX XXX" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pays</Label>
                      <Input value={profileForm.country} onChange={e => setProfileForm(f => ({ ...f, country: e.target.value }))} placeholder="Tunisie" />
                    </div>
                    <div className="space-y-2">
                      <Label>Photo URL</Label>
                      <Input value={profileForm.photoUrl} onChange={e => setProfileForm(f => ({ ...f, photoUrl: e.target.value }))} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Biographie</Label>
                    <Textarea value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} placeholder="Présentez-vous aux marques..." rows={3} />
                  </div>

                  {/* ── Social Networks ── */}
                  <div className="border-t pt-4 space-y-5">
                    <p className="text-sm font-semibold">Réseaux sociaux</p>

                    {/* Instagram */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Instagram className="h-4 w-4 text-pink-500" /> Instagram
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={profileForm.instagramUrl}
                            onChange={e => setProfileForm(f => ({ ...f, instagramUrl: e.target.value }))}
                            placeholder="https://instagram.com/votreprofil"
                            className="pr-9"
                          />
                          {profileForm.instagramUrl && (
                            <a href={profileForm.instagramUrl} target="_blank" rel="noopener noreferrer"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <Input
                          type="number"
                          min={0}
                          className="w-32"
                          placeholder="Abonnés"
                          value={profileForm.instagramFollowers || ""}
                          onChange={e => setProfileForm(f => ({ ...f, instagramFollowers: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    {/* TikTok */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-black dark:text-white">𝕋</span> TikTok
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={profileForm.tiktokUrl}
                            onChange={e => setProfileForm(f => ({ ...f, tiktokUrl: e.target.value }))}
                            placeholder="https://tiktok.com/@votreprofil"
                            className="pr-9"
                          />
                          {profileForm.tiktokUrl && (
                            <a href={profileForm.tiktokUrl} target="_blank" rel="noopener noreferrer"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <Input
                          type="number"
                          min={0}
                          className="w-32"
                          placeholder="Abonnés"
                          value={profileForm.tiktokFollowers || ""}
                          onChange={e => setProfileForm(f => ({ ...f, tiktokFollowers: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    {/* YouTube */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Youtube className="h-4 w-4 text-red-500" /> YouTube
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={profileForm.youtubeUrl}
                            onChange={e => setProfileForm(f => ({ ...f, youtubeUrl: e.target.value }))}
                            placeholder="https://youtube.com/@votrechannel"
                            className="pr-9"
                          />
                          {profileForm.youtubeUrl && (
                            <a href={profileForm.youtubeUrl} target="_blank" rel="noopener noreferrer"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <Input
                          type="number"
                          min={0}
                          className="w-32"
                          placeholder="Abonnés"
                          value={profileForm.youtubeFollowers || ""}
                          onChange={e => setProfileForm(f => ({ ...f, youtubeFollowers: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    {/* Facebook */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={profileForm.facebookUrl}
                            onChange={e => setProfileForm(f => ({ ...f, facebookUrl: e.target.value }))}
                            placeholder="https://facebook.com/votreprofil"
                            className="pr-9"
                          />
                          {profileForm.facebookUrl && (
                            <a href={profileForm.facebookUrl} target="_blank" rel="noopener noreferrer"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <Input
                          type="number"
                          min={0}
                          className="w-32"
                          placeholder="Abonnés"
                          value={profileForm.facebookFollowers || ""}
                          onChange={e => setProfileForm(f => ({ ...f, facebookFollowers: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Mise à jour..." : "Sauvegarder le profil"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Withdrawal ── */}
      {tab === "withdrawal" && (
        <div className="max-w-2xl space-y-6">
          <h2 className="font-semibold text-lg">Demande de retrait</h2>
          <Card className="bg-primary text-primary-foreground border-0">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/70 text-sm">Solde disponible</p>
                <p className="text-3xl font-bold">{stats?.availableBalance ?? "0"} DT</p>
              </div>
              <Wallet className="h-12 w-12 text-primary-foreground/30" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle demande</CardTitle>
              <CardDescription>Traitement sous 3 à 5 jours ouvrables.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Montant (DT) *</Label>
                  <Input type="number" required placeholder="100.00" value={withdrawalForm.amount} onChange={e => setWithdrawalForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Méthode de paiement *</Label>
                  <Select onValueChange={v => setWithdrawalForm(f => ({ ...f, paymentMethod: v }))}>
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virement">Virement bancaire</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="orange_money">Orange Money</SelectItem>
                      <SelectItem value="poste_tunisienne">Poste Tunisienne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Détails du compte *</Label>
                  <Textarea required placeholder="IBAN, email PayPal, numéro de compte..." value={withdrawalForm.paymentDetails} onChange={e => setWithdrawalForm(f => ({ ...f, paymentDetails: e.target.value }))} />
                </div>
                <Button type="submit" className="w-full" disabled={requestWithdrawal.isPending}>
                  {requestWithdrawal.isPending ? "Envoi en cours..." : "Demander le retrait"}
                </Button>
              </form>
            </CardContent>
          </Card>
          {(withdrawals ?? []).length > 0 && (
            <Card>
              <CardHeader><CardTitle>Historique des retraits</CardTitle></CardHeader>
              <CardContent>
                <div className="divide-y">
                  {(withdrawals ?? []).map((w: any) => (
                    <div key={w.id} className="flex justify-between items-center py-3">
                      <div>
                        <p className="font-medium text-sm">{w.amount} DT</p>
                        <p className="text-xs text-muted-foreground">{w.paymentMethod} · {new Date(w.createdAt).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        w.status === "completed" ? "bg-green-100 text-green-800" :
                        w.status === "processing" ? "bg-blue-100 text-blue-800" :
                        w.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>{w.status}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
