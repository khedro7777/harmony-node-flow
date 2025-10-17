import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, FileCheck, Gavel, Lock, Zap, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">GPO DAO</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground animate-smooth">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground animate-smooth">How It Works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground animate-smooth">Pricing</a>
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/create-company">
              <Button size="sm" className="shadow-glow">
                Create Company <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Decentralized Governance Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Company Governance
              <br />
              <span className="gradient-primary bg-clip-text text-transparent">Reimagined</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Form companies, manage shareholders, vote on proposals, and resolve disputes—all in one transparent, Web3-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create-company">
                <Button size="lg" className="shadow-glow text-lg px-8">
                  Create Your Company <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/create-company">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Join as Service Provider
                </Button>
              </Link>
              <Button size="lg" variant="ghost" className="text-lg px-8">
                Watch Demo
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-success" />
                <span>Encrypted & Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-success" />
                <span>Full Transparency</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-success" />
                <span>Immutable Records</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete platform for decentralized company governance, decision-making, and dispute resolution.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="gradient-card p-8 rounded-2xl border border-border shadow-md hover:shadow-lg animate-smooth hover:scale-105"
              >
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our streamlined onboarding process.
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-glow">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your company's needs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <div
                key={index}
                className={`gradient-card p-8 rounded-2xl border ${
                  plan.featured ? 'border-primary shadow-glow' : 'border-border'
                } shadow-md hover:shadow-lg animate-smooth`}
              >
                {plan.featured && (
                  <div className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <FileCheck className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className="w-full" variant={plan.featured ? "default" : "outline"} size="lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Governance?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join leading companies using decentralized governance for transparency and efficiency.
          </p>
          <Link to="/create-company">
            <Button size="lg" className="shadow-glow text-lg px-8">
              Create Your Company Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-bold">GPO DAO</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Decentralized platform for company formation, governance & operation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground animate-smooth">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground animate-smooth">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground animate-smooth">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground animate-smooth">About</a></li>
                <li><a href="#" className="hover:text-foreground animate-smooth">Contact</a></li>
                <li><a href="#" className="hover:text-foreground animate-smooth">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground animate-smooth">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground animate-smooth">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground animate-smooth">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 GPO DAO Board. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: Users,
    title: "Company Formation",
    description: "Create and register companies with integrated KYC/KYB through trusted partners like Stripe Atlas and Doola.",
  },
  {
    icon: FileCheck,
    title: "Proposal & Voting",
    description: "Create proposals, link smart contracts, and vote with wallet-based signatures for transparent decision-making.",
  },
  {
    icon: Gavel,
    title: "Full Arbitration System",
    description: "File disputes, upload evidence, assign arbitrators, and get binding rulings—all tracked on-chain.",
  },
  {
    icon: Lock,
    title: "Multisig Wallet",
    description: "Shared treasury with Gnosis Safe integration. Execute transactions after governance approval.",
  },
  {
    icon: Shield,
    title: "Encrypted Storage",
    description: "Store sensitive documents on IPFS with client-side encryption. Immutable and secure.",
  },
  {
    icon: Zap,
    title: "Smart Contracts",
    description: "Upload, audit, and activate smart contracts. Track every version with immutable records.",
  },
];

const steps = [
  {
    title: "Register Your Company",
    description: "Choose your formation partner or import an existing company. Complete KYC/KYB verification and set up your company profile.",
  },
  {
    title: "Onboard Shareholders",
    description: "Invite team members and investors. They connect their wallets and voting power is assigned based on share ownership.",
  },
  {
    title: "Create Proposals & Vote",
    description: "Draft proposals, link smart contracts or documents, set voting parameters, and let shareholders vote with their wallets.",
  },
  {
    title: "Execute & Govern",
    description: "Once approved, execute decisions through your multisig wallet. All actions are recorded immutably on-chain.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    period: "month",
    featured: false,
    features: [
      "Up to 5 shareholders",
      "10 proposals per month",
      "Basic voting features",
      "Community support",
      "IPFS storage (1GB)",
    ],
  },
  {
    name: "Pro",
    price: "$99",
    period: "month",
    featured: true,
    features: [
      "Unlimited shareholders",
      "Unlimited proposals",
      "Full arbitration system",
      "Priority support",
      "IPFS storage (100GB)",
      "Custom smart contracts",
      "Multisig wallet integration",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: null,
    featured: false,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "Unlimited storage",
      "White-label options",
      "Advanced security features",
    ],
  },
];

export default Index;
