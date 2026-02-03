import { ShoppingCart, User, LogOut, BookOpen, Users, ShoppingBag, Package, ScrollText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { currentUser, logout, isEmployee, isAdmin, isCustomer } = useAuth();
  const { totalItems } = useCart();

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
                Каталог
              </Button>
              
              {/* Меню для адміна */}
              {isAdmin && (
                <>
                  <Button
                    variant={currentView === 'employees' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('employees')}
                  >
                    <Users className="size-4 mr-2" />
                    Працівники
                  </Button>
                  <Button
                    variant={currentView === 'manage-books' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('manage-books')}
                  >
                    <BookOpen className="size-4 mr-2" />
                    Книги
                  </Button>
                  <Button
                    variant={currentView === 'all-orders' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('all-orders')}
                  >
                    <Package className="size-4 mr-2" />
                    Замовлення
                  </Button>
                  <Button
                    variant={currentView === 'clients' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('clients')}
                  >
                    <ShoppingBag className="size-4 mr-2" />
                    Клієнти
                  </Button>
                  <Button
                    variant={currentView === 'admin-logs' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('admin-logs')}
                  >
                    <ScrollText className="size-4 mr-2" />
                    Логи
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
                    Книги
                  </Button>
                  <Button
                    variant={currentView === 'all-orders' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('all-orders')}
                  >
                    <Package className="size-4 mr-2" />
                    Замовлення
                  </Button>
                  <Button
                    variant={currentView === 'clients' ? 'default' : 'ghost'}
                    onClick={() => onViewChange('clients')}
                  >
                    <ShoppingBag className="size-4 mr-2" />
                    Клієнти
                  </Button>
                </>
              )}
              
              {/* Меню для звичайного клієнта */}
              {isCustomer && (
                <Button
                  variant={currentView === 'orders' ? 'default' : 'ghost'}
                  onClick={() => onViewChange('orders')}
                >
                  Мої замовлення
                </Button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isCustomer && (
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
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onViewChange('profile')}
                  className="flex items-center gap-2"
                >
                  <User className="size-4" />
                  <span className="hidden md:inline">{currentUser.name}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={logout}
                  title="Вийти"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => onViewChange('login')}>
                Увійти
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
