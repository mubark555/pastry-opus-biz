import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Building2, ShoppingCart, 
  ChefHat, Truck, CreditCard, Warehouse, Settings, Cookie, Tag, Globe
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';

const AppLayout = () => {
  const { t, lang, setLanguage, isRTL } = useLanguage();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t.nav.dashboard },
    { to: '/products', icon: Package, label: t.nav.products },
    { to: '/clients', icon: Building2, label: t.nav.clients },
    { to: '/client-pricing', icon: Tag, label: t.nav.clientPricing },
    { to: '/orders', icon: ShoppingCart, label: t.nav.orders },
    { to: '/kitchen', icon: ChefHat, label: t.nav.kitchen },
    { to: '/delivery', icon: Truck, label: t.nav.delivery },
    { to: '/finance', icon: CreditCard, label: t.nav.finance },
    { to: '/inventory', icon: Warehouse, label: t.nav.inventory },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-64 flex-shrink-0 bg-sidebar flex flex-col ${isRTL ? 'border-l' : 'border-r'} border-sidebar-border`}>
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Cookie className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">{t.appName}</h1>
            <p className="text-[10px] text-sidebar-foreground">{t.appSubtitle}</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          {/* Language Switcher */}
          <button 
            onClick={() => setLanguage(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
          >
            <Globe className="w-4 h-4" />
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors">
            <Settings className="w-4 h-4" />
            {t.settings}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
