import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { 
  CheckCircle2, 
  Zap, 
  Shield, 
  BarChart3, 
  ChevronRight, 
  Globe, 
  Users, 
  CreditCard, 
  Layout, 
  ArrowRight,
  Star,
  Download,
  LifeBuoy,
  Package
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Moon, Sun } from 'lucide-react';

export function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="px-6 h-20 flex items-center justify-between border-b border-border/40 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">Bntec <span className="text-primary">Invoices</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
          <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">Services</a>
          <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
          <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="rounded-full"
          >
            {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-slate-300" />}
          </Button>
          <NavLink to="/login">
            <Button variant="ghost" className="font-medium hidden sm:flex">Sign In</Button>
          </NavLink>
          <NavLink to="/login">
            <Button className="font-semibold shadow-lg shadow-primary/25">Get Started</Button>
          </NavLink>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-10"
          >
             <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
             The #1 billing platform for scaling SaaS
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            Scale your billing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">without the limits.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-12 leading-relaxed"
          >
            A powerful multi-tenant engine designed for modern enterprises. Manage invoices, track global inventory, and scale with native Supabase performance.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6"
          >
             <NavLink to="/login">
               <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-2xl shadow-2xl shadow-primary/20">
                 Start Your Free Trial
               </Button>
             </NavLink>
             <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-semibold rounded-2xl border-2">
               Watch Demo Video <ArrowRight className="w-5 h-5 ml-2" />
             </Button>
          </motion.div>

          {/* Hero Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-24 w-full relative group"
          >
            <div className="absolute -inset-4 bg-gradient-to-b from-primary/20 to-transparent rounded-[32px] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative rounded-[24px] border border-border/50 bg-card/80 backdrop-blur-md p-2 shadow-2xl overflow-hidden aspect-[16/10] sm:aspect-video flex items-center justify-center">
              <div className="w-full h-full bg-muted/20 rounded-2xl flex flex-col items-center justify-center">
                 <Layout className="w-20 h-20 text-muted-foreground/30 animate-pulse" />
                 <span className="mt-4 text-muted-foreground font-medium">Dashboard Preview Loading...</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="w-full max-w-5xl mx-auto px-6 py-20 border-y border-border/40 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "Active Users", value: "50k+" },
            { label: "Invoices Sent", value: "1.2M" },
            { label: "Uptime", value: "99.99%" },
            { label: "Trust Score", value: "4.9/5" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Services Section */}
        <section id="services" className="w-full py-32 bg-slate-500/5">
          <div className="max-w-7xl mx-auto px-6">
             <div className="text-center mb-24">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 italic tracking-tight">Powerful Services. Zero Friction.</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic">Everything you need to run a global operation, all in one unified dashboard.</p>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
               {[
                 { icon: Globe, title: "Global Multi-Tenancy", desc: "Infinite scale with automated organization provisioning and enterprise isolation." },
                 { icon: CreditCard, title: "Advanced Billing", desc: "Automated tax calculation, recurring payments, and multi-currency support." },
                 { icon: Package, title: "Real-time Inventory", desc: "Track stock movements across multiple warehouses with automated low-stock triggers." },
                 { icon: Users, title: "Team RBAC", desc: "Granular roles and permissions. Manage every member with surgical precision." },
                 { icon: BarChart3, title: "Smart Reporting", desc: "Get AI-powered insights into cashflow, taxes, and customer growth trends." },
                 { icon: Shield, title: "Audit & Security", desc: "Every action is logged. Enterprise-grade RLS ensures your data never leaks." }
               ].map((service, i) => (
                 <motion.div
                   key={i}
                   whileHover={{ y: -10 }}
                   className="p-8 rounded-3xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 group"
                 >
                   <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                     <service.icon className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                   <p className="text-muted-foreground leading-relaxed italic text-lg">{service.desc}</p>
                 </motion.div>
               ))}
             </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 italic">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Flexible Plans for Every Stage</h2>
              <p className="text-xl text-muted-foreground italic">Start for free and scale as you grow. No hidden fees.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              {/* Free Plan */}
              <div className="p-10 rounded-[32px] border border-border bg-card flex flex-col italic">
                <h3 className="text-2xl font-bold mb-4">Free</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-extrabold tracking-tight">$0</span>
                  <span className="text-muted-foreground font-medium">/month</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "Up to 5 Invoices / mo",
                    "10 Products tracking",
                    "Single Organization",
                    "Standard Reports",
                    "Community Support"
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="h-14 rounded-2xl text-lg font-bold">Get Started</Button>
              </div>

              {/* Pro Plan */}
              <div className="p-10 rounded-[32px] border-4 border-primary bg-card relative shadow-2xl scale-105 z-10 italic">
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase">Most Popular</div>
                <h3 className="text-2xl font-bold mb-4">Pro</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-extrabold tracking-tight">$29</span>
                  <span className="text-muted-foreground font-medium">/month</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "Everything in Free",
                    "Unlimited Invoices",
                    "Real-time Inventory sync",
                    "Advanced Tax Logic",
                    "Export to PDF/Excel",
                    "Priority Email Support"
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground font-semibold">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/30">Upgrade to Pro</Button>
              </div>

              {/* Enterprise Plan */}
              <div className="p-10 rounded-[32px] border border-border bg-card flex flex-col italic">
                <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-extrabold tracking-tight">Custom</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "Unlimited Organizations",
                    "Custom Workflows",
                    "API Access (Rest/Webhooks)",
                    "Dedicated Account Manager",
                    "Custom SLA & Security Audit",
                    "On-premise Options"
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="h-14 rounded-2xl text-lg font-bold">Contact Sales</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-32 bg-primary/5">
           <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-16 italic">
                <h2 className="text-3xl md:text-4xl font-bold italic mb-4">Trusted by the best in the industry</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8 italic">
                 {[
                   { name: "John Doe", role: "CEO at TechCorp", text: "Bntec Invoices transformed how we handle billing across our 20+ entities. The RLS security is a game changer." },
                   { name: "Sarah Smith", role: "Founder of Shoply", text: "Inventory sync across warehouses used to be a nightmare. Now it just works. Highly recommended." }
                 ].map((t, i) => (
                   <div key={i} className="p-8 bg-card rounded-3xl border border-border shadow-sm">
                      <div className="flex gap-1 mb-6">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-primary text-primary" />)}
                      </div>
                      <p className="text-xl mb-8 leading-relaxed font-semibold">"{t.text}"</p>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-muted rounded-full" />
                         <div>
                            <div className="font-bold">{t.name}</div>
                            <div className="text-sm text-muted-foreground">{t.role}</div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-32 px-6 italic">
           <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold italic text-center mb-16">Frequently Asked Questions</h2>
              <div className="space-y-6">
                 {[
                   { q: "Is my data safe?", a: "Yes. Every tenant's data is isolated using hardware-enforced Row Level Security on Supabase." },
                   { q: "Can I cancel my subscription any time?", a: "Absolutely. You can downgrade or cancel your Pro plan directly from your settings." },
                   { q: "Do you support custom integrations?", a: "Our Enterprise plan includes full REST API access and webhooks." }
                 ].map((item, i) => (
                   <div key={i} className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                      <h4 className="text-lg font-bold mb-3">{item.q}</h4>
                      <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-32 italic">
          <div className="p-12 md:p-24 rounded-[48px] bg-primary text-primary-foreground relative overflow-hidden text-center group">
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
             <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-extrabold italic mb-10 tracking-tight leading-tight italic">
                  Ready to upgrade your <br /> billing experience?
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <NavLink to="/login">
                    <Button size="lg" variant="secondary" className="h-16 px-12 text-xl font-bold rounded-2xl shadow-2xl">
                      Get Started Today
                    </Button>
                  </NavLink>
                  <Button size="lg" variant="ghost" className="h-16 px-12 text-xl font-bold rounded-2xl text-primary-foreground hover:bg-white/10">
                    Contact Sales
                  </Button>
                </div>
             </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full pt-20 pb-10 px-6 border-t border-border mt-auto bg-card italic">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20 italic">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl uppercase tracking-tighter">Bntec Invoices</span>
              </div>
              <p className="text-muted-foreground max-w-xs text-lg italic mb-8">The ultimate billing engine for modern teams who want to scale faster.</p>
              <div className="flex gap-4 italic font-bold">
                 <Button variant="ghost" size="icon" className="rounded-xl"><Globe className="w-5 h-5" /></Button>
                 <Button variant="ghost" size="icon" className="rounded-xl"><LifeBuoy className="w-5 h-5" /></Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 tracking-widest uppercase text-sm">Product</h4>
              <ul className="space-y-4 text-muted-foreground italic font-semibold">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors text-primary flex items-center gap-2">Releases <div className="px-1.5 py-0.5 bg-primary/10 text-[10px] rounded italic">NEW</div></a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 tracking-widest uppercase text-sm">Company</h4>
              <ul className="space-y-4 text-muted-foreground italic font-semibold">
                <li><NavLink to="/about" className="hover:text-primary transition-colors">About Us</NavLink></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><NavLink to="/support" className="hover:text-primary transition-colors">Support</NavLink></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 tracking-widest uppercase text-sm">Legal</h4>
              <ul className="space-y-4 text-muted-foreground italic font-semibold">
                <li><NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</NavLink></li>
                <li><NavLink to="/terms" className="hover:text-primary transition-colors">Terms of Service</NavLink></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">
              © {new Date().getFullYear()} Bntec Software. All rights reserved.
            </div>
            <div className="flex items-center gap-6 italic font-bold">
               <NavLink to="/login" className="text-sm hover:text-primary transition-colors">Admin Login</NavLink>
               <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground">
                  <Download className="w-3 h-3" /> Latest: v2.4.1
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
