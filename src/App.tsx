/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PortalProvider, usePortal } from './context/PortalContext.tsx';
import { Header } from './components/Header.tsx';
import { BreakingTicker } from './components/BreakingTicker.tsx';
import { Footer } from './components/Footer.tsx';
import { RadioPlayer } from './components/RadioPlayer.tsx';
import { GlobalAdScripts } from './components/AdSlot.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ArticlePage } from './pages/ArticlePage.tsx';
import { CategoryPage } from './pages/CategoryPage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { InfoPage } from './pages/InfoPage.tsx';
import { AdminApp } from './pages/admin/AdminApp.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

function PortalRouter() {
  const { pathname } = usePortal();

  if (pathname.startsWith('/admin')) {
    return <AdminApp />;
  }

  let content: React.ReactNode;
  if (pathname === '/' || pathname === '') {
    content = <HomePage />;
  } else if (pathname.startsWith('/news/')) {
    const slug = decodeURIComponent(pathname.replace('/news/', '').split('/')[0]);
    content = <ArticlePage slug={slug} />;
  } else if (pathname.startsWith('/category/')) {
    const slug = decodeURIComponent(pathname.replace('/category/', '').split('/')[0]);
    content = <CategoryPage slug={slug} />;
  } else if (pathname === '/search') {
    content = <SearchPage />;
  } else if (pathname === '/about') {
    content = <InfoPage pageType="about" />;
  } else if (pathname === '/privacy') {
    content = <InfoPage pageType="privacy" />;
  } else if (pathname === '/terms') {
    content = <InfoPage pageType="terms" />;
  } else if (pathname === '/editorial-policy') {
    content = <InfoPage pageType="editorial" />;
  } else if (pathname === '/contact') {
    content = <InfoPage pageType="contact" />;
  } else {
    content = <HomePage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] dark:bg-[#0E1116] text-[#141413] dark:text-[#F1F5F9]">
      <GlobalAdScripts />
      <Header />
      <BreakingTicker />
      <div className="flex-1">{content}</div>
      <Footer />
      <RadioPlayer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="পোর্টাল লোড করতে সমস্যা হয়েছে">
      <PortalProvider>
        <PortalRouter />
      </PortalProvider>
    </ErrorBoundary>
  );
}
