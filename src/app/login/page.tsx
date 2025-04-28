'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/layout/Logo';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen flex-col rtl bg-black text-white">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-10">
        <Logo />
        <nav className="mr-auto flex gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium text-white hover:text-[#FAA977] transition-colors duration-200 underline-offset-4">
            חזרה לעמוד הבית
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex items-center justify-center relative">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#FF6F00]/10 blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-[#4D1F0F]/20 blur-3xl"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        <div className="w-full max-w-md p-6 relative z-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#FF6F00] to-[#FAA977]">ברוכים הבאים</h1>
            <p className="text-gray-300">התחברו כדי להתחיל בניתוח ובשיפור השיחות שלכם</p>
          </div>
          <div className="backdrop-blur-sm bg-black/30 p-1 rounded-2xl shadow-xl ring-1 ring-[#FF6F00]/20">
            <LoginForm />
          </div>
        </div>
      </main>
      <footer className="border-t border-gray-800 bg-black">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
          <div className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} GameChang. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </div>
  );
} 