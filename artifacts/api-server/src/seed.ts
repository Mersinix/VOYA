import { db } from "@workspace/db";
import {
  usersTable,
  partnersTable,
  influencersTable,
  categoriesTable,
  subCategoriesTable,
  subscriptionPlansTable,
  partnerSubscriptionsTable,
  campaignsTable,
  affiliateLinksTable,
} from "@workspace/db";
import { hashPassword } from "./lib/auth";
import crypto from "crypto";

async function seed() {
  console.log("🌱 Seeding VOYA database...");

  // --- Subscription Plans ---
  const [starter, business, premium] = await db.insert(subscriptionPlansTable).values([
    {
      name: "Pack Starter",
      tier: "starter",
      priceMonthly: "49",
      maxCampaigns: 3,
      maxInfluencers: 10,
      allowedLevels: "bronze",
      features: JSON.stringify(["3 campagnes actives", "Accès influenceurs Bronze", "Support email"]),
      isActive: true,
    },
    {
      name: "Pack Business",
      tier: "business",
      priceMonthly: "149",
      maxCampaigns: 10,
      maxInfluencers: 50,
      allowedLevels: "bronze,silver",
      features: JSON.stringify(["10 campagnes actives", "Accès Bronze & Silver", "Analytics avancées", "Support prioritaire"]),
      isActive: true,
    },
    {
      name: "Pack Premium",
      tier: "premium",
      priceMonthly: "349",
      maxCampaigns: null,
      maxInfluencers: null,
      allowedLevels: "bronze,silver,gold,platinum",
      features: JSON.stringify(["Campagnes illimitées", "Accès tous niveaux", "Analytics temps réel", "Account manager dédié", "Contrats privés VIP"]),
      isActive: true,
    },
  ]).returning();

  // --- Admin User ---
  const adminHash = await hashPassword("admin123456");
  await db.insert(usersTable).values({
    email: "admin@voya.com",
    passwordHash: adminHash,
    role: "admin",
    status: "active",
  });
  console.log("✅ Admin: admin@voya.com / admin123456");

  // --- Partner Users ---
  const partnerHash = await hashPassword("partner123");
  const [p1User, p2User, p3User] = await db.insert(usersTable).values([
    { email: "beauty@glamour.tn", passwordHash: partnerHash, role: "partner", status: "active" },
    { email: "contact@techpro.tn", passwordHash: partnerHash, role: "partner", status: "active" },
    { email: "info@voyageplus.tn", passwordHash: partnerHash, role: "partner", status: "pending" },
  ]).returning();

  const [partner1, partner2, partner3] = await db.insert(partnersTable).values([
    {
      userId: p1User.id,
      companyName: "Glamour Cosmétiques",
      managerName: "Sonia Ben Ali",
      phone: "+216 71 234 567",
      country: "Tunisie",
      address: "12 Avenue Habib Bourguiba, Tunis",
      website: "https://glamour.tn",
      description: "Leader de la cosmétique naturelle en Tunisie",
      apiKey: crypto.randomBytes(32).toString("hex"),
    },
    {
      userId: p2User.id,
      companyName: "TechPro Electronics",
      managerName: "Karim Mansour",
      phone: "+216 73 456 789",
      country: "Tunisie",
      address: "Sfax, Zone Industrielle",
      website: "https://techpro.tn",
      description: "Spécialiste en électronique et technologie",
      apiKey: crypto.randomBytes(32).toString("hex"),
    },
    {
      userId: p3User.id,
      companyName: "VoyagePlus",
      managerName: "Leila Hamdi",
      phone: "+216 74 567 890",
      country: "Tunisie",
      website: "https://voyageplus.tn",
      description: "Agence de voyages premium",
      apiKey: crypto.randomBytes(32).toString("hex"),
    },
  ]).returning();

  await db.insert(partnerSubscriptionsTable).values([
    { partnerId: partner1.id, planId: business.id, status: "active" },
    { partnerId: partner2.id, planId: premium.id, status: "active" },
  ]);

  // --- Influencer Users ---
  const influencerHash = await hashPassword("influencer123");
  const [i1User, i2User, i3User, i4User, i5User] = await db.insert(usersTable).values([
    { email: "sarah.beauty@gmail.com", passwordHash: influencerHash, role: "influencer", status: "active" },
    { email: "zied.tech@gmail.com", passwordHash: influencerHash, role: "influencer", status: "active" },
    { email: "rania.mode@gmail.com", passwordHash: influencerHash, role: "influencer", status: "active" },
    { email: "med.food@gmail.com", passwordHash: influencerHash, role: "influencer", status: "active" },
    { email: "lina.lifestyle@gmail.com", passwordHash: influencerHash, role: "influencer", status: "pending" },
  ]).returning();

  const [inf1, inf2, inf3, inf4] = await db.insert(influencersTable).values([
    {
      userId: i1User.id, fullName: "Sarah Belhaj", country: "Tunisie",
      bio: "Beauty blogger passionnée par la cosmétique naturelle et le maquillage",
      level: "platinum", totalFollowers: 150000, reputationScore: "4.9",
      instagramUrl: "https://instagram.com/sarah.beauty.tn", instagramFollowers: 95000,
      tiktokUrl: "https://tiktok.com/@sarahbeauty", tiktokFollowers: 55000,
    },
    {
      userId: i2User.id, fullName: "Zied Karray", country: "Tunisie",
      bio: "Tech reviewer & digital marketer, passionné de nouvelles technologies",
      level: "gold", totalFollowers: 72000, reputationScore: "4.7",
      youtubeUrl: "https://youtube.com/@ziedtech", youtubeFollowers: 45000,
      instagramUrl: "https://instagram.com/zied.tech", instagramFollowers: 27000,
    },
    {
      userId: i3User.id, fullName: "Rania Toumi", country: "Tunisie",
      bio: "Fashion & lifestyle influencer, créatrice de contenu mode et tendances",
      level: "silver", totalFollowers: 38000, reputationScore: "4.5",
      instagramUrl: "https://instagram.com/rania.mode.tn", instagramFollowers: 25000,
      tiktokUrl: "https://tiktok.com/@raniamode", tiktokFollowers: 13000,
    },
    {
      userId: i4User.id, fullName: "Mohamed Chtioui", country: "Tunisie",
      bio: "Food blogger et chef cuisinier, je partage mes recettes et coups de cœur",
      level: "bronze", totalFollowers: 8500, reputationScore: "4.2",
      facebookUrl: "https://facebook.com/med.food", facebookFollowers: 5000,
      instagramUrl: "https://instagram.com/med.food.tn", instagramFollowers: 3500,
    },
  ]).returning();

  await db.insert(influencersTable).values({
    userId: i5User.id, fullName: "Lina Dridi", country: "Tunisie",
    bio: "Lifestyle & travel content creator",
    level: "silver", totalFollowers: 22000,
    instagramUrl: "https://instagram.com/lina.lifestyle", instagramFollowers: 22000,
  });

  // --- Categories ---
  const [cosmetique, voyage, restauration, mode, electronique, sport, formation, sante] =
    await db.insert(categoriesTable).values([
      { name: "Cosmétique", slug: "cosmetique", icon: "💄" },
      { name: "Voyage", slug: "voyage", icon: "✈️" },
      { name: "Restauration", slug: "restauration", icon: "🍽️" },
      { name: "Mode", slug: "mode", icon: "👗" },
      { name: "Électronique", slug: "electronique", icon: "📱" },
      { name: "Sport", slug: "sport", icon: "⚽" },
      { name: "Formation", slug: "formation", icon: "🎓" },
      { name: "Santé & Bien-être", slug: "sante-bien-etre", icon: "🌿" },
    ]).returning();

  await db.insert(subCategoriesTable).values([
    { categoryId: cosmetique.id, name: "Maquillage", slug: "maquillage" },
    { categoryId: cosmetique.id, name: "Soins visage", slug: "soins-visage" },
    { categoryId: cosmetique.id, name: "Parfums", slug: "parfums" },
    { categoryId: cosmetique.id, name: "Soins cheveux", slug: "soins-cheveux" },
    { categoryId: voyage.id, name: "Hôtels", slug: "hotels" },
    { categoryId: voyage.id, name: "Vols", slug: "vols" },
    { categoryId: voyage.id, name: "Circuits", slug: "circuits" },
    { categoryId: mode.id, name: "Vêtements femme", slug: "vetements-femme" },
    { categoryId: mode.id, name: "Vêtements homme", slug: "vetements-homme" },
    { categoryId: mode.id, name: "Accessoires", slug: "accessoires" },
    { categoryId: electronique.id, name: "Smartphones", slug: "smartphones" },
    { categoryId: electronique.id, name: "Ordinateurs", slug: "ordinateurs" },
    { categoryId: electronique.id, name: "Audio", slug: "audio" },
    { categoryId: sport.id, name: "Fitness", slug: "fitness" },
    { categoryId: sport.id, name: "Nutrition sportive", slug: "nutrition-sportive" },
    { categoryId: formation.id, name: "Marketing digital", slug: "marketing-digital" },
    { categoryId: formation.id, name: "Développement web", slug: "developpement-web" },
    { categoryId: sante.id, name: "Compléments alimentaires", slug: "complements" },
    { categoryId: sante.id, name: "Bien-être mental", slug: "bien-etre-mental" },
    { categoryId: restauration.id, name: "Fast food", slug: "fast-food" },
    { categoryId: restauration.id, name: "Livraison repas", slug: "livraison-repas" },
  ]);

  // --- Campaigns ---
  const [camp1, camp2] = await db.insert(campaignsTable).values([
    {
      partnerId: partner1.id,
      categoryId: cosmetique.id,
      title: "Lancement Sérum Éclat Bio",
      description: "Promouvoir notre nouveau sérum à base d'ingrédients naturels tunisiens. Résultats visibles en 7 jours. Offrez un code promo exclusif à vos abonnés.",
      productUrl: "https://glamour.tn/serum-eclat-bio",
      productPrice: "89",
      commissionModel: "cpa",
      commissionAmount: "20",
      objective: "Générer 500 ventes en 30 jours",
      minInfluencerLevel: "silver",
      status: "active",
      startDate: "2025-06-01",
      endDate: "2025-07-31",
    },
    {
      partnerId: partner2.id,
      categoryId: electronique.id,
      title: "Promotion Écouteurs Pro X200",
      description: "Campagne d'affiliation pour nos nouveaux écouteurs sans fil avec réduction de bruit active. Commission exceptionnelle pour les créateurs tech.",
      productUrl: "https://techpro.tn/x200",
      productPrice: "299",
      commissionModel: "cpa",
      commissionAmount: "35",
      objective: "Atteindre 200 ventes et 10 000 clics",
      minInfluencerLevel: "bronze",
      status: "active",
      startDate: "2025-06-15",
      endDate: "2025-08-15",
    },
  ]).returning();

  // Affiliate links for demo
  await db.insert(affiliateLinksTable).values([
    {
      campaignId: camp1.id,
      influencerId: inf1.id,
      code: "SARAH2025",
      totalClicks: 1243,
      totalSales: 87,
      totalEarnings: "1740",
    },
    {
      campaignId: camp2.id,
      influencerId: inf2.id,
      code: "ZIED2025",
      totalClicks: 892,
      totalSales: 34,
      totalEarnings: "1190",
    },
    {
      campaignId: camp2.id,
      influencerId: inf3.id,
      code: "RANIA2025",
      totalClicks: 445,
      totalSales: 12,
      totalEarnings: "420",
    },
    {
      campaignId: camp2.id,
      influencerId: inf4.id,
      code: "MED2025",
      totalClicks: 156,
      totalSales: 5,
      totalEarnings: "175",
    },
  ]);

  console.log("✅ Seed completed!");
  console.log("🔑 Test accounts:");
  console.log("   Admin:      admin@voya.com / admin123456");
  console.log("   Partner 1:  beauty@glamour.tn / partner123");
  console.log("   Partner 2:  contact@techpro.tn / partner123");
  console.log("   Influencer: sarah.beauty@gmail.com / influencer123");
}

seed().catch(console.error).finally(() => process.exit(0));
