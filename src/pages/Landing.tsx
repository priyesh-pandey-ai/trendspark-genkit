import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Target, TrendingUp, Check, BarChart3, Users, Clock, Star, ArrowRight, Lightbulb, FileText, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const trendingTopics = [
    {
      title: "AI in Marketing",
      category: "Technology",
      growth: "+127%",
      engagement: "High",
      color: "bg-blue-500"
    },
    {
      title: "Sustainable Fashion",
      category: "Lifestyle",
      growth: "+89%",
      engagement: "Medium",
      color: "bg-green-500"
    },
    {
      title: "Remote Work Tools",
      category: "Business",
      growth: "+156%",
      engagement: "High",
      color: "bg-purple-500"
    },
    {
      title: "Wellness Tech",
      category: "Health",
      growth: "+94%",
      engagement: "Medium",
      color: "bg-pink-500"
    }
  ];

  const stats = [
    {
      value: "10K+",
      label: "Content Pieces Generated",
      icon: <FileText className="h-6 w-6" />
    },
    {
      value: "500+",
      label: "Active Brands",
      icon: <Users className="h-6 w-6" />
    },
    {
      value: "15 Min",
      label: "Average Time Saved",
      icon: <Clock className="h-6 w-6" />
    },
    {
      value: "95%",
      label: "Satisfaction Rate",
      icon: <Star className="h-6 w-6" />
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Discover Trends",
      description: "Our AI scans emerging trends across platforms in real-time",
      icon: <TrendingUp className="h-8 w-8" />
    },
    {
      step: "02",
      title: "Generate Content",
      description: "Create brand-aligned posts with AI-powered voice matching",
      icon: <Lightbulb className="h-8 w-8" />
    },
    {
      step: "03",
      title: "Review & Refine",
      description: "Fine-tune content with our smart editing suggestions",
      icon: <FileText className="h-8 w-8" />
    },
    {
      step: "04",
      title: "Publish Everywhere",
      description: "Export optimized content to all your social platforms",
      icon: <Share2 className="h-8 w-8" />
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechStart Inc.",
      content: "TrendSpark has transformed how we create content. What used to take hours now takes minutes, and the quality is consistently excellent.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Social Media Manager",
      company: "GrowthCo",
      content: "The trend detection is incredibly accurate. We're always ahead of the curve now, and our engagement has increased by 40%.",
      rating: 5
    },
    {
      name: "Emma Williams",
      role: "Content Strategist",
      company: "BrandWorks",
      content: "The voice matching feature is a game-changer. Our brand voice is consistent across all platforms without any extra effort.",
      rating: 5
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

      {/* Live Trending Topics Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 gradient-hero text-white border-0">
              <TrendingUp className="h-3 w-3 mr-1" />
              Live Trends
            </Badge>
            <h2 className="text-4xl font-bold mb-4">What's Trending Right Now</h2>
            <p className="text-xl text-muted-foreground">Real-time insights into emerging topics across the web</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingTopics.map((topic, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 hover:scale-105" style={{ borderLeftColor: topic.color.replace('bg-', '#') }}>
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline" className="text-xs">{topic.category}</Badge>
                  <div className={`h-2 w-2 rounded-full ${topic.color} animate-pulse`}></div>
                </div>
                <h3 className="font-bold text-lg mb-3">{topic.title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">{topic.growth}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {topic.engagement} Engagement
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Dashboard */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Content Creators Worldwide</h2>
            <p className="text-xl text-muted-foreground">Join thousands of brands creating better content, faster</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <Card key={i} className="p-8 text-center gradient-card border-primary/10 hover:shadow-glow transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2 gradient-hero bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
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
            <p className="text-xl text-muted-foreground">From trend to published post in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-white font-bold shadow-lg">
                    {step.step}
                  </div>
                  <div className="text-primary mb-4 mt-4">{step.icon}</div>
                  <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </Card>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-primary/40" />
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

      {/* Social Proof - Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 gradient-hero text-white border-0">
              <Star className="h-3 w-3 mr-1" />
              5.0 Rating
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Loved by Content Creators</h2>
            <p className="text-xl text-muted-foreground">See what our users say about TrendSpark</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="p-8 gradient-card hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div className="border-t pt-4">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-sm text-primary">{testimonial.company}</div>
                </div>
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