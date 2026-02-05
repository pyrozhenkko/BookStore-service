import { ShoppingCart, User, LogOut, BookOpen, Users, ShoppingBag, Package, ScrollText, Heart, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { currentUser, logout, isEmployee, isAdmin, isCustomer } = useAuth();
  const { totalItems } = useCart();
  const { favoriteIds } = useFavorites();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onViewChange('catalog')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="size-8 text-blue-600" />
              <span className="text-xl font-semibold">BookStore</span>
            </button>

            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant={currentView === 'catalog' ? 'default' : 'ghost'}
                onClick={() => onViewChange('catalog')}
              >
                {t('header.catalog')}
              </Button>

              {/* Меню для адміна */}
              {isAdmin && (
                <>
                  <Button
                    variant={currentView === 'employees' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('employees')}
                  >
                    <Users className="size-4 mr-2" />
                    {t('header.employees')}
                  </Button>
                  <Button
                    variant={currentView === 'manage-books' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('manage-books')}
                  >
                    <BookOpen className="size-4 mr-2" />
                    {t('header.books')}
                  </Button>
                  <Button
                    variant={currentView === 'all-orders' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('all-orders')}
                  >
                    <Package className="size-4 mr-2" />
                    {t('header.orders')}
                  </Button>
                  <Button
                    variant={currentView === 'clients' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('clients')}
                  >
                    <ShoppingBag className="size-4 mr-2" />
                    {t('header.clients')}
                  </Button>
                  <Button
                    variant={currentView === 'admin-logs' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('admin-logs')}
                  >
                    <ScrollText className="size-4 mr-2" />
                    {t('header.logs')}
                  </Button>
                </>
              )}

              {/* Меню для працівника */}
              {isEmployee && !isAdmin && (
                <>
                  <Button
                    variant={currentView === 'manage-books' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('manage-books')}
                  >
                    <BookOpen className="size-4 mr-2" />
                    {t('header.books')}
                  </Button>
                  <Button
                    variant={currentView === 'all-orders' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('all-orders')}
                  >
                    <Package className="size-4 mr-2" />
                    {t('header.orders')}
                  </Button>
                  <Button
                    variant={currentView === 'clients' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('clients')}
                  >
                    <ShoppingBag className="size-4 mr-2" />
                    {t('header.clients')}
                  </Button>
                </>
              )}

              {/* Меню для звичайного клієнта */}
              {isCustomer && (
                <>
                  <Button
                    variant={currentView === 'orders' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('orders')}
                  >
                    {t('header.myOrders')}
                  </Button>
                  <Button
                    variant={currentView === 'favorites' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('favorites')}
                  >
                    <Heart className="size-4 mr-2" />
                    {t('header.favorites')}
                  </Button>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="size-4" />
                  <span className="hidden sm:inline">{language === 'uk' ? '🇺🇦' : '🇬🇧'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setLanguage('uk')}
                  className={language === 'uk' ? 'bg-accent' : ''}
                >
                  🇺🇦 {t('language.uk')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-accent' : ''}
                >
                  🇬🇧 {t('language.en')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isCustomer && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onViewChange('favorites')}
                  className="relative"
                  title={t('header.favorites')}
                >
                  <Heart className="size-5" />
                  {favoriteIds.size > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 size-5 flex items-center justify-center p-0 text-xs"
                    >
                      {favoriteIds.size}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onViewChange('cart')}
                  className="relative"
                >
                  <ShoppingCart className="size-5" />
                  {totalItems > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 size-5 flex items-center justify-center p-0 text-xs"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onViewChange('profile')}
                  className="flex items-center gap-2"
                >
                  <User className="size-4" />
                  <span className="hidden md:inline">{t('header.profile')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={logout}
                  title={t('header.logout')}
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => onViewChange('login')}>
                {t('header.login')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

