'use client';

import { Header } from './Header';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white rtl">
      <Header />
      <main className="flex-1 container py-8">{children}</main>
      <footer className="border-t border-gray-800 py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} GameChanger. כל הזכויות שמורות.
          </p>
        </div>
      </footer>
    </div>
  );
} 