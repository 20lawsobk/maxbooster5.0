import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, HelpCircle, Book, MessageCircle, Mail, ExternalLink, Video, FileText, Zap } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How do I create my first music project?',
        answer: 'Navigate to the Studio page and click "New Project". You can upload audio files, use our virtual instruments, or start from scratch. Our AI will help optimize your mix and master your track.'
      },
      {
        question: 'What subscription plan should I choose?',
        answer: 'We offer three plans: Monthly ($49/month) for flexibility, Yearly ($468/year) to save 20%, and Lifetime ($699 one-time) for unlimited access forever. All plans include full access to all features, unlimited distribution, and 100% royalties.'
      },
      {
        question: 'How do I distribute my music to streaming platforms?',
        answer: 'Go to the Distribution page, upload your music and artwork, fill in the metadata, select your platforms (Spotify, Apple Music, etc.), and submit for review. Your music will typically go live within 1-3 business days.'
      },
    ],
  },
  {
    category: 'Music Distribution',
    questions: [
      {
        question: 'Which platforms can I distribute to?',
        answer: 'Max Booster distributes to all major platforms including Spotify, Apple Music, YouTube Music, Amazon Music, Tidal, Deezer, TikTok, Instagram, and 150+ others worldwide.'
      },
      {
        question: 'Do you take a percentage of my royalties?',
        answer: 'No! You keep 100% of your royalties. We only charge a subscription fee - there are no hidden fees or revenue sharing. Your earnings are yours to keep.'
      },
      {
        question: 'How long does it take for my music to go live?',
        answer: 'Most releases go live within 1-3 business days. Some platforms may take up to 7 days. We recommend submitting your music at least 2 weeks before your desired release date.'
      },
      {
        question: 'Can I schedule a release for a future date?',
        answer: 'Yes! You can schedule your release for any future date. This allows you to build anticipation with pre-saves and coordinate your marketing efforts.'
      },
    ],
  },
  {
    category: 'AI Studio Features',
    questions: [
      {
        question: 'What can the AI Mixer do?',
        answer: 'Our proprietary AI analyzes your tracks and automatically balances levels, applies EQ, compression, and spatial effects. It learns from professional mixing techniques to give your music a polished, radio-ready sound.'
      },
      {
        question: 'How does AI Mastering work?',
        answer: 'AI Mastering analyzes your final mix and applies professional mastering techniques including multi-band compression, EQ adjustments, stereo widening, and limiting to meet streaming platform loudness standards.'
      },
      {
        question: 'Can I access 1000+ plugins for free?',
        answer: 'Yes! All Max Booster subscribers get unlimited access to our entire catalog of 1000+ professional plugins including EQs, compressors, reverbs, delays, virtual instruments, and more - all included in your subscription.'
      },
    ],
  },
  {
    category: 'Royalties & Earnings',
    questions: [
      {
        question: 'When will I receive my royalty payments?',
        answer: 'Streaming platforms typically pay royalties 60-90 days after streams occur. We process payouts monthly once you reach the minimum threshold. You can track your earnings in real-time on the Royalties page.'
      },
      {
        question: 'What is the minimum payout threshold?',
        answer: 'The minimum payout threshold is $10. Once you reach this amount, we process your payment automatically on the next payout cycle.'
      },
      {
        question: 'How are royalties calculated?',
        answer: 'Royalties vary by platform and are based on factors like subscription vs free tier, country, and total platform streams. We provide detailed analytics showing earnings per platform, per song, and per territory.'
      },
    ],
  },
  {
    category: 'Social Media Automation',
    questions: [
      {
        question: 'Which social media platforms are supported?',
        answer: 'Max Booster integrates with Instagram, Facebook, Twitter/X, TikTok, YouTube, LinkedIn, and Threads. You can schedule posts, track engagement, and automate your music marketing across all platforms.'
      },
      {
        question: 'Can AI help write my social media posts?',
        answer: 'Yes! Our AI-powered content generator creates engaging posts, captions, and hashtags tailored to each platform. It understands music marketing best practices and can generate content that resonates with your audience.'
      },
      {
        question: 'How do I connect my social media accounts?',
        answer: 'Go to the Social Media page and click "Connect Account" for each platform you want to link. You\'ll be redirected to authorize Max Booster to post on your behalf. You maintain full control and can disconnect anytime.'
      },
    ],
  },
  {
    category: 'Account & Billing',
    questions: [
      {
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes! Monthly and yearly subscriptions can be canceled anytime from the Settings page. Your access continues until the end of your billing period. Lifetime subscriptions are non-refundable.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and debit cards through our secure payment processor, Stripe.'
      },
      {
        question: 'Can I upgrade or downgrade my plan?',
        answer: 'Yes! You can change your subscription plan anytime from Settings > Billing. Upgrades take effect immediately, downgrades at the end of your current billing cycle.'
      },
      {
        question: 'Do you offer refunds?',
        answer: 'Monthly and yearly subscriptions can be canceled for a prorated refund within 7 days of purchase. Lifetime subscriptions are final sale. If you experience technical issues, contact support for assistance.'
      },
    ],
  },
];

const resources = [
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video guides for all features',
    icon: Video,
    link: '/tutorials',
  },
  {
    title: 'Documentation',
    description: 'Comprehensive guides and API references',
    icon: Book,
    link: '/docs',
  },
  {
    title: 'Feature Updates',
    description: 'Latest features and improvements',
    icon: Zap,
    link: '/changelog',
  },
  {
    title: 'Music Industry Guide',
    description: 'Learn about distribution and royalties',
    icon: FileText,
    link: '/guides',
  },
];

export default function Help() {
  const [navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [contactForm, setContactForm] = useState({
    email: '',
    subject: '',
    message: ''
  });

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  // Button handlers
  const handleEmailSupport = () => {
    window.location.href = 'mailto:support@maxbooster.ai?subject=Support Request';
  };

  const handleLiveChat = () => {
    setChatOpen(true);
  };

  const handleContactSupport = () => {
    setContactOpen(true);
  };

  const handleResourceClick = (link: string) => {
    navigate(link);
  };

  const handleSendChat = () => {
    if (chatMessage.trim()) {
      toast({
        title: 'Message Sent',
        description: 'A support agent will respond shortly in this chat.',
      });
      setChatMessage('');
      // In a real app, this would send to a chat backend
    }
  };

  const handleSendContact = () => {
    if (contactForm.email && contactForm.subject && contactForm.message) {
      toast({
        title: 'Support Request Sent',
        description: 'We\'ll get back to you within 24 hours.',
      });
      setContactOpen(false);
      setContactForm({ email: '', subject: '', message: '' });
      // In a real app, this would send to an email backend
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions, explore tutorials, and get the most out of Max Booster
          </p>
        </div>

        {/* Search */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for answers..."
                className="pl-10 py-6"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-help"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {resources.map((resource, index) => (
            <Card key={index} className="hover:shadow-lg transition cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                  <resource.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{resource.description}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 dark:text-blue-400"
                  onClick={() => handleResourceClick(resource.link)}
                  data-testid={`button-resource-${index}`}
                >
                  Explore <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Email Support</span>
              </CardTitle>
              <CardDescription>
                Get personalized help and support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Send an email and I'll personally get back to you within 24 hours
              </p>
              <Button 
                className="w-full" 
                data-testid="button-email-support"
                onClick={handleEmailSupport}
              >
                <Mail className="w-4 h-4 mr-2" />
                support@maxbooster.ai
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>Live Chat</span>
              </CardTitle>
              <CardDescription>
                Get real-time support directly from the founder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Available Monday-Friday, 9am-6pm EST
              </p>
              <Button 
                className="w-full" 
                variant="outline" 
                data-testid="button-live-chat"
                onClick={handleLiveChat}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              filteredFAQs.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">
                    {category.category}
                  </h3>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`${categoryIndex}-${index}`}>
                        <AccordionTrigger className="text-left" data-testid={`faq-question-${categoryIndex}-${index}`}>
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 dark:text-gray-300">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Still Need Help */}
        <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="mb-6 text-blue-100">
            I'm here to personally help you succeed with Max Booster
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              variant="secondary" 
              size="lg" 
              data-testid="button-contact-support"
              onClick={handleContactSupport}
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-transparent border-white text-white hover:bg-white/10"
              onClick={handleLiveChat}
              data-testid="button-live-chat-footer"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Live Chat
            </Button>
          </div>
        </div>

        {/* Live Chat Dialog */}
        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Live Chat Support</DialogTitle>
              <DialogDescription>
                Chat with our support team in real-time
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-y-auto">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mb-2">
                  <p className="text-sm font-medium">Support Agent</p>
                  <p className="text-sm">Hello! How can I help you today?</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  data-testid="input-chat-message"
                />
                <Button onClick={handleSendChat} data-testid="button-send-chat">
                  Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contact Support Dialog */}
        <Dialog open={contactOpen} onOpenChange={setContactOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Contact Support</DialogTitle>
              <DialogDescription>
                Send us a message and we'll get back to you within 24 hours
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="your@email.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  data-testid="input-contact-email"
                />
              </div>
              <div>
                <Label htmlFor="contact-subject">Subject</Label>
                <Input
                  id="contact-subject"
                  placeholder="What's this about?"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  data-testid="input-contact-subject"
                />
              </div>
              <div>
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  placeholder="Describe your issue or question..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={4}
                  data-testid="input-contact-message"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setContactOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendContact} data-testid="button-send-contact">
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
