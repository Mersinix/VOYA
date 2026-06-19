import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart, Users, Zap, CheckCircle2, TrendingUp, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tighter text-primary">VOYA</div>
          <div className="flex gap-4">
            <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" data-testid="link-login">
              Log in
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" data-testid="link-register">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.png" 
            alt="Hero Background" 
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
              The premier SaaS affiliation platform
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 text-foreground">
              Where brands find their <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">voice</span><br />
              and creators <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">monetize</span> their influence.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              VOYA connects top companies in the MENA region with influential digital sellers. 
              Manage campaigns, track conversions, and scale your growth in one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register/partner" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 py-2 text-lg" data-testid="hero-partner-cta">
                I'm a Brand
              </Link>
              <Link href="/register/influencer" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 px-8 py-2 text-lg" data-testid="hero-influencer-cta">
                I'm a Creator
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Partners */}
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
                <img src="/partner.png" alt="Business team" className="w-full h-auto object-cover aspect-[4/3]" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">For Partners</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Launch affiliate campaigns in minutes. Set your commission structure, define influencer criteria, and watch your sales multiply with real-time tracking.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: <Zap className="w-6 h-6 text-primary" />, title: "Instant Campaign Launch", desc: "Create and publish campaigns tailored to your specific audience." },
                  { icon: <Users className="w-6 h-6 text-primary" />, title: "Vetted Influencers", desc: "Access a curated network of top-performing creators in the MENA region." },
                  { icon: <BarChart className="w-6 h-6 text-primary" />, title: "Real-time Analytics", desc: "Track clicks, leads, and sales with our advanced dashboard." }
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

      {/* How It Works - Influencers */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center flex-col-reverse lg:flex-row-reverse">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
                <img src="/influencer.png" alt="Content Creator" className="w-full h-auto object-cover aspect-[4/3]" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">For Creators</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Turn your audience into income. Browse premium campaigns, generate unique links, and earn commissions on every successful referral.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: <CheckCircle2 className="w-6 h-6 text-primary" />, title: "Premium Brands", desc: "Work with top SaaS companies and established businesses." },
                  { icon: <TrendingUp className="w-6 h-6 text-primary" />, title: "Level Up Your Earnings", desc: "Progress through our tier system to unlock higher commission rates." },
                  { icon: <Shield className="w-6 h-6 text-primary" />, title: "Guaranteed Payouts", desc: "Secure and timely payments directly to your preferred account." }
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

      {/* Influencer Levels */}
      <section className="py-24 bg-midnight-blue text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Creator Progression</h2>
            <p className="text-lg text-gray-300">
              Our leveled tier system rewards high-performing creators with exclusive campaigns and better rates.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Bronze", color: "#CD7F32", desc: "Starting tier. Access to standard campaigns." },
              { name: "Silver", color: "#C0C0C0", desc: "Proven track record. Better commission rates." },
              { name: "Gold", color: "#F59E0B", desc: "High performers. Exclusive brand deals." },
              { name: "Platinum", color: "#E5E4E2", desc: "Elite creators. Premium rates and priority support." }
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
                    <h3 className="text-xl font-bold mb-2" style={{ color: tier.color }}>{tier.name}</h3>
                    <p className="text-sm text-gray-400">{tier.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing for Partners */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Partner Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Simple, transparent pricing for brands of all sizes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Pack Starter", price: "49 DT", desc: "Perfect for testing the waters", features: ["1 Active Campaign", "Basic Analytics", "Standard Support", "Access to Bronze/Silver"] },
              { name: "Pack Business", price: "149 DT", desc: "For growing businesses", featured: true, features: ["5 Active Campaigns", "Advanced Analytics", "Priority Support", "Access to Gold Tier", "Custom Tracking Links"] },
              { name: "Pack Premium", price: "349 DT", desc: "For scaling enterprises", features: ["Unlimited Campaigns", "Custom Reports", "Dedicated Account Manager", "Access to Platinum Tier", "API Access"] }
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className={`h-full flex flex-col ${plan.featured ? 'border-primary shadow-xl scale-105 relative z-10' : ''}`}>
                  {plan.featured && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Badge className="bg-primary text-primary-foreground uppercase tracking-wide text-xs">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-6">{plan.desc}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register/partner" className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full ${plan.featured ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}`} data-testid={`pricing-${plan.name.replace(/\s+/g, '-').toLowerCase()}`}>
                      Choose {plan.name}
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to accelerate your growth?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join the leading SaaS affiliation network in the MENA region today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/partner" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 py-2 text-lg" data-testid="cta-partner">
              Start as a Partner <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="font-bold text-2xl tracking-tighter text-primary mb-4">VOYA</div>
          <p>© {new Date().getFullYear()} VOYA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
