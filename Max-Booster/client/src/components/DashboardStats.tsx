import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdvertisement } from '@/hooks/use-advertisement';
import {
  DollarSign,
  Eye,
  MousePointerClick,
  Target,
  TrendingUp,
  Users,
  Brain,
  Rocket,
  Shield,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardStats() {
  const { ads, aiInsights } = useAdvertisement();
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate totals
  const totalSpent = ads.reduce((acc, ad) => acc + ad.spent, 0);
  const totalImpressions = ads.reduce((acc, ad) => acc + ad.impressions, 0);
  const totalClicks = ads.reduce((acc, ad) => acc + ad.clicks, 0);
  const totalConversions = ads.reduce((acc, ad) => acc + ad.conversions, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const activeCampaigns = ads.filter(ad => ad.status === 'active').length;

  const stats = [
    {
      title: 'Total Spent',
      value: '$0',
      subtitle: 'AI eliminates all costs',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800',
      glowColor: 'hover:shadow-green-500/20'
    },
    {
      title: 'Impressions',
      value: totalImpressions.toLocaleString(),
      subtitle: '+1000% vs traditional ads',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      glowColor: 'hover:shadow-blue-500/20'
    },
    {
      title: 'Clicks',
      value: totalClicks.toLocaleString(),
      subtitle: '+800% vs traditional ads',
      icon: MousePointerClick,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      glowColor: 'hover:shadow-purple-500/20'
    },
    {
      title: 'Viral Rate',
      value: '15%',
      subtitle: '500x industry average',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      glowColor: 'hover:shadow-orange-500/20'
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns.toString(),
      subtitle: 'AI-powered campaigns',
      icon: Rocket,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
      glowColor: 'hover:shadow-cyan-500/20'
    },
    {
      title: 'AI Domination',
      value: '100%',
      subtitle: 'Complete platform control',
      icon: Crown,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
      glowColor: 'hover:shadow-pink-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className={cn(
              "group relative overflow-hidden",
              stat.bgColor, 
              stat.borderColor,
              "border-2",
              "transition-all duration-300 ease-out",
              "hover:shadow-xl hover:-translate-y-1",
              stat.glowColor,
              isAnimating ? "animate-fade-in opacity-100" : "opacity-0"
            )}
            style={{ 
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            {/* Gradient overlay for premium feel */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {stat.title}
                  </p>
                  <div className="overflow-hidden">
                    <p className={cn(
                      "text-2xl font-bold transition-all duration-300 ease-out",
                      stat.color,
                      "group-hover:scale-105 group-hover:translate-x-1"
                    )}>
                      {stat.value}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 transition-all duration-200 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={cn(
                  "p-3 rounded-full transition-all duration-300 ease-out",
                  stat.bgColor, 
                  stat.borderColor,
                  "border-2",
                  "group-hover:scale-110 group-hover:rotate-12"
                )}>
                  <Icon className={cn(
                    "w-6 h-6 transition-all duration-300",
                    stat.color,
                    "group-hover:scale-110"
                  )} />
                </div>
              </div>
              
              {/* Progress bar animation */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={cn("h-full", stat.color, "animate-pulse")} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}