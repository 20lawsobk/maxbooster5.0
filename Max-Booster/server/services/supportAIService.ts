import { aiService } from './aiService';
import { knowledgeBaseService } from './knowledgeBaseService';
import { supportTicketService } from './supportTicketService';
import { logger } from '../logger.js';

interface SupportQuery {
  question: string;
  userId?: string;
  context?: any;
}

interface AIResponse {
  answer: string;
  confidence: number;
  suggestedArticles: unknown[];
  shouldEscalate: boolean;
  category?: string;
}

export class SupportAIService {
  private commonQuestions = new Map<string, { answer: string; category: string }>([
    [
      'how to reset password',
      {
        answer:
          "To reset your password:\n1. Go to the login page\n2. Click 'Forgot Password'\n3. Enter your email address\n4. Check your email for a reset link\n5. Follow the link and create a new password\n\nIf you don't receive the email within 5 minutes, please check your spam folder or contact support.",
        category: 'account',
      },
    ],
    [
      'how to upload music',
      {
        answer:
          "To upload and distribute your music:\n1. Go to the Distribution page\n2. Click 'New Release'\n3. Upload your audio file (WAV or FLAC recommended)\n4. Upload artwork (3000x3000 pixels)\n5. Fill in metadata (title, artist, genre, etc.)\n6. Select distribution platforms\n7. Submit for review\n\nYour music typically goes live within 1-3 business days.",
        category: 'distribution',
      },
    ],
    [
      'when will i get paid',
      {
        answer:
          'Royalty payments work as follows:\n- Streaming platforms pay 60-90 days after streams occur\n- We process payouts monthly\n- Minimum payout threshold: $10\n- You keep 100% of your royalties\n\nYou can track your earnings in real-time on the Royalties page. Once you reach $10, payment will be processed automatically on the next monthly cycle.',
        category: 'royalties',
      },
    ],
    [
      'how to cancel subscription',
      {
        answer:
          "To cancel your subscription:\n1. Go to Settings > Billing\n2. Click 'Manage Subscription'\n3. Select 'Cancel Subscription'\n4. Confirm cancellation\n\nYour access continues until the end of your current billing period. You can reactivate anytime before the period ends. Lifetime subscriptions cannot be canceled.",
        category: 'billing',
      },
    ],
    [
      'supported platforms',
      {
        answer:
          'Max Booster distributes to 150+ platforms including:\n\n**Major Platforms:**\n- Spotify\n- Apple Music\n- YouTube Music\n- Amazon Music\n- Tidal\n- Deezer\n\n**Social Platforms:**\n- TikTok\n- Instagram\n- Facebook\n\nAnd many more! You can select which platforms to distribute to when creating a release.',
        category: 'distribution',
      },
    ],
    [
      'ai tools',
      {
        answer:
          'Max Booster offers several AI-powered tools:\n\n**Music Production:**\n- AI Mixer: Automatic level balancing, EQ, and compression\n- AI Mastering: Professional mastering for streaming platforms\n- Beat Generation: Create custom beats and instrumentals\n\n**Content Creation:**\n- Social Media Post Generator\n- Hashtag Suggestions\n- Caption Writing\n- Content Calendar Planning\n\n**Analytics:**\n- Predictive Analytics\n- Audience Insights\n- Performance Optimization\n\nAll AI tools are included in your subscription!',
        category: 'features',
      },
    ],
    [
      'how to contact support',
      {
        answer:
          'You can contact support through:\n\n1. **Live Chat**: Click the chat button in the bottom-right corner for instant help\n2. **Support Ticket**: Go to Help > Contact Support to create a ticket\n3. **Email**: support@maxbooster.ai\n\nOur team typically responds within 24 hours. For urgent issues, use live chat for fastest response.',
        category: 'support',
      },
    ],
  ]);

  async answerQuestion(query: SupportQuery): Promise<AIResponse> {
    const normalizedQuestion = query.question.toLowerCase().trim();

    const directAnswer = this.findDirectAnswer(normalizedQuestion);
    if (directAnswer) {
      const articles = await this.findRelevantArticles(normalizedQuestion);
      return {
        answer: directAnswer.answer,
        confidence: 0.95,
        suggestedArticles: articles,
        shouldEscalate: false,
        category: directAnswer.category,
      };
    }

    const articles = await knowledgeBaseService.searchArticles(query.question, undefined, 5);

    if (articles.length > 0) {
      const topArticle = articles[0];
      const snippet = this.extractSnippet(topArticle.content, query.question);

      return {
        answer: `Based on our knowledge base:\n\n${snippet}\n\nFor more details, please check the full article: "${topArticle.title}"`,
        confidence: 0.75,
        suggestedArticles: articles,
        shouldEscalate: false,
        category: topArticle.category,
      };
    }

    const complexityScore = this.analyzeComplexity(query.question);
    if (complexityScore > 0.7) {
      return {
        answer:
          "This seems like a complex question that would benefit from human support. I've escalated this to our support team who will provide a detailed response. In the meantime, you might find these articles helpful:",
        confidence: 0.4,
        suggestedArticles: await knowledgeBaseService.getPopularArticles(3),
        shouldEscalate: true,
      };
    }

    try {
      const aiGeneratedAnswer = await this.generateAIAnswer(query.question);
      return {
        answer: aiGeneratedAnswer,
        confidence: 0.6,
        suggestedArticles: articles,
        shouldEscalate: false,
      };
    } catch (error: unknown) {
      logger.error('AI generation failed:', error);
      return {
        answer:
          "I apologize, but I'm having trouble understanding your question. Our support team can help! Would you like to create a support ticket or try rephrasing your question?",
        confidence: 0.3,
        suggestedArticles: [],
        shouldEscalate: true,
      };
    }
  }

  private findDirectAnswer(question: string): { answer: string; category: string } | null {
    for (const [key, value] of this.commonQuestions) {
      if (question.includes(key) || this.calculateSimilarity(question, key) > 0.7) {
        return value;
      }
    }
    return null;
  }

  private async findRelevantArticles(question: string) {
    const keywords = this.extractKeywords(question);
    const articles = await knowledgeBaseService.searchArticles(keywords.join(' '), undefined, 3);
    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      views: a.views,
    }));
  }

  private extractSnippet(content: string, query: string): string {
    const sentences = content.split(/[.!?]+/).map((s) => s.trim());

    const queryWords = query.toLowerCase().split(/\s+/);
    let bestSentence = sentences[0] || content.substring(0, 200);
    let maxScore = 0;

    for (const sentence of sentences) {
      if (sentence.length < 20) continue;
      const sentenceLower = sentence.toLowerCase();
      const score = queryWords.filter((word) => sentenceLower.includes(word)).length;
      if (score > maxScore) {
        maxScore = score;
        bestSentence = sentence;
      }
    }

    return bestSentence.length > 300 ? bestSentence.substring(0, 297) + '...' : bestSentence;
  }

  private analyzeComplexity(question: string): number {
    const indicators = [
      question.includes('why'),
      question.includes('how come'),
      question.includes('explain'),
      question.includes('detailed'),
      question.includes('specific'),
      question.split(' ').length > 20,
      question.includes('?') && question.split('?').length > 2,
    ];

    return indicators.filter((i) => i).length / indicators.length;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const commonWords = words1.filter((w) => words2.includes(w));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'how',
      'what',
      'when',
      'where',
      'why',
      'is',
      'are',
      'can',
      'do',
      'does',
      'my',
      'i',
      'me',
    ]);

    const words = text
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ''))
      .filter((w) => w.length > 2 && !stopWords.has(w));

    return Array.from(new Set(words));
  }

  private async generateAIAnswer(question: string): Promise<string> {
    try {
      const prompt = `You are a helpful customer support assistant for Max Booster, a music distribution and production platform.

User question: ${question}

Provide a clear, concise, and helpful answer. If you're not certain about the answer, acknowledge that and suggest contacting support for more details.

Answer:`;

      const response = await aiService.generateSocialContent({
        platform: 'twitter',
        contentType: 'post',
        customPrompt: prompt,
      });

      return response.content;
    } catch (error: unknown) {
      throw new Error('Failed to generate AI answer');
    }
  }

  async categorizeTicket(subject: string, description: string): Promise<string> {
    const text = `${subject} ${description}`.toLowerCase();

    const categories = {
      billing: ['payment', 'subscription', 'refund', 'charge', 'billing', 'invoice', 'price'],
      distribution: ['distribute', 'release', 'platform', 'spotify', 'apple music', 'upload'],
      royalties: ['royalty', 'payment', 'earnings', 'payout', 'revenue', 'money'],
      technical: ['error', 'bug', 'crash', 'not working', 'broken', 'issue', 'problem'],
      account: ['password', 'login', 'email', 'account', 'profile', 'access'],
      features: ['how to', 'feature', 'ai', 'tool', 'studio', 'mixer'],
    };

    let bestCategory = 'general';
    let maxScore = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const score = keywords.filter((keyword) => text.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  async suggestResponse(ticketId: string): Promise<string> {
    const ticket = await supportTicketService.getTicketById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const response = await this.answerQuestion({
      question: `${ticket.subject}. ${ticket.description}`,
    });

    return response.answer;
  }
}

export const supportAIService = new SupportAIService();
