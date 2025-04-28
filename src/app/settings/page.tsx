'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const settingsCategories = [
    {
      title: 'פרטי חברה',
      description: 'עדכון פרטי החברה, לוגו, ופרטי קשר',
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
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      link: '/settings/company',
      cta: 'פרטי חברה',
    },
    {
      title: 'ניהול משתמשים',
      description: 'הוספה, עריכה ומחיקת משתמשים וניהול הרשאות',
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
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      link: '/settings/users',
      cta: 'ניהול משתמשים',
    },
    {
      title: 'הגדרות מערכת',
      description: 'הגדרות כלליות והתאמות אישיות למערכת',
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
      link: '/settings/system',
      cta: 'הגדרות מערכת',
    },
  ];

  return (
    <RequireAuth>
      <MainLayout>
        <div className="space-y-8">
          <div className="space-y-3 mb-8">
            <h1 className="text-4xl font-bold text-white">
              <span className="text-orange-500">הגדרות </span>מערכת
            </h1>
            <p className="text-gray-400 text-lg">עדכון הגדרות המערכת ופרטי החברה</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {settingsCategories.map((category) => (
              <Card key={category.title} className="overflow-hidden bg-gray-900 border border-gray-800 hover:border-orange-500/50 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-orange-500 text-white group-hover:bg-orange-400 transition-colors">
                    {category.icon}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-white group-hover:text-orange-500 transition-colors">{category.title}</CardTitle>
                    <CardDescription className="text-gray-400">{category.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    <Link href={category.link}>{category.cta}</Link>
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