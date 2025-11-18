// Env-driven platform API stubs compatible with Replit deployment

type PublishResult = { platform: string; success: boolean; postId?: string; error?: string };

function apiBase(): string {
  return process.env.EXTERNAL_API_BASE_URL || process.env.REPLIT_API_BASE_URL || '';
}

export const platformAPI = {
  async publishContent(content: any, platforms: string[]): Promise<PublishResult[]> {
    const base = apiBase();
    if (!base) {
      // Simulate success in absence of external API
      return platforms.map((p) => ({ platform: p, success: true, postId: `${p}-${Date.now()}` }));
    }

    const results: PublishResult[] = [];
    for (const p of platforms) {
      try {
        const res = await fetch(`${base}/platforms/${p}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        results.push({ platform: p, success: true, postId: data.postId });
      } catch (e: any) {
        results.push({ platform: p, success: false, error: e?.message || 'publish failed' });
      }
    }
    return results;
  },

  async collectEngagementData(postId: string, platform: string): Promise<any> {
    const base = apiBase();
    if (!base) {
      // Simulated analytics
      return {
        likes: Math.floor(Math.random() * 500),
        shares: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 80),
        views: Math.floor(Math.random() * 10000),
        reach: Math.floor(Math.random() * 20000),
        engagementRate: Number((Math.random() * 0.08).toFixed(4)),
      };
    }
    const res = await fetch(`${base}/platforms/${platform}/engagement/${postId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
