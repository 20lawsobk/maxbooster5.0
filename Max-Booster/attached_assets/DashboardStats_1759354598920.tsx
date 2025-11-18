import React from 'react';
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
  Crown,
} from 'lucide-react';

export default function DashboardStats() {
  const { ads, aiInsights } = useAdvertisement();

  // Calculate totals
  const totalSpent = ads.reduce((acc, ad) => acc + ad.spent, 0);
  const totalImpressions = ads.reduce((acc, ad) => acc + ad.impressions, 0);
  const totalClicks = ads.reduce((acc, ad) => acc + ad.clicks, 0);
  const totalConversions = ads.reduce((acc, ad) => acc + ad.conversions, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const activeCampaigns = ads.filter((ad) => ad.status === 'active').length;

  const stats = [
    {
      title: 'Total Spent',
      value: '$0',
      subtitle: 'AI eliminates all costs',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      title: 'Impressions',
      value: totalImpressions.toLocaleString(),
      subtitle: '+1000% vs traditional ads',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Clicks',
      value: totalClicks.toLocaleString(),
      subtitle: '+800% vs traditional ads',
      icon: MousePointerClick,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Viral Rate',
      value: '15%',
      subtitle: '500x industry average',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns.toString(),
      subtitle: 'AI-powered campaigns',
      icon: Rocket,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
    },
    {
      title: 'AI Domination',
      value: '100%',
      subtitle: 'Complete platform control',
      icon: Crown,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg transition-all duration-300`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor} ${stat.borderColor} border-2`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
