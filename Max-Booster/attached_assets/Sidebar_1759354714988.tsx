import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Music,
  BarChart3,
  Share2,
  Target,
  ShoppingBag,
  DollarSign,
  Globe,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: Music },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Studio', href: '/studio', icon: Music },
  { name: 'Distribution', href: '/distribution', icon: Globe },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { name: 'Social Media', href: '/social-media', icon: Share2 },
  { name: 'Advertising', href: '/advertising', icon: Target },
  { name: 'Royalties', href: '/royalties', icon: DollarSign },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const Logo = () => (
    <div className="flex items-center space-x-3 mb-8">
      <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
        <Music className="h-6 w-6 text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Max Booster</h1>
        <p className="text-xs text-gray-500">AI Music Platform</p>
      </div>
    </div>
  );

  const NavItems = () => (
    <nav className="space-y-2">
      {navigation.map((item) => {
        const isActive = location === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover-lift',
              isActive ? 'nav-active text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}

      <div className="pt-6 border-t border-gray-200 mt-6">
        {secondaryNavigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover-lift',
                isActive ? 'nav-active text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'w-64 bg-white shadow-xl border-r border-gray-200 fixed lg:relative h-full lg:h-screen overflow-y-auto z-30 transform transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        <div className="p-6">
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden absolute top-4 right-4"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          <Logo />
          <NavItems />
        </div>
      </aside>
    </>
  );
}
