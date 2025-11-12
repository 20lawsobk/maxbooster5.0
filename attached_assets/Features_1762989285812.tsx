import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart3, 
  Users, 
  CheckCircle, 
  RefreshCw,
  Brain,
  Globe,
  AlertTriangle,
  Calendar,
  Hash
} from "lucide-react";
import { SiX, SiInstagram, SiLinkedin, SiFacebook, SiYoutube, SiTiktok } from "react-icons/si";
import { Link } from "wouter";

export default function Features() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Content Generation",
      description: "Generate engaging posts, captions, and content ideas with our advanced AI engine",
      color: "blue",
      details: [
        "Smart content creation for any topic",
        "Platform-optimized formatting",
        "Tone and style customization",
        "Multi-language support"
      ]
    },
    {
      icon: <Hash className="w-8 h-8" />,
      title: "Smart Hashtag Generator",
      description: "AI-powered hashtag suggestions based on trending topics and your content",
      color: "green",
      details: [
        "Trending hashtag discovery",
        "Engagement-optimized suggestions",
        "Platform-specific recommendations",
        "Competitor hashtag analysis"
      ]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Comprehensive insights across all platforms with real-time performance tracking",
      color: "purple",
      details: [
        "Cross-platform analytics dashboard",
        "Engagement rate optimization",
        "Audience growth tracking",
        "ROI measurement tools"
      ]
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "A/B Testing Suite",
      description: "Test different content variations to discover what drives the highest engagement",
      color: "orange",
      details: [
        "Content variation testing",
        "Optimal posting time discovery",
        "Hashtag performance comparison",
        "Statistical significance tracking"
      ]
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Scheduling",
      description: "AI-powered scheduling that posts at optimal times for maximum reach",
      color: "indigo",
      details: [
        "AI-powered optimal timing",
        "Cross-platform scheduling",
        "Bulk content upload",
        "Timezone optimization"
      ]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Competitor Analysis",
      description: "Track competitor performance and discover content opportunities",
      color: "yellow",
      details: [
        "Competitor performance tracking",
        "Content gap identification",
        "Trending topic discovery",
        "Strategy recommendations"
      ]
    }
  ];

  const getFeatureColor = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
      indigo: "from-indigo-500 to-indigo-600",
      yellow: "from-yellow-500 to-yellow-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer" data-testid="link-home">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Social Autopilot
                </span>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/pricing">
                <Button variant="outline" data-testid="button-pricing">
                  Pricing
                </Button>
              </Link>
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600" data-testid="button-get-started">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent" data-testid="heading-hero">
            Powerful Features for<br />Social Media Success
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto" data-testid="text-hero-description">
            Discover all the tools and capabilities that make Social Autopilot the ultimate social media management platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-testid="button-get-started">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" data-testid="button-watch-demo">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="heading-features">
            Everything You Need to Dominate Social Media
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300" data-testid="text-features-description">
            From AI-powered content creation to advanced analytics, we've got you covered
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm" data-testid={`card-feature-${index}`}>
              <CardHeader>
                <div className={`w-16 h-16 bg-gradient-to-r ${getFeatureColor(feature.color)} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Platform Support */}
      <section className="bg-white dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="heading-platforms">
            Supports All Major Platforms
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12" data-testid="text-platforms-description">
            Manage your entire social media presence from one unified dashboard
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center">
            {[
              { name: "Twitter", icon: SiX, color: "text-black dark:text-white" },
              { name: "Instagram", icon: SiInstagram, color: "text-pink-500" },
              { name: "LinkedIn", icon: SiLinkedin, color: "text-blue-600" },
              { name: "Facebook", icon: SiFacebook, color: "text-blue-500" },
              { name: "YouTube", icon: SiYoutube, color: "text-red-600" },
              { name: "TikTok", icon: SiTiktok, color: "text-black dark:text-white" }
            ].map((platform, index) => {
              const IconComponent = platform.icon;
              return (
                <div key={index} className="text-center" data-testid={`platform-${index}`}>
                  <div className="mb-2 flex justify-center">
                    <IconComponent className={`w-10 h-10 ${platform.color}`} />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{platform.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="heading-how-it-works">
            How Social Autopilot Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300" data-testid="text-how-it-works-description">
            Get started in minutes with our intuitive workflow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Connect Your Accounts",
              description: "Securely connect your social media accounts through our OAuth integration",
              icon: <Globe className="w-8 h-8 text-blue-600" />
            },
            {
              step: "02", 
              title: "Create & Optimize",
              description: "Use AI to generate and optimize content for maximum engagement across platforms",
              icon: <Zap className="w-8 h-8 text-blue-600" />
            },
            {
              step: "03",
              title: "Analyze & Scale",
              description: "Track performance, learn from insights, and scale your successful content strategies",
              icon: <TrendingUp className="w-8 h-8 text-blue-600" />
            }
          ].map((step, index) => (
            <div key={index} className="text-center group" data-testid={`step-${index}`}>
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-gray-800 rounded-2xl">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced Features */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" data-testid="heading-advanced-features">
            Advanced Features for Power Users
          </h2>
          <p className="text-xl text-blue-100 mb-12" data-testid="text-advanced-features-description">
            Take your social media strategy to the next level with our premium tools
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <RefreshCw className="w-6 h-6" />,
                title: "Auto-Reposting",
                description: "Automatically repost high-performing content"
              },
              {
                icon: <AlertTriangle className="w-6 h-6" />,
                title: "Performance Alerts", 
                description: "Get notified when content goes viral or underperforms"
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: "Audience Targeting",
                description: "AI-powered audience segmentation and targeting"
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Custom Reports",
                description: "Generate detailed reports for clients and stakeholders"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300" data-testid={`advanced-feature-${index}`}>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-blue-100 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4" data-testid="heading-cta">
            Ready to Transform Your Social Media Strategy?
          </h2>
          <p className="text-xl text-blue-100 mb-8" data-testid="text-cta-description">
            Join thousands of creators and businesses who trust Social Autopilot
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100" data-testid="button-get-started-cta">
                Subscribe Now
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" data-testid="button-learn-more">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}