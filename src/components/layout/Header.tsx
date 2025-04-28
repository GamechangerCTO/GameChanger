'use client';

import { Logo } from './Logo';
import { MainNav } from './MainNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, signOut } = useAuth();

  // Extract initials from user name if available
  const getUserInitials = () => {
    if (!user?.user_metadata?.name) return 'GC';
    
    const nameParts = user.user_metadata.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Logo />
          {user && <MainNav />}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-orange-500/10">
                  <Avatar>
                    <AvatarImage src={user.user_metadata.avatar_url} />
                    <AvatarFallback className="bg-orange-500 text-white">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rtl bg-black border border-orange-500/20 text-white">
                <DropdownMenuLabel className="text-white">החשבון שלי</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-orange-500/20" />
                <DropdownMenuItem asChild className="hover:bg-orange-500/10 focus:bg-orange-500/10 text-white">
                  <Link href="/settings">הגדרות</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-orange-500/10 focus:bg-orange-500/10 text-white">
                  <Link href="/settings/company">פרטי חברה</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-orange-500/20" />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10">
                  התנתקות
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" className="bg-gradient-to-r from-[#FF6F00] to-[#FAA977] hover:from-[#FAA977] hover:to-[#FF6F00] text-white border-0">
              <Link href="/login">כניסה</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 