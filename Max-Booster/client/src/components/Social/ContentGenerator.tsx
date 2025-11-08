import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

export function ContentGenerator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Content Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">Generate optimized social media content with AI</p>
        <Button>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Content
        </Button>
      </CardContent>
    </Card>
  );
}
