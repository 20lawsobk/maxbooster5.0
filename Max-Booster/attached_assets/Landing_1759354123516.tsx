import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/Logo';
import {
  Sparkles,
  BarChart3,
  Share2,
  Megaphone,
  DollarSign,
  Check,
  ArrowRight,
  Play,
  Star,
  Users,
  TrendingUp,
  Music,
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
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
      <section className="relative px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            🎵 AI-Powered Music Career Management
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-8">
            Boost Your Music Career with
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI-Powered Tools
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            The complete platform for music artists. Create, distribute, promote, and monetize your
            music with cutting-edge AI assistance, analytics, and automation tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="px-8 py-4 text-lg">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Artists', value: '10K+', icon: Users },
              { label: 'Songs Distributed', value: '500K+', icon: Music },
              { label: 'Revenue Generated', value: '$2M+', icon: DollarSign },
              { label: 'Success Rate', value: '95%', icon: TrendingUp },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From creation to monetization, Max Booster provides all the tools you need to build a
              successful music career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI Studio & Mastering',
                description:
                  'Create, mix, and master your tracks with AI assistance. Professional quality results in minutes.',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description:
                  'Track your performance across all platforms with detailed insights and revenue forecasts.',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: Share2,
                title: 'Social Media Automation',
                description:
                  'Auto-generate and schedule optimized posts across Facebook, Instagram, TikTok, and more.',
                color: 'from-green-500 to-teal-500',
              },
              {
                icon: Megaphone,
                title: 'Smart Advertising',
                description:
                  'AI-powered ad campaigns that boost performance by 100% across all major platforms.',
                color: 'from-orange-500 to-red-500',
              },
              {
                icon: DollarSign,
                title: 'Royalty Management',
                description:
                  'Automated royalty collection and distribution with Stripe integration for instant payouts.',
                color: 'from-indigo-500 to-blue-500',
              },
              {
                icon: Music,
                title: 'Beat Marketplace',
                description:
                  'Buy and sell beats with integrated peer-to-peer transactions and licensing management.',
                color: 'from-pink-500 to-purple-500',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="relative overflow-hidden group hover-lift transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our core AI features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Monthly',
                price: '$49',
                period: '/month',
                description: 'Perfect for getting started',
                features: ['All AI Tools', '5 Projects', 'Basic Analytics', 'Email Support'],
                popular: false,
              },
              {
                name: 'Yearly',
                price: '$39',
                period: '/month',
                originalPrice: '$49',
                description: 'Best value for serious artists',
                features: [
                  'All AI Tools',
                  'Unlimited Projects',
                  'Advanced Analytics',
                  'Priority Support',
                ],
                popular: true,
              },
              {
                name: 'Lifetime',
                price: '$699',
                period: 'once',
                description: 'Complete access forever',
                features: [
                  'Everything Included',
                  'Unlimited Everything',
                  'Premium Support',
                  'Future Updates',
                ],
                popular: false,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center justify-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/subscribe/${plan.name.toLowerCase()}`}>
                    <Button
                      className={`w-full ${plan.popular ? 'gradient-bg' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12">
            <Link href="/pricing">
              <Button variant="ghost" size="lg">
                View Detailed Pricing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Top Artists
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Independent Artist',
                content:
                  'Max Booster transformed my music career. The AI tools helped me create professional-quality tracks, and the analytics showed me exactly where to focus my efforts.',
                rating: 5,
              },
              {
                name: 'Mike Chen',
                role: 'Producer',
                content:
                  "The marketplace feature is incredible. I've sold over $10k worth of beats in just 3 months. The platform handles everything seamlessly.",
                rating: 5,
              },
              {
                name: 'Luna Rodriguez',
                role: 'Singer-Songwriter',
                content:
                  'From creation to promotion, Max Booster has everything I need. The social media automation alone saves me 10+ hours per week.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Boost Your Music Career?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of artists who are already using Max Booster to grow their careers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Logo size="sm" variant="text" className="text-white" />
              </div>
              <p className="text-gray-400">
                Empowering music artists with AI-powered tools for creation, distribution, and
                promotion.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    DMCA
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2025 Max Booster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
