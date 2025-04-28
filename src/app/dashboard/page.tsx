'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const features = [
    {
      title: 'ניתוח שיחות',
      description: 'העלו הקלטת שיחה חדשה לניתוח או צפו בניתוחים קיימים',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      ),
      link: '/analyses',
      cta: 'ניתוח חדש',
    },
    {
      title: 'אוגדני מכירות',
      description: 'צפייה ועריכה של אוגדני מכירות מבוססי ניתוחי שיחות',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      ),
      link: '/playbooks/sales',
      cta: 'אוגדני מכירות',
    },
    {
      title: 'אוגדני שירות',
      description: 'צפייה ועריכה של אוגדני שירות מבוססי ניתוחי שיחות',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      ),
      link: '/playbooks/service',
      cta: 'אוגדני שירות',
    },
    {
      title: 'נכסים דיגיטליים',
      description: 'ניתוח וייעול של האתר ונכסים דיגיטליים אחרים',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 2H2v10h10V2Z" />
          <path d="M12 12h10v10H12V12Z" />
          <path d="M22 2h-5v5" />
          <path d="M22 7 12 17" />
        </svg>
      ),
      link: '/digital-assets',
      cta: 'נכסים דיגיטליים',
    },
    {
      title: 'מקסום דאטה',
      description: 'ניתוח נתוני לקוחות למקסום פוטנציאל המכירות',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      ),
      link: '/data-max',
      cta: 'מקסום דאטה',
    },
    {
      title: 'הגדרות',
      description: 'עדכון פרטי החברה והגדרות המערכת',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      link: '/settings',
      cta: 'הגדרות',
    },
  ];

  return (
    <RequireAuth>
      <MainLayout>
        <div className="space-y-8">
          <div className="space-y-3 mb-8">
            <h1 className="text-4xl font-bold text-white">
              <span className="text-orange-500">ברוכים הבאים, </span>{user?.user_metadata?.name || 'משתמש יקר'}
            </h1>
            <p className="text-gray-400 text-lg">בחרו באחת האפשרויות כדי להתחיל:</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="overflow-hidden bg-gray-900 border border-gray-800 hover:border-orange-500/50 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-orange-500 text-white group-hover:bg-orange-400 transition-colors">
                    {feature.icon}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-white group-hover:text-orange-500 transition-colors">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-400">{feature.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    <Link href={feature.link}>{feature.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    </RequireAuth>
  );
} 