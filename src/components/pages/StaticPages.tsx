import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Shield, Lock, Eye, Scale } from 'lucide-react';

export function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6 font-sans italic selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-4xl mx-auto">
        <NavLink to="/">
          <Button variant="ghost" className="mb-10 hover:bg-primary/10 hover:text-primary transition-all">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Home
          </Button>
        </NavLink>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
             <div className="p-3 bg-primary/10 rounded-2xl">
               <Shield className="w-8 h-8 text-primary" />
             </div>
             <h1 className="text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
          </div>

          <p className="text-xl text-muted-foreground mb-12 italic border-l-4 border-primary pl-6 py-2">
            At Bntec Invoices, your data security and privacy are our highest priorities. This policy explains how we collect, use, and protect your information.
          </p>

          <div className="space-y-12 italic font-semibold text-lg leading-relaxed">
             <section className="space-y-4">
               <div className="flex items-center gap-2 text-primary">
                 <Eye className="w-6 h-6" />
                 <h2 className="text-2xl font-bold uppercase tracking-widest">1. Data Collection</h2>
               </div>
               <p className="text-muted-foreground">
                 We collect minimal data necessary to provide our SaaS services. This includes your name, email address, and organization details. 
                 Payment information is processed securely through Stripe and is never stored on our servers.
               </p>
             </section>

             <section className="space-y-4">
               <div className="flex items-center gap-2 text-primary">
                 <Lock className="w-6 h-6" />
                 <h2 className="text-2xl font-bold uppercase tracking-widest">2. Data Isolation & RLS</h2>
               </div>
               <p className="text-muted-foreground">
                 Our multi-tenant architecture uses hardware-enforced **Row Level Security (RLS)**. This means your data is cryptographically 
                 isolated from other tenants. Even in the event of a breach, data from one organization cannot be accessed by another.
               </p>
             </section>

             <section className="space-y-4 text-center py-12 bg-muted/30 rounded-[32px] border border-border italic">
               <Scale className="w-10 h-10 text-primary mx-auto mb-6" />
               <h3 className="text-2xl font-bold italic mb-4 font-extrabold">Have questions?</h3>
               <p className="text-muted-foreground mb-8">Reach out to our privacy officer at privacy@bntec.app</p>
               <Button className="rounded-2xl px-10 h-14 font-bold text-lg shadow-xl shadow-primary/20">Contact Privacy Team</Button>
             </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6 font-sans italic selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-4xl mx-auto">
        <NavLink to="/">
          <Button variant="ghost" className="mb-10">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Home
          </Button>
        </NavLink>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-extrabold tracking-tight mb-8">Terms of Service</h1>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 italic font-medium text-lg text-muted-foreground">
             <p>By using Bntec Invoices, you agree to comply with our fair-use policy and respect the boundaries of your subscription tier.</p>
             <p>Usage tracking is enabled to ensure system stability and billing accuracy.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
