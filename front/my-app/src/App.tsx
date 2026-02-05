import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { RegisterPage } from './components/RegisterPage';
import { BookCatalog } from './components/BookCatalog';
import { BookDetails } from './components/BookDetails';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrdersPage } from './components/OrdersPage';
import { ProfilePage } from './components/ProfilePage';
import { EmployeesPage } from './components/EmployeesPage';
import { ClientsPage } from './components/ClientsPage';
import { AllOrdersPage } from './components/AllOrdersPage';
import { ManageBooksPage } from './components/ManageBooksPage';
import { AdminLogsPage } from './components/AdminLogsPage';
import { Footer } from './components/Footer';
import { AccessDenied } from './components/AccessDenied';
import type { Book } from './types';
import { Toaster } from './components/ui/sonner';
import { FavoritesPage } from './components/FavoritesPage';

type ViewType = 'login' | 'catalog' | 'details' | 'cart' | 'checkout' | 'orders' |
  'profile' | 'employees' | 'clients' | 'all-orders' | 'manage-books' | 'admin-logs' | 'access-denied' |
  'forgot-password' | 'reset-password' | 'register' | 'favorites';

function getViewFromHash(): ViewType | null {
  const hash = window.location.hash.replace('#', '').split('?')[0].replace(/^\/+/, '');
  if (!hash) return 'catalog';

  const validViews: ViewType[] = [
    'login', 'catalog', 'details', 'cart', 'checkout', 'orders',
    'profile', 'employees', 'clients', 'all-orders', 'manage-books',
    'admin-logs', 'access-denied', 'forgot-password', 'reset-password',
    'register', 'favorites'
  ];

  return validViews.includes(hash as ViewType) ? (hash as ViewType) : 'catalog';
}

function AppContent() {
  const { currentUser, isEmployee, isAdmin, isCustomer } = useAuth();

  const [currentView, setCurrentView] = useState<ViewType>(() => {
    return getViewFromHash() || 'catalog';
  });

  const [selectedBook, setSelectedBook] = useState<Book | null>(() => {
    const saved = sessionStorage.getItem('selected-book');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const onHashChange = () => {
      const v = getViewFromHash();
      if (v && v !== currentView) setCurrentView(v);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [currentView]);

  const handleViewDetails = (book: Book) => {
    setSelectedBook(book);
    sessionStorage.setItem('selected-book', JSON.stringify(book));
    setCurrentView('details');
    window.location.hash = 'details';
  };

  const handleBackToCatalog = () => {
    setSelectedBook(null);
    sessionStorage.removeItem('selected-book');
    setCurrentView('catalog');
    window.location.hash = 'catalog';
  };

  const handleCheckout = () => {
    setCurrentView('checkout');
    window.location.hash = 'checkout';
  };

  const handleCheckoutSuccess = () => {
    setCurrentView('orders');
    window.location.hash = 'orders';
  };

  const handleBackToCart = () => {
    setCurrentView('cart');
    window.location.hash = 'cart';
  };

  const handleLoginSuccess = () => {
    setCurrentView('catalog');
    window.location.hash = 'catalog';
  };

  const handleRegisterSuccess = () => {
    setCurrentView('catalog');
    window.location.hash = 'catalog';
  };

  const handleViewChangeWithAuth = (view: string) => {
    // Перевірка доступу до сторінки працівників (тільки для адмінів)
    if ((view === 'employees' || view === 'admin-logs') && !isAdmin) {
      setCurrentView('access-denied');
      window.location.hash = 'access-denied';
      return;
    }

    // Перевірка доступу до управлінських сторінок (для працівників та адмінів)
    if ((view === 'manage-books' || view === 'all-orders' || view === 'clients') &&
      !isEmployee && !isAdmin) {
      setCurrentView('access-denied');
      window.location.hash = 'access-denied';
      return;
    }

    setCurrentView(view as ViewType);
    window.location.hash = view;
  };

  if (currentView === 'forgot-password') {
    return (
      <>
        <ForgotPasswordPage />
        <Toaster />
      </>
    );
  }
  if (currentView === 'reset-password') {
    return (
      <>
        <ResetPasswordPage />
        <Toaster />
      </>
    );
  }
  if (currentView === 'register') {
    return (
      <>
        <RegisterPage onRegisterSuccess={handleRegisterSuccess} />
        <Toaster />
      </>
    );
  }

  if (!currentUser && currentView !== 'catalog' && currentView !== 'details' && currentView !== 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentView === 'login') {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentView={currentView} onViewChange={handleViewChangeWithAuth} />

      <main className="flex-1 container mx-auto px-4 py-8">

        {currentView === 'catalog' && (
          <BookCatalog onViewDetails={handleViewDetails} />
        )}

        {currentView === 'details' && selectedBook && (
          <BookDetails book={selectedBook} onBack={handleBackToCatalog} />
        )}

        {currentView === 'cart' && currentUser && (
          <CartPage onCheckout={handleCheckout} />
        )}

        {currentView === 'checkout' && currentUser && (
          <CheckoutPage onBack={handleBackToCart} onSuccess={handleCheckoutSuccess} />
        )}

        {currentView === 'orders' && currentUser && (
          <OrdersPage />
        )}

        {currentView === 'profile' && currentUser && (
          <ProfilePage />
        )}

        {currentView === 'employees' && isAdmin && (
          <EmployeesPage />
        )}

        {currentView === 'clients' && (isEmployee || isAdmin) && (
          <ClientsPage />
        )}

        {currentView === 'all-orders' && (isEmployee || isAdmin) && (
          <AllOrdersPage />
        )}

        {currentView === 'manage-books' && (isEmployee || isAdmin) && (
          <ManageBooksPage />
        )}

        {currentView === 'admin-logs' && isAdmin && (
          <AdminLogsPage />
        )}

        {currentView === 'favorites' && isCustomer && (
          <FavoritesPage onViewDetails={handleViewDetails} />
        )}

        {currentView === 'access-denied' && (
          <AccessDenied onGoBack={() => setCurrentView('catalog')} />
        )}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <AppContent />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}