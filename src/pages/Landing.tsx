import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Target, TrendingUp, Check, ArrowUpRight, Users, Clock, BarChart3, Flame, Star, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const trendingTopics = [
    {
      title: "AI & Machine Learning",
      category: "Technology",
      engagement: "124K",
      trend: "+45%",
      badge: "🔥 Hot",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Sustainable Living",
      category: "Lifestyle",
      engagement: "89K",
      trend: "+32%",
      badge: "📈 Rising",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Web3 & Crypto",
      category: "Finance",
      engagement: "156K",
      trend: "+67%",
      badge: "⚡ Viral",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Remote Work Tips",
      category: "Business",
      engagement: "72K",
      trend: "+28%",
      badge: "✨ New",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  const stats = [
    {
      icon: <BarChart3 className="h-8 w-8" />, 
      value: "10K+",
      label: "Content Pieces Generated",
      color: "text-blue-500"
    },
    {
      icon: <Users className="h-8 w-8" />, 
      value: "500+",
      label: "Active Brands",
      color: "text-purple-500"
    },
    {
      icon: <Clock className="h-8 w-8" />, 
      value: "95%",
      label: "Time Saved",
      color: "text-green-500"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />, 
      value: "50+",
      label: "Daily Trending Topics",
      color: "text-orange-500"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Connect Your Brand",
      description: "Upload sample posts or describe your brand voice. Our AI learns your unique style.",
      icon: <Target className="h-6 w-6" />
    },
    {
      step: "2",
      title: "Discover Trends",
      description: "Browse curated trending topics relevant to your niche. Real-time insights updated daily.",
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      step: "3",
      title: "Generate Content",
      description: "Click to create platform-optimized posts. AI matches your voice and brand guidelines.",
      icon: <Sparkles className="h-6 w-6" />
    },
    {
      step: "4",
      title: "Publish & Grow",
      description: "Export ready-to-publish content for Instagram, LinkedIn, Twitter, and more.",
      icon: <Zap className="h-6 w-6" />
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Manager",
      company: "TechFlow Inc",
      quote: "Cut our content creation time by 80%. The AI perfectly captures our brand voice every time.",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Social Media Lead",
      company: "GreenEarth",
      quote: "We went from 2 posts a week to 10+. Our engagement has tripled since using Trend-Craft AI.",
      avatar: "MR"
    },
    {
      name: "Priya Sharma",
      role: "Marketing Director",
      company: "FinTech Solutions",
      quote: "The trend discovery feature is a game-changer. We're always first to market with relevant content.",
      avatar: "PS"
    }
  ];

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

      {/* Trending Topics Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-semibold text-orange-500 uppercase tracking-wide">Live Trending Now</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">What's Trending Today</h2>
            <p className="text-xl text-muted-foreground">Real-time topics your audience cares about</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingTopics.map((topic, i) => (
              <Card key={i} className="p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${topic.color} opacity-10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500`} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {topic.category}
                    </span>
                    <span className="text-lg">{topic.badge.split(' ')[0]}</span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{topic.engagement}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 font-semibold">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>{topic.trend}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => navigate('/auth')}> 
              View All 50+ Trends 
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <Card key={i} className="p-6 text-center gradient-card border-primary/10 hover:shadow-lg transition-shadow">
                <div className={`inline-flex p-3 rounded-lg bg-background/50 mb-4 ${stat.color}`}> 
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">From trend to viral post in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative">
                <Card className="p-6 h-full gradient-card hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4">
                      {step.step}
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4">
                      {step.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </Card>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="h-8 w-8 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
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

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Loved by Content Creators</h2>
            <p className="text-xl text-muted-foreground">See what our customers are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="p-6 gradient-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                <div className="text-sm text-primary font-medium">{testimonial.company}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
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
      <section className="py-20 px-4 bg-muted/30">
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