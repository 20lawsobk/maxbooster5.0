import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { 
  Sparkles, 
  BarChart3, 
  Share2, 
  Megaphone, 
  DollarSign,
  Music,
  Wand2,
  Globe,
  TrendingUp,
  Shield,
  Zap,
  Award
} from 'lucide-react';

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="cursor-pointer">
                <Logo size="md" />
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/pricing">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            All Features
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Built for Artists
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools for creation, distribution, promotion, and monetization
          </p>
        </div>
      </section>

      {/* AI Studio Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Music Studio</h2>
            <p className="text-lg text-gray-600">Professional production tools with AI assistance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "AI Mixing", description: "Auto-balance levels, panning, and EQ with AI precision" },
              { title: "AI Mastering", description: "Professional mastering with LUFS targeting and genre-specific presets" },
              { title: "DAW Workspace", description: "Full-featured browser-based DAW with real-time collaboration" },
              { title: "Plugin Library", description: "1000+ professional plugins, all rebranded for Max Booster" },
              { title: "Cloud Storage", description: "Unlimited project storage with automatic version control" },
              { title: "Stem Separation", description: "AI-powered vocal and instrument isolation" }
            ].map((feature, i) => (
              <Card key={i} className="hover-lift">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Distribution Features - COMING DECEMBER 2025 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Globe className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Distribution & Royalties
              <span className="block text-sm text-green-600 mt-2">🎄 Launching December 25, 2025</span>
            </h2>
            <p className="text-lg text-gray-600">Get your music on 100+ platforms including Spotify, Apple Music, and YouTube</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Global Distribution", description: "Spotify, Apple Music, YouTube Music, Amazon, TikTok, and 100+ more platforms" },
              { title: "Instant Payouts", description: "Stripe integration for real-time royalty payments" },
              { title: "Split Payments", description: "Automatic revenue sharing with collaborators" },
              { title: "Release Tracking", description: "Monitor distribution status across all DSPs in real-time" },
              { title: "ISRC/UPC Generation", description: "Automatic code generation for all releases" },
              { title: "Analytics Dashboard", description: "Real-time streaming and revenue analytics across all platforms" }
            ].map((feature, i) => (
              <Card key={i} className="hover-lift">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social & Advertising - AUTONOMOUS AUTOPILOTS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-4">
              <Zap className="h-12 w-12 text-purple-600 animate-pulse" />
              <Share2 className="h-12 w-12 text-blue-600" />
              <Megaphone className="h-12 w-12 text-pink-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Autonomous AI Autopilots
              <span className="block text-sm text-purple-600 mt-2">Replace $40,000+/year in labor</span>
            </h2>
            <p className="text-lg text-gray-600">True "set and forget" AI systems that work 24/7 while you sleep</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Social Media Autopilot (24/7)", description: "Autonomously creates content, posts, optimizes timing, learns from metrics, adapts to trends - zero manual work required" },
              { title: "Advertisement Autopilot (Zero Cost)", description: "Autonomously creates and optimizes campaigns, organic amplification, network effects, viral mechanics - no ad spend" },
              { title: "Multi-Platform Integration", description: "Facebook, Instagram, X, TikTok, YouTube, LinkedIn, Threads, Google Business" },
              { title: "AI Content Generation", description: "Generate text, images, videos, and audio from prompts or URLs with DALL-E, ChatGPT, and more" },
              { title: "A/B Testing & Learning", description: "Automated variant testing with reinforcement learning that continuously improves performance" },
              { title: "Real-Time Analytics", description: "Track engagement, reach, conversions across all platforms with actionable insights" }
            ].map((feature, i) => (
              <Card key={i} className="hover-lift">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Music className="h-12 w-12 mx-auto mb-4 text-pink-600" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Beat Marketplace</h2>
            <p className="text-lg text-gray-600">Buy and sell beats with integrated licensing</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Secure Transactions", description: "Stripe-powered checkout with buyer protection" },
              { title: "Automatic Licensing", description: "Generate legal license agreements for all sales" },
              { title: "Exclusive & Non-Exclusive", description: "Support for both licensing types with inventory tracking" },
              { title: "Royalty Splits", description: "Automatic payment distribution to collaborators" },
              { title: "Preview System", description: "Watermarked previews to protect your work" },
              { title: "Instant Downloads", description: "Immediate access to purchased beats with license docs" }
            ].map((feature, i) => (
              <Card key={i} className="hover-lift">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Access All Features?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join Max Booster today with our 90-day money-back guarantee
          </p>
          <Link href="/pricing">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
