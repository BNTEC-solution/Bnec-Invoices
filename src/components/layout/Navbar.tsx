import { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut, Moon, Sun, Home, Layout, Menu, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-provider';
import { NavLink } from 'react-router-dom';
import { Input } from '../ui/Input';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export function Navbar({ onSearch }: NavbarProps) {
  const { user, profile, organization, role, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="h-20 bg-background border-b border-border px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-background/80">
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-4 text-muted-foreground mr-4">
           <NavLink to="/">
              <Button variant="ghost" size="sm" className="hidden lg:flex items-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                <Home className="w-4 h-4" />
                Landing
              </Button>
           </NavLink>
           <div className="h-6 w-px bg-border hidden lg:block" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg hidden sm:flex">
             <Layout className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-foreground truncate max-w-[200px]">
            {organization?.name || 'Workspace'}
          </span>
        </div>

        <div className="relative max-w-md w-full ml-8 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search') + "..."}
            className="pl-10 h-10 bg-muted/40 border-none rounded-xl"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <button 
          onClick={toggleLanguage}
          className="flex items-center justify-center p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-all font-bold text-xs"
          title={i18n.language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
        >
          {i18n.language === 'en' ? 'AR' : 'EN'}
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="rounded-xl text-muted-foreground hover:text-foreground"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground group relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        </Button>

        <div className="h-8 w-px bg-border mx-2" />

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 hover:bg-muted rounded-2xl transition-all"
          >
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold text-foreground leading-tight">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{role || 'Member'}</p>
            </div>
            <Menu className="w-4 h-4 text-muted-foreground ml-1" />
          </button>

          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-2xl shadow-2xl p-2 z-20 animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-border/50 mb-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Signed in as</p>
                  <p className="text-sm font-bold truncate">{profile?.email || 'user@example.com'}</p>
                </div>
                
                <NavLink to="/app/settings">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-muted rounded-xl transition-colors">
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>
                </NavLink>
                
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-muted rounded-xl transition-colors">
                  <HelpCircle className="w-4 h-4" />
                  Support & Help
                </button>

                <div className="h-px bg-border/50 my-2" />
                
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
