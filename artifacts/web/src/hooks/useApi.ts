import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

const BASE = "/api";

// ─── Generic helpers ──────────────────────────────────────────────────────────
async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(BASE + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  return customFetch<T>(url.pathname + url.search);
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  return customFetch<T>(BASE + path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
    headers: { "Content-Type": "application/json" },
  });
}

async function put<T>(path: string, body?: unknown): Promise<T> {
  return customFetch<T>(BASE + path, {
    method: "PUT",
    body: JSON.stringify(body ?? {}),
    headers: { "Content-Type": "application/json" },
  });
}

async function del<T>(path: string): Promise<T> {
  return customFetch<T>(BASE + path, { method: "DELETE" });
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────
export function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: () => get<any>("/admin/stats") });
}

export function useAdminPartners(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin", "partners", params],
    queryFn: () => get<any>("/admin/partners", params as any),
  });
}

export function useAdminInfluencers(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin", "influencers", params],
    queryFn: () => get<any>("/admin/influencers", params as any),
  });
}

export function useAdminCampaigns(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin", "campaigns", params],
    queryFn: () => get<any>("/admin/campaigns", params as any),
  });
}

export function useAdminPlans() {
  return useQuery({ queryKey: ["admin", "plans"], queryFn: () => get<any[]>("/admin/plans") });
}

export function useUpdatePartnerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      put(`/admin/partners/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "partners"] }),
  });
}

export function useUpdateInfluencerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      put(`/admin/influencers/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "influencers"] }),
  });
}

export function useUpdateCampaignStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      put(`/admin/campaigns/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "campaigns"] }),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; icon?: string }) =>
      post("/admin/categories", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// ─── Partner hooks ────────────────────────────────────────────────────────────
export function usePartnerStats() {
  return useQuery({ queryKey: ["partner", "stats"], queryFn: () => get<any>("/partner/stats") });
}

export function usePartnerCampaigns(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["partner", "campaigns", params],
    queryFn: () => get<any>("/partner/campaigns", params as any),
  });
}

export function usePartnerInfluencers(params?: { level?: string; country?: string; minFollowers?: number; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["partner", "influencers", params],
    queryFn: () => get<any>("/partner/influencers", params as any),
  });
}

export function usePartnerSubscription() {
  return useQuery({ queryKey: ["partner", "subscription"], queryFn: () => get<any>("/partner/subscription") });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => post("/partner/campaigns", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partner", "campaigns"] });
      qc.invalidateQueries({ queryKey: ["partner", "stats"] });
    },
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; [key: string]: any }) =>
      put(`/partner/campaigns/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner", "campaigns"] }),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del(`/partner/campaigns/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partner", "campaigns"] });
      qc.invalidateQueries({ queryKey: ["partner", "stats"] });
    },
  });
}

// ─── Influencer hooks ─────────────────────────────────────────────────────────
export function useInfluencerStats() {
  return useQuery({ queryKey: ["influencer", "stats"], queryFn: () => get<any>("/influencer/stats") });
}

export function useInfluencerAvailableCampaigns(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["influencer", "campaigns", "available", params],
    queryFn: () => get<any>("/influencer/campaigns/available", params as any),
  });
}

export function useInfluencerMyCampaigns() {
  return useQuery({
    queryKey: ["influencer", "campaigns", "mine"],
    queryFn: () => get<any[]>("/influencer/campaigns/mine"),
  });
}

export function useInfluencerLeaderboard(params?: { period?: string }) {
  return useQuery({
    queryKey: ["influencer", "leaderboard", params],
    queryFn: () => get<any[]>("/influencer/leaderboard", params as any),
  });
}

export function usePartnerCampaignPerformance(campaignId: number | null) {
  return useQuery({
    queryKey: ["partner", "campaigns", campaignId, "performance"],
    queryFn: () => get<any>(`/partner/campaigns/${campaignId}/performance`),
    enabled: campaignId !== null,
  });
}

export function useInfluencerWithdrawals() {
  return useQuery({
    queryKey: ["influencer", "withdrawals"],
    queryFn: () => get<any[]>("/influencer/withdrawals"),
  });
}

export function useJoinCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: number) => post(`/influencer/campaigns/${campaignId}/join`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["influencer", "campaigns"] });
      qc.invalidateQueries({ queryKey: ["influencer", "stats"] });
    },
  });
}

export function useUpdateInfluencerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => put("/influencer/profile", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["influencer", "stats"] }),
  });
}

export function useRequestWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { amount: string; paymentMethod: string; paymentDetails: string }) =>
      post("/influencer/withdrawal", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["influencer", "withdrawals"] });
      qc.invalidateQueries({ queryKey: ["influencer", "stats"] });
    },
  });
}
