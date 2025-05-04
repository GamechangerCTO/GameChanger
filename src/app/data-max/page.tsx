'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DataMaximizationPage() {
  return (
    <RequireAuth>
      <MainLayout>
        <div className="space-y-8">
          <div className="space-y-3 mb-8">
            <h1 className="text-4xl font-bold text-white">
              <span className="text-orange-500">מקסום </span>דאטה
            </h1>
            <p className="text-gray-400 text-lg">ניתוח נתוני לקוחות למקסום פוטנציאל המכירות</p>
          </div>
          
          <Tabs defaultValue="all-data" className="space-y-6">
            <TabsList className="bg-gray-800 border border-gray-700">
              <TabsTrigger value="all-data" className="data-[state=active]:bg-orange-500">ניתוח כלל דאטה</TabsTrigger>
              <TabsTrigger value="existing-data" className="data-[state=active]:bg-orange-500">תיעדוף לקוחות פוטנציאליים</TabsTrigger>
              <TabsTrigger value="daily-leads" className="data-[state=active]:bg-orange-500">תיעדוף לידים יומי</TabsTrigger>
              <TabsTrigger value="integrations" className="data-[state=active]:bg-orange-500">אינטגרציות</TabsTrigger>
            </TabsList>

            <TabsContent value="all-data" className="space-y-6">
              <Card className="overflow-hidden bg-gray-900 border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">ניתוח כלל הדאטה</CardTitle>
                  <CardDescription className="text-gray-400">
                    ניתוח כלל הדאטה לזיהוי פרמטרים והשפעתם על ההסתברות לסגירת עסקה.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">פרטים נדרשים לניתוח:</h3>
                    <p className="text-gray-400">
                      על מנת לייצר תיעדוף לדאטה הקיימת, יש לטעון תחילה את הנתונים על לקוחות אשר רכשו בפועל / ביצעו הזמנה / סגרו עסקה בלבד.
                    </p>
                    
                    <div className="mt-6">
                      <Button className="bg-orange-500 hover:bg-orange-600">
                        <Link href="/data-max/analysis/new">ניתוח חדש</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="existing-data" className="space-y-6">
              <Card className="overflow-hidden bg-gray-900 border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">תיעדוף לקוחות פוטנציאליים</CardTitle>
                  <CardDescription className="text-gray-400">
                    תיעדוף רשימת לקוחות פוטנציאליים לפי הסתברות סגירה.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">הנחיות:</h3>
                    <p className="text-gray-400">
                      יש לבצע ניתוח כלל דאטה ראשוני לפני ביצוע תיעדוף לקוחות פוטנציאליים.
                    </p>
                    
                    <div className="mt-6">
                      <Button className="bg-orange-500 hover:bg-orange-600" disabled>
                        <Link href="/data-max/prioritization/new">תיעדוף חדש</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="daily-leads" className="space-y-6">
              <Card className="overflow-hidden bg-gray-900 border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">תיעדוף לידים יומי</CardTitle>
                  <CardDescription className="text-gray-400">
                    תיעדוף לידים חדשים לטיפול יומי לפי הסתברות סגירה.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">הנחיות:</h3>
                    <p className="text-gray-400">
                      יש לבצע ניתוח כלל דאטה ראשוני לפני ביצוע תיעדוף לידים יומי.
                    </p>
                    
                    <div className="mt-6">
                      <Button className="bg-orange-500 hover:bg-orange-600" disabled>
                        <Link href="/data-max/daily-leads/new">תיעדוף יומי חדש</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card className="overflow-hidden bg-gray-900 border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">אינטגרציות</CardTitle>
                  <CardDescription className="text-gray-400">
                    ניהול אינטגרציות עם מערכות חיצוניות.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">אינטגרציות זמינות:</h3>
                    <ul className="space-y-2 text-gray-400">
                      <li className="flex items-center space-x-2 space-x-reverse">
                        <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                        <span>Microsoft Office (Excel, Outlook)</span>
                      </li>
                      <li className="flex items-center space-x-2 space-x-reverse">
                        <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                        <span>Google Workspace (Sheets, Gmail)</span>
                      </li>
                      <li className="flex items-center space-x-2 space-x-reverse">
                        <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                        <span>CRM מערכות</span>
                      </li>
                    </ul>
                    
                    <div className="mt-6">
                      <Button className="bg-orange-500 hover:bg-orange-600">
                        <Link href="/data-max/integrations">הגדרת אינטגרציות</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </RequireAuth>
  );
} 