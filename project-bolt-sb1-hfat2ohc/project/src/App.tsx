import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Background } from '@/components/Background';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';
import { PrivacyPage, TermsPage, ContactPage } from '@/pages/LegalPages';
import type { Page, AuthView } from '@/lib/types';

function Shell() {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>('landing');
  const [authView, setAuthView] = useState<AuthView>('login');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [page]);

  function navigate(p: Page) {
    if (p === 'dashboard' && !user) {
      setAuthView('signup');
      setPage('auth');
      return;
    }
    setPage(p);
  }

  function goAuth(view: AuthView) {
    setAuthView(view);
    setPage('auth');
  }

  const showFooter = page !== 'dashboard' && page !== 'auth';

  return (
    <div className="relative min-h-screen">
      <Background />
      <Navbar page={page} onNavigate={navigate} />
      <main>
        {page === 'landing' && <LandingPage onNavigate={navigate} />}
        {page === 'auth' && <AuthPage initial={authView} onNavigate={navigate} />}
        {page === 'dashboard' && user && <Dashboard onNavigate={navigate} />}
        {page === 'privacy' && <PrivacyPage onNavigate={navigate} />}
        {page === 'terms' && <TermsPage onNavigate={navigate} />}
        {page === 'contact' && <ContactPage onNavigate={navigate} />}
      </main>
      {showFooter && <Footer onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
