import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Target, TrendingUp, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Trend-Powered Content",
      description: "Transform emerging trends into brand-ready social posts in minutes"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "AI Voice Matching",
      description: "Automatically captures and maintains your unique brand voice"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Multi-Platform Export",
      description: "Optimized content for Instagram, LinkedIn, and Twitter"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Smart Guardrails",
      description: "Built-in compliance and brand safety checks"
    }
  ];

  const pricing = [
    {
      name: "Starter",
      price: "₹799",
      period: "/month",
      features: [
        "30 content kits per month",
        "1 brand profile",
        "Voice card generation",
        "3 platforms",
        "Export to clipboard"
      ]
    },
    {
      name: "Pro",
      price: "₹3,999",
      period: "/month",
      features: [
        "200 content kits per month",
        "3 brand profiles",
        "Voice card generation",
        "All platforms",
        "CSV export",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Agency",
      price: "₹12,999",
      period: "/month",
      features: [
        "1000 content kits per month",
        "10 brand profiles",
        "Voice card generation",
        "All platforms",
        "API access",
        "White-label option",
        "Dedicated support"
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 gradient-subtle -z-10" />
        
        <div className="container max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Content Studio</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight">
              Turn <span className="gradient-hero bg-clip-text text-transparent">Trends</span> Into
              <br />
              Brand-Ready Content
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Generate platform-optimized social media posts from emerging trends in minutes. 
              AI-powered, brand-safe, and ready to publish.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="gradient-hero text-white shadow-glow hover:opacity-90 transition-opacity"
                onClick={() => navigate('/auth')}
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Scale Content</h2>
            <p className="text-xl text-muted-foreground">From trend to post in under 15 minutes</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="p-6 gradient-card border-primary/10 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan, i) => (
              <Card 
                key={i} 
                className={`p-8 relative ${
                  plan.popular 
                    ? 'border-primary shadow-glow gradient-card' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'gradient-hero text-white shadow-md' 
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => navigate('/auth')}
                >
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <Card className="p-12 gradient-card shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Content Strategy?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join brands creating viral-ready content in minutes, not hours
            </p>
            <Button 
              size="lg" 
              className="gradient-hero text-white shadow-glow hover:opacity-90"
              onClick={() => navigate('/auth')}
            >
              Start Your Free Trial
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;