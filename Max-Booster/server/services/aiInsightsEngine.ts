import { type Project } from '@shared/schema';

interface DashboardStats {
  totalStreams: number;
  totalRevenue: number;
  totalProjects: number;
  totalFollowers: number;
  monthlyGrowth: {
    streams: number;
    revenue: number;
    projects: number;
    followers: number;
  };
  topPlatforms: Array<{
    name: string;
    streams: number;
    revenue: number;
    growth: number;
  }>;
}

interface AIRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'marketing' | 'distribution' | 'content' | 'social';
}

interface AIOptimizations {
  recommendations: AIRecommendation[];
  summary: string;
}

export class CustomAIEngine {
  /**
   * Generate content optimization recommendations using rule-based AI
   */
  generateOptimizations(
    stats: DashboardStats,
    projects: Project[],
    historicalData?: any[]
  ): AIOptimizations {
    const recommendations: AIRecommendation[] = [];
    
    // Rule 1: Low streams recommendation
    if (stats.totalStreams < 10000) {
      recommendations.push({
        title: "Increase Platform Distribution",
        description: "Your music is currently reaching a limited audience. Consider distributing to additional streaming platforms like TikTok and Instagram Reels to maximize discovery.",
        priority: "high",
        category: "distribution"
      });
    }
    
    // Rule 2: Negative growth
    if (stats.monthlyGrowth.streams < 0) {
      recommendations.push({
        title: "Reverse Declining Streams",
        description: "Your streams have decreased this month. Focus on social media engagement, collaborate with other artists, and consider releasing new content or remixes.",
        priority: "high",
        category: "marketing"
      });
    }
    
    // Rule 3: High engagement potential
    if (stats.monthlyGrowth.streams > 20) {
      recommendations.push({
        title: "Capitalize on Growth Momentum",
        description: "You're experiencing strong growth! Now is the perfect time to increase posting frequency, launch a marketing campaign, and engage with your growing fanbase.",
        priority: "high",
        category: "social"
      });
    }
    
    // Rule 4: Platform diversification
    if (stats.topPlatforms.length < 3) {
      recommendations.push({
        title: "Diversify Platform Presence",
        description: "You're focused on only a few platforms. Expand to additional platforms to reduce dependency and reach new audiences.",
        priority: "medium",
        category: "distribution"
      });
    }
    
    // Rule 5: Content frequency
    if (projects.length < 5) {
      recommendations.push({
        title: "Increase Content Output",
        description: "Artists with more releases tend to grow faster. Aim to release new music consistently - at least one track per month to maintain audience engagement.",
        priority: "medium",
        category: "content"
      });
    }
    
    // Rule 6: Revenue optimization
    if (stats.totalRevenue < 100 && stats.totalStreams > 5000) {
      recommendations.push({
        title: "Optimize Revenue Streams",
        description: "Your streams aren't translating to revenue. Explore direct fan support through platforms like Patreon, sell merchandise, or offer exclusive content.",
        priority: "high",
        category: "marketing"
      });
    }
    
    // Limit to top 5 recommendations
    const topRecommendations = recommendations.slice(0, 5);
    
    // Generate summary
    const summary = `Based on your current performance (${stats.totalStreams.toLocaleString()} streams, $${stats.totalRevenue.toLocaleString()} revenue), we've identified ${topRecommendations.length} optimization opportunities to accelerate your music career growth.`;
    
    return {
      recommendations: topRecommendations,
      summary
    };
  }
  
  /**
   * Forecast next month metrics using exponential smoothing
   */
  forecastNextMonth(historicalData: number[]): number {
    if (historicalData.length === 0) return 0;
    if (historicalData.length === 1) return historicalData[0] * 1.1; // Assume 10% growth
    
    // Simple exponential smoothing with alpha = 0.3
    const alpha = 0.3;
    let forecast = historicalData[0];
    
    for (let i = 1; i < historicalData.length; i++) {
      forecast = alpha * historicalData[i] + (1 - alpha) * forecast;
    }
    
    // Apply trend adjustment
    const recentTrend = historicalData[historicalData.length - 1] - historicalData[historicalData.length - 2];
    forecast = forecast + recentTrend * 0.5;
    
    return Math.max(0, Math.round(forecast));
  }
  
  /**
   * Calculate viral potential score (0-1)
   */
  calculateViralPotential(stats: DashboardStats): number {
    // Factors: growth velocity, engagement, platform diversity
    const growthScore = Math.min(stats.monthlyGrowth.streams / 100, 1) * 0.4;
    const revenueScore = Math.min(stats.totalRevenue / 1000, 1) * 0.3;
    const platformScore = Math.min(stats.topPlatforms.length / 5, 1) * 0.3;
    
    return Math.min(growthScore + revenueScore + platformScore, 1);
  }
  
  /**
   * Determine growth trend
   */
  getGrowthTrend(monthlyGrowth: { streams: number; revenue: number }): 'up' | 'down' | 'stable' {
    const avgGrowth = (monthlyGrowth.streams + monthlyGrowth.revenue) / 2;
    if (avgGrowth > 5) return 'up';
    if (avgGrowth < -5) return 'down';
    return 'stable';
  }
}

export const customAIEngine = new CustomAIEngine();
