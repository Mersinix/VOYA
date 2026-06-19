import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart, Users, Zap, CheckCircle2, TrendingUp, Shield, ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Qu'est-ce que VOYA et à qui s'adresse la plateforme ?",
    a: "VOYA est une plateforme SaaS d'affiliation B2B qui connecte des entreprises (partenaires) avec des influenceurs et vendeurs digitaux en Tunisie et dans la région MENA. Elle s'adresse aux marques souhaitant développer leur visibilité et aux créateurs de contenu cherchant à monétiser leur audience.",
  },
  {
    q: "Comment fonctionnent les commissions pour les influenceurs ?",
    a: "Les influenceurs perçoivent une commission à chaque conversion générée via leur lien d'affiliation unique. Le modèle de commission (pourcentage ou montant fixe) est défini par le partenaire pour chaque campagne. Les paiements sont traités mensuellement.",
  },
  {
    q: "Quelle est la différence entre les niveaux Bronze, Silver, Gold et Platinum ?",
    a: "Les niveaux sont calculés à partir du nombre total d'abonnés : Bronze (< 10 000), Silver (10 000–49 999), Gold (50 000–99 999), Platinum (100 000+). Les campagnes premium sont réservées aux niveaux supérieurs, offrant des taux de commission plus élevés.",
  },
  {
    q: "Combien de campagnes puis-je lancer avec le Pack Starter ?",
    a: "Le Pack Starter permet de gérer jusqu'à 3 campagnes actives simultanément. Pour plus de campagnes, le Pack Business (10 campagnes) ou le Pack Premium (illimité) s'adaptent à votre croissance.",
  },
  {
    q: "Comment suivre les performances de mes campagnes ?",
    a: "Votre tableau de bord partenaire affiche en temps réel les clics, les conversions, le chiffre d'affaires généré et les commissions dues. Vous disposez de liens de tracking uniques par influenceur pour une attribution précise.",
  },
  {
    q: "Est-il possible de changer de plan après l'inscription ?",
    a: "Oui, vous pouvez upgrader ou downgrader votre abonnement à tout moment depuis votre tableau de bord. Le changement est effectif à la prochaine période de facturation.",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tighter text-primary">VOYA</div>
          <div className="flex gap-4">
            <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" data-testid="link-login">
              Connexion
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" data-testid="link-register">
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.png"
            alt="Arrière-plan héro"
            className="w-full h-full object-cover opacity-20 dark:opacity-40 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background to-background"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary bg-primary/10 px-3 py-1 text-sm rounded-full">
              La première plateforme SaaS d'affiliation de la région MENA
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 text-foreground">
              Où les marques trouvent leur <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">voix</span><br />
              et les créateurs <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">monétisent</span> leur influence.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              VOYA connecte les meilleures entreprises de la région MENA avec des vendeurs digitaux influents.
              Gérez vos campagnes, suivez vos conversions et accélérez votre croissance sur une seule plateforme.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register/partner" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 py-2 text-lg" data-testid="hero-partner-cta">
                Je suis une marque
              </Link>
              <Link href="/register/influencer" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 px-8 py-2 text-lg" data-testid="hero-influencer-cta">
                Je suis un créateur
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pour les partenaires */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
                <img src="/partner.png" alt="Équipe entreprise" className="w-full h-auto object-cover aspect-[4/3]" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Pour les partenaires</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Lancez vos campagnes d'affiliation en quelques minutes. Définissez vos commissions, ciblez les bons influenceurs et multipliez vos ventes grâce au suivi en temps réel.
              </p>

              <div className="space-y-6">
                {[
                  { icon: <Zap className="w-6 h-6 text-primary" />, title: "Lancement instantané", desc: "Créez et publiez des campagnes adaptées à votre audience cible en quelques clics." },
                  { icon: <Users className="w-6 h-6 text-primary" />, title: "Réseau d'influenceurs qualifiés", desc: "Accédez à un réseau curé de créateurs performants dans la région MENA." },
                  { icon: <BarChart className="w-6 h-6 text-primary" />, title: "Analytiques en temps réel", desc: "Suivez clics, leads et ventes depuis votre tableau de bord avancé." },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg shrink-0 h-fit">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pour les créateurs */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
                <img src="/influencer.png" alt="Créateur de contenu" className="w-full h-auto object-cover aspect-[4/3]" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Pour les créateurs</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Transformez votre audience en revenus. Parcourez des campagnes premium, générez vos liens uniques et percevez des commissions à chaque conversion.
              </p>

              <div className="space-y-6">
                {[
                  { icon: <CheckCircle2 className="w-6 h-6 text-primary" />, title: "Marques premium", desc: "Collaborez avec les meilleures entreprises SaaS et marques établies de la région." },
                  { icon: <TrendingUp className="w-6 h-6 text-primary" />, title: "Progressez et gagnez plus", desc: "Notre système de niveaux récompense les créateurs performants avec des taux de commission supérieurs." },
                  { icon: <Shield className="w-6 h-6 text-primary" />, title: "Paiements garantis", desc: "Des versements sécurisés et ponctuels directement sur votre compte." },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg shrink-0 h-fit">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Niveaux des créateurs */}
      <section className="py-24 bg-[#1E1B4B] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Progression des créateurs</h2>
            <p className="text-lg text-gray-300">
              Notre système de niveaux récompense les créateurs les plus performants avec des campagnes exclusives et de meilleurs taux.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Bronze", color: "#CD7F32", followers: "< 10 000 abonnés", desc: "Niveau de départ. Accès aux campagnes standard." },
              { name: "Silver", color: "#C0C0C0", followers: "10 000 – 49 999 abonnés", desc: "Expérience prouvée. Meilleurs taux de commission." },
              { name: "Gold", color: "#F59E0B", followers: "50 000 – 99 999 abonnés", desc: "Haute performance. Accès aux deals exclusifs." },
              { name: "Platinum", color: "#E5E4E2", followers: "100 000+ abonnés", desc: "Élite des créateurs. Taux premium et support dédié." },
            ].map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 text-white h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 border-4" style={{ borderColor: tier.color, backgroundColor: `${tier.color}20` }}>
                      <span className="font-bold text-xl" style={{ color: tier.color }}>{i + 1}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1" style={{ color: tier.color }}>{tier.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{tier.followers}</p>
                    <p className="text-sm text-gray-400">{tier.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs partenaires */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tarifs partenaires</h2>
            <p className="text-lg text-muted-foreground">
              Des offres simples et transparentes pour toutes les tailles d'entreprise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Pack Starter",
                price: "49 DT",
                desc: "Idéal pour démarrer",
                features: ["3 campagnes actives", "Analytiques de base", "Support standard", "Accès niveaux Bronze/Silver"],
              },
              {
                name: "Pack Business",
                price: "149 DT",
                desc: "Pour les entreprises en croissance",
                featured: true,
                features: ["10 campagnes actives", "Analytiques avancées", "Support prioritaire", "Accès niveau Gold", "Liens de tracking personnalisés"],
              },
              {
                name: "Pack Premium",
                price: "349 DT",
                desc: "Pour les grandes entreprises",
                features: ["Campagnes illimitées", "Rapports sur mesure", "Chargé de compte dédié", "Accès niveau Platinum", "Accès API"],
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className={`h-full flex flex-col relative ${plan.featured ? "border-primary shadow-xl scale-105 z-10" : ""}`}>
                  {plan.featured && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Badge className="bg-primary text-primary-foreground uppercase tracking-wide text-xs">Le plus populaire</Badge>
                    </div>
                  )}
                  <CardContent className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-6">{plan.desc}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
                      <span className="text-muted-foreground">/mois</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/register/partner"
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full ${plan.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"}`}
                      data-testid={`pricing-${plan.name.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      Choisir {plan.name}
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ce qu'ils disent de VOYA</h2>
            <p className="text-lg text-muted-foreground">
              Des marques et créateurs qui ont transformé leur croissance grâce à notre plateforme.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Yasmine Cherif",
                role: "Directrice Marketing, GlamourTN",
                avatar: "YC",
                quote: "VOYA nous a permis de multiplier nos ventes par 3 en moins de 6 mois. Le suivi en temps réel et la qualité du réseau d'influenceurs sont incomparables sur le marché tunisien.",
              },
              {
                name: "Mehdi Ben Salah",
                role: "Créateur de contenu Tech — 85k abonnés",
                avatar: "MB",
                quote: "Enfin une plateforme d'affiliation sérieuse en Tunisie ! Les paiements arrivent à temps, les campagnes sont premium et le tableau de bord me donne toutes les stats dont j'ai besoin.",
              },
              {
                name: "Sonia Khalil",
                role: "CEO, TechPro Solutions",
                avatar: "SK",
                quote: "L'intégration avec notre catalogue produits était simple et rapide. En 3 semaines, nous avions déjà 12 influenceurs actifs qui généraient des leads qualifiés pour nos formations.",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-8 flex flex-col h-full">
                    <p className="text-muted-foreground italic mb-6 flex-1">« {testimonial.quote} »</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{testimonial.avatar}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Questions fréquentes</h2>
            <p className="text-lg text-muted-foreground">Tout ce que vous devez savoir avant de commencer.</p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden bg-background">
                <button
                  className="w-full flex items-center justify-between p-5 text-left font-medium hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 ml-4 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Prêt à accélérer votre croissance ?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Rejoignez le premier réseau d'affiliation SaaS de la région MENA dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/partner" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 py-2 text-lg" data-testid="cta-partner">
              Démarrer en tant que partenaire <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/register/influencer" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 px-8 py-2 text-lg" data-testid="cta-influencer">
              Rejoindre en tant que créateur
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="font-bold text-2xl tracking-tighter text-primary mb-4">VOYA</div>
          <p>© {new Date().getFullYear()} VOYA. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
