'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  width?: number;
  height?: number;
  hideText?: boolean;
}

export function Logo({ width = 150, height = 40, hideText = false }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative">
        <Image
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0dbd11_----.png"
          alt="GameChanger Logo"
          width={width}
          height={height}
          className="object-contain"
          priority
        />
      </div>
      {!hideText && (
        <span className="font-bold text-2xl text-orange-500 hover:text-orange-400 transition-colors hidden md:block">
          GameChanger
        </span>
      )}
    </Link>
  );
} 