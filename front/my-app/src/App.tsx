import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
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
import { AccessDenied } from './components/AccessDenied';
import type { Book } from './types';
import { Toaster } from './components/ui/sonner';

type ViewType = 'login' | 'catalog' | 'details' | 'cart' | 'checkout' | 'orders' | 
  'profile' | 'employees' | 'clients' | 'all-orders' | 'manage-books' | 'access-denied';

function AppContent() {
  const { currentUser, isEmployee, isAdmin, isCustomer } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('catalog');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleViewDetails = (book: Book) => {
    setSelectedBook(book);
    setCurrentView('details');
  };

  const handleBackToCatalog = () => {
    setSelectedBook(null);
    setCurrentView('catalog');
  };

  const handleCheckout = () => {
    setCurrentView('checkout');
  };

  const handleCheckoutSuccess = () => {
    setCurrentView('orders');
  };

  const handleBackToCart = () => {
    setCurrentView('cart');
  };

  const handleLoginSuccess = () => {
    setCurrentView('catalog');
  };

  const handleViewChangeWithAuth = (view: string) => {
    // Перевірка доступу до сторінки працівників (тільки для адмінів)
    if (view === 'employees' && !isAdmin) {
      setCurrentView('access-denied');
      return;
    }

    // Перевірка доступу до управлінських сторінок (для працівників та адмінів)
    if ((view === 'manage-books' || view === 'all-orders' || view === 'clients') && 
        !isEmployee && !isAdmin) {
      setCurrentView('access-denied');
      return;
    }

    setCurrentView(view as ViewType);
  };

  // Show login page if not authenticated and trying to access protected views
  if (!currentUser && currentView !== 'catalog' && currentView !== 'details') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView !== 'login' && (
        <Header currentView={currentView} onViewChange={handleViewChangeWithAuth} />
      )}
      
      <main className="container mx-auto px-4 py-8">
        {currentView === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
        
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

        {currentView === 'access-denied' && (
          <AccessDenied onGoBack={() => setCurrentView('catalog')} />
        )}
      </main>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}