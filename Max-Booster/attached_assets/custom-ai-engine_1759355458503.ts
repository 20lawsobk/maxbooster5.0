// Minimal AI engine stub with env-driven endpoint for Replit

function aiBase(): string {
  return process.env.EXTERNAL_API_BASE_URL || process.env.REPLIT_API_BASE_URL || '';
}

export const customAI = {
  async generateContent(params: {
    topic: string;
    platform: string;
    brandVoice: string;
    contentType: string;
    targetAudience: string;
    businessGoals: string[];
  }): Promise<{ text: string; hashtags: string[] }> {
    const base = aiBase();
    if (!base) {
      // Local synthetic content
      const text = `${params.contentType.toUpperCase()}: ${params.topic} for ${params.platform} — voice: ${params.brandVoice}`;
      const hashtags = ['#Music', '#MaxBooster', '#AI'];
      return { text, hashtags };
    }
    const res = await fetch(`${base}/ai/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
    return res.json();
  },

  updatePerformanceData(
    contentType: string,
    platform: string,
    templateIndex: number,
    analytics: any
  ) {
    // No-op locally; in Replit you can forward this to your learning endpoint
    // Fire-and-forget
    const base = aiBase();
    if (!base) return;
    fetch(`${base}/ai/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, platform, templateIndex, analytics }),
    }).catch(() => void 0);
  },
};
