import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Music, 
  BarChart3, 
  Share2, 
  Megaphone, 
  ShoppingBag, 
  DollarSign, 
  Disc, 
  Radio,
  Shield,
  Brain,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', path: '/projects', icon: Music },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'AI Analytics', path: '/analytics/ai', icon: Brain },
  { label: 'Social Media', path: '/social-media', icon: Share2 },
  { label: 'Advertising', path: '/advertising', icon: Megaphone },
  { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
  { label: 'Royalties', path: '/royalties', icon: DollarSign },
  { label: 'Studio', path: '/studio', icon: Disc },
  { label: 'Distribution', path: '/distribution', icon: Radio },
  { label: 'Admin', path: '/admin', icon: Shield, adminOnly: true },
  { label: 'Security', path: '/admin/security', icon: Shield, adminOnly: true },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';
  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onMobileClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full transition-transform duration-300 lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Max Booster</h2>
          </div>
          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMobileClose}
            data-testid="sidebar-close"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {user.subscriptionPlan === 'lifetime' ? '🎵 Lifetime Access' : 
           user.subscriptionPlan === 'yearly' ? '📅 Yearly Plan' : 
           user.subscriptionPlan === 'monthly' ? '📆 Monthly Plan' : 'Free'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || location.startsWith(item.path + '/');
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out group",
                isActive 
                  ? "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm"
              )}
              onClick={(e) => {
                // Close mobile menu immediately on click
                if (onMobileClose) {
                  onMobileClose();
                }
              }}
              data-testid={`nav-${item.path.replace('/', '')}`}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-4 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p className="font-medium text-gray-700 dark:text-gray-300">{user.username}</p>
          <p className="truncate">{user.email}</p>
          {isAdmin && (
            <span className="inline-block mt-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
              Admin
            </span>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}
