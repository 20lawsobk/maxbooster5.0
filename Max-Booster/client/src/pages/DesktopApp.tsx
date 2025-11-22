import { Download, Monitor, Zap, Shield, Cpu, HardDrive, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DesktopApp() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Zap,
      title: t('desktopApp.features.performance.title'),
      description: t('desktopApp.features.performance.description'),
    },
    {
      icon: Shield,
      title: t('desktopApp.features.security.title'),
      description: t('desktopApp.features.security.description'),
    },
    {
      icon: Monitor,
      title: t('desktopApp.features.offline.title'),
      description: t('desktopApp.features.offline.description'),
    },
    {
      icon: Cpu,
      title: t('desktopApp.features.native.title'),
      description: t('desktopApp.features.native.description'),
    },
  ];

  const platforms = [
    {
      name: 'Windows',
      icon: '🪟',
      downloadUrl: '#',
      requirements: t('desktopApp.requirements.windows'),
    },
    {
      name: 'macOS',
      icon: '🍎',
      downloadUrl: '#',
      requirements: t('desktopApp.requirements.mac'),
    },
    {
      name: 'Linux',
      icon: '🐧',
      downloadUrl: '#',
      requirements: t('desktopApp.requirements.linux'),
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
          <Monitor className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          {t('desktopApp.title')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('desktopApp.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center">
          {t('desktopApp.downloadTitle')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <Card key={platform.name} className="border-2">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">{platform.icon}</div>
                <CardTitle className="text-2xl">{platform.name}</CardTitle>
                <CardDescription className="text-sm">
                  {platform.requirements}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  {t('desktopApp.downloadButton')} {platform.name}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {t('desktopApp.version')}: 1.0.0
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            <CardTitle>{t('desktopApp.webVersion.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('desktopApp.webVersion.description')}
          </p>
          <Button variant="outline" size="lg">
            {t('desktopApp.webVersion.button')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            {t('desktopApp.systemRequirements.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Windows</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Windows 10 or later (64-bit)</li>
                <li>• 4GB RAM minimum</li>
                <li>• 500MB free disk space</li>
                <li>• Internet connection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">macOS</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• macOS 10.15 or later</li>
                <li>• 4GB RAM minimum</li>
                <li>• 500MB free disk space</li>
                <li>• Internet connection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Linux</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ubuntu 20.04+ or equivalent</li>
                <li>• 4GB RAM minimum</li>
                <li>• 500MB free disk space</li>
                <li>• Internet connection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>{t('desktopApp.faq.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">{t('desktopApp.faq.question1')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('desktopApp.faq.answer1')}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">{t('desktopApp.faq.question2')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('desktopApp.faq.answer2')}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">{t('desktopApp.faq.question3')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('desktopApp.faq.answer3')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
