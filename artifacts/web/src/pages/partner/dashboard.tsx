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
  usePartnerCampaignPerformance,
} from "@/hooks/useApi";
import { useListCategories } from "@workspace/api-client-react";
import {
  MousePointerClick, TrendingUp, ShoppingCart, DollarSign,
  Plus, Trash2, Users, Target, BarChart3, CreditCard,
  ChevronLeft, Code, Copy, Globe, Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Tab = "dashboard" | "campaigns" | "influencers" | "performance" | "integration";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Tableau de bord" },
  { id: "campaigns", label: "Mes campagnes" },
  { id: "influencers", label: "Annuaire influenceurs" },
  { id: "performance", label: "Performance" },
  { id: "integration", label: "Intégration" },
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

// ─── Performance Tab ───────────────────────────────────────────────────────────
function PerformanceTab() {
  const { data: campaignsData, isLoading } = usePartnerCampaigns({ limit: 50 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: perf, isLoading: perfLoading } = usePartnerCampaignPerformance(selectedId);

  if (selectedId !== null) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Retour à la liste
        </button>

        {perfLoading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : perf ? (
          <>
            <div>
              <h2 className="font-semibold text-lg">{perf.campaign?.title}</h2>
              <p className="text-sm text-muted-foreground capitalize">{perf.campaign?.commissionModel?.toUpperCase()} — {perf.campaign?.commissionAmount} DT / conversion</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <StatCard title="Influenceurs" value={perf.summary?.totalInfluencers} icon={Users} />
              <StatCard title="Clics" value={perf.summary?.totalClicks?.toLocaleString()} icon={MousePointerClick} color="text-blue-500" />
              <StatCard title="Ventes" value={perf.summary?.totalSales} icon={ShoppingCart} color="text-green-500" />
              <StatCard title="Commissions" value={`${perf.summary?.totalEarnings ?? "0"} DT`} icon={DollarSign} color="text-amber-500" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Détail par influenceur</CardTitle>
                <CardDescription>Performance de chaque lien d'affiliation</CardDescription>
              </CardHeader>
              <CardContent>
                {(perf.influencerLinks ?? []).length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Users className="mx-auto h-10 w-10 mb-3 text-muted-foreground/40" />
                    <p>Aucun influenceur n'a encore rejoint cette campagne.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {(perf.influencerLinks ?? []).map((link: any) => (
                      <div key={link.linkId} className="flex items-center justify-between py-3 gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                            {link.influencerName?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{link.influencerName}</p>
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${LEVEL_COLORS[link.influencerLevel] ?? ""}`}>{link.influencerLevel}</span>
                              <span className="text-xs text-muted-foreground font-mono">{link.code}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm shrink-0">
                          <div className="text-center">
                            <p className="font-semibold">{link.totalClicks}</p>
                            <p className="text-xs text-muted-foreground">Clics</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">{link.totalSales}</p>
                            <p className="text-xs text-muted-foreground">Ventes</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-primary">{link.totalEarnings} DT</p>
                            <p className="text-xs text-muted-foreground">Commissions</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Campagne introuvable.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-lg">Performance par campagne</h2>
        <p className="text-sm text-muted-foreground">Sélectionnez une campagne pour voir les stats détaillées.</p>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : (campaignsData?.campaigns ?? []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BarChart3 className="mx-auto h-12 w-12 mb-4 text-muted-foreground/40" />
          <p>Aucune campagne créée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(campaignsData?.campaigns ?? []).map((c: any) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="w-full text-left"
            >
              <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{c.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[c.status] ?? ""}`}>{c.status}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{c.commissionAmount} DT / {c.commissionModel?.toUpperCase()}</span>
                      <span>👆 {c.totalClicks} clics</span>
                      <span>🛒 {c.totalSales} ventes</span>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Integration Tab ───────────────────────────────────────────────────────────
function IntegrationTab() {
  const { toast } = useToast();
  const { data: stats } = usePartnerStats();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://voya.tn";

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !" });
  };

  const snippetPurchase = `// Signaler une vente (CPA)
fetch("${baseUrl}/api/tracking/event", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    code: "CODE_AFFILIATION",   // ex: "XK7P2Q"
    eventType: "purchase",
    amount: "149.00",           // montant de la vente (optionnel)
    externalRef: "ORDER-12345", // votre référence commande
  })
});`;

  const snippetLead = `// Signaler un lead (CPL)
fetch("${baseUrl}/api/tracking/event", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    code: "CODE_AFFILIATION",
    eventType: "lead",
    externalRef: "FORM-SUBMIT-789",
  })
});`;

  const snippetPixel = `<!-- Pixel VOYA — à placer sur votre page de confirmation -->
<script>
(function() {
  var code = new URLSearchParams(window.location.search).get('voya_code');
  if (code) {
    fetch("${baseUrl}/api/tracking/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code, eventType: "purchase" })
    });
  }
})();
<\/script>`;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-semibold text-lg">Intégration partenaire</h2>
        <p className="text-sm text-muted-foreground">
          Envoyez vos événements de conversion à VOYA depuis votre site e-commerce.
        </p>
      </div>

      {/* How it works */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Globe, title: "1. Lien affilié", desc: "L'influenceur partage un lien /r/CODE qui redirige vers votre site et enregistre le clic." },
          { icon: Zap, title: "2. Événement", desc: "Votre site envoie un événement VOYA lors d'un achat ou d'un formulaire soumis." },
          { icon: DollarSign, title: "3. Commission", desc: "VOYA calcule automatiquement la commission et crédite l'influenceur." },
        ].map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="border-dashed">
            <CardContent className="p-4">
              <Icon className="h-6 w-6 text-primary mb-2" />
              <p className="font-medium text-sm mb-1">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Endpoint */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
            <span className="text-green-600 font-bold text-xs shrink-0">POST</span>
            <span className="flex-1 truncate">{baseUrl}/api/tracking/event</span>
            <button onClick={() => copy(`${baseUrl}/api/tracking/event`)} className="shrink-0">
              <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Aucune clé API requise. Seul le <code className="bg-muted px-1 rounded">code</code> d'affiliation est nécessaire pour identifier l'influenceur.
          </p>
        </CardContent>
      </Card>

      {/* Payload schema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Champs du payload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Champ</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Type</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Requis</th>
                  <th className="pb-2 font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { field: "code", type: "string", required: "Oui", desc: "Code du lien affilié (ex: XK7P2Q)" },
                  { field: "eventType", type: "\"purchase\" | \"lead\" | \"view\"", required: "Oui", desc: "Type d'événement" },
                  { field: "amount", type: "string", required: "Non", desc: "Montant de la vente en DT (optionnel)" },
                  { field: "externalRef", type: "string", required: "Non", desc: "Votre référence commande/lead interne" },
                  { field: "metadata", type: "string", required: "Non", desc: "Données supplémentaires libres (JSON stringifié)" },
                ].map(row => (
                  <tr key={row.field}>
                    <td className="py-2 pr-4 font-mono text-xs text-primary">{row.field}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{row.type}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${row.required === "Oui" ? "bg-red-50 text-red-600" : "bg-muted text-muted-foreground"}`}>
                        {row.required}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Code snippets */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <CardTitle className="text-base">Exemple — Signaler une vente (CPA)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-[#0d1117] text-[#e6edf3] rounded-lg p-4 text-xs overflow-x-auto leading-relaxed">
              <code>{snippetPurchase}</code>
            </pre>
            <button
              onClick={() => copy(snippetPurchase)}
              className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Copy className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <CardTitle className="text-base">Exemple — Signaler un lead (CPL)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-[#0d1117] text-[#e6edf3] rounded-lg p-4 text-xs overflow-x-auto leading-relaxed">
              <code>{snippetLead}</code>
            </pre>
            <button
              onClick={() => copy(snippetLead)}
              className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Copy className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <CardTitle className="text-base">Pixel côté navigateur (page de confirmation)</CardTitle>
          </div>
          <CardDescription>À placer sur votre page de confirmation de commande. Lit le code du paramètre URL <code className="bg-muted px-1 rounded">voya_code</code>.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-[#0d1117] text-[#e6edf3] rounded-lg p-4 text-xs overflow-x-auto leading-relaxed">
              <code>{snippetPixel}</code>
            </pre>
            <button
              onClick={() => copy(snippetPixel)}
              className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Copy className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4 flex gap-3">
          <Zap className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Lien de redirection affilié</p>
            <p className="text-xs text-blue-700 mt-1">
              Chaque influenceur obtient un lien unique de la forme <code className="bg-blue-100 px-1 rounded">{baseUrl}/r/CODE</code>.
              Ce lien enregistre automatiquement le clic et redirige vers votre URL produit.
              Le code est inclus comme paramètre <code className="bg-blue-100 px-1 rounded">voya_code</code> dans la redirection si vous ajoutez <code className="bg-blue-100 px-1 rounded">?voya_code=CODE</code> à votre URL produit.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
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
                <a href="?tab=campaigns">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Nouvelle
                  </Button>
                </a>
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
                    <div className="flex items-center gap-1">
                      <a href="?tab=performance">
                        <Button size="sm" variant="ghost" className="text-primary hover:text-primary shrink-0">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </a>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 shrink-0" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

      {/* Performance */}
      {tab === "performance" && <PerformanceTab />}

      {/* Integration */}
      {tab === "integration" && <IntegrationTab />}
    </DashboardLayout>
  );
}
