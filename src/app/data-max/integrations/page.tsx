'use client';

import { useState } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Globe, Mail, Check, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';

// מידע דמה על האינטגרציות
const integrations = [
  {
    id: 'microsoft',
    name: 'Microsoft Office',
    description: 'חיבור ל-Excel ו-Outlook',
    icon: <svg className="h-6 w-6" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 12h9v9H1z"/><path fill="#7fba00" d="M12 1h9v9h-9z"/><path fill="#ffb900" d="M12 12h9v9h-9z"/></svg>,
    connected: true,
    lastSync: '15/06/2023 10:32',
    connectedServices: ['Excel', 'Outlook']
  },
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'חיבור ל-Google Sheets ו-Gmail',
    icon: <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
    connected: false,
    lastSync: null,
    connectedServices: []
  },
  {
    id: 'salesforce',
    name: 'Salesforce CRM',
    description: 'חיבור למערכת ניהול לקוחות Salesforce',
    icon: <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#00A1E0" d="M9.1 7.3c1-1.2 2.4-1.9 4-1.9 1.9 0 3.7 1 4.7 2.6.9-.4 1.9-.7 2.9-.7 3.7 0 6.8 3.1 6.8 6.8 0 3.8-3.1 6.8-6.8 6.8-0.5 0-0.9 0-1.4-.1-0.9 1.7-2.8 2.8-4.8 2.8-1 0-1.9-.2-2.7-.7-0.9 1.4-2.4 2.2-4.1 2.2-2.7 0-4.9-2.2-4.9-4.9 0-0.9 0.2-1.7 0.6-2.4-1.6-1.1-2.7-2.9-2.7-5 0-3.3 2.7-6 6-6 0.9 0 1.8 0.2 2.6 0.6Z"/></svg>,
    connected: false,
    lastSync: null,
    connectedServices: []
  }
];

export default function IntegrationsPage() {
  const [activeIntegrations, setActiveIntegrations] = useState<{[key: string]: boolean}>({
    microsoft: true,
    google: false,
    salesforce: false
  });
  
  const toggleIntegration = (id: string) => {
    setActiveIntegrations({
      ...activeIntegrations,
      [id]: !activeIntegrations[id]
    });
  };
  
  return (
    <RequireAuth>
      <MainLayout>
        <div className="space-y-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/data-max">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">אינטגרציות</h1>
              <p className="text-gray-400">חיבור למערכות חיצוניות לייבוא וייצוא נתונים</p>
            </div>
          </div>

          <div className="grid gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id} className="bg-gray-900 border border-gray-800">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="mr-2 h-10 w-10 flex items-center justify-center rounded-md bg-gray-800">
                    {integration.icon}
                  </div>
                  <div className="mr-4">
                    <CardTitle className="text-white text-xl flex items-center">
                      {integration.name}
                      {activeIntegrations[integration.id] && (
                        <span className="mr-2 h-5 px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs flex items-center">
                          <Check className="mr-1 h-3 w-3" /> מחובר
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-400">{integration.description}</CardDescription>
                  </div>
                  <div className="mr-auto flex items-center space-x-2 space-x-reverse">
                    <Switch
                      id={`toggle-${integration.id}`}
                      checked={activeIntegrations[integration.id]}
                      onCheckedChange={() => toggleIntegration(integration.id)}
                      className="data-[state=checked]:bg-orange-500"
                    />
                    <Label htmlFor={`toggle-${integration.id}`} className="text-white">
                      {activeIntegrations[integration.id] ? 'פעיל' : 'לא פעיל'}
                    </Label>
                  </div>
                </CardHeader>
                
                {activeIntegrations[integration.id] && (
                  <>
                    <CardContent className="border-t border-gray-800 pt-4">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-4">
                          <div className="flex-1 min-w-[180px]">
                            <Label htmlFor={`api-key-${integration.id}`} className="text-white mb-1 block">מפתח API</Label>
                            <div className="flex">
                              <Input
                                id={`api-key-${integration.id}`}
                                type="password"
                                value="●●●●●●●●●●●●●●●●●●"
                                className="bg-gray-800 border-gray-700 text-white rounded-l-none"
                                readOnly
                              />
                              <Button variant="outline" className="rounded-r-none border-gray-700 border-r-0">
                                הצג
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-[180px]">
                            <Label htmlFor={`webhook-${integration.id}`} className="text-white mb-1 block">כתובת Webhook</Label>
                            <div className="flex">
                              <Input
                                id={`webhook-${integration.id}`}
                                type="text"
                                value="https://api.gamechang.io/webhook/data-max"
                                className="bg-gray-800 border-gray-700 text-white rounded-l-none"
                                readOnly
                              />
                              <Button variant="outline" className="rounded-r-none border-gray-700 border-r-0">
                                העתק
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {integration.id === 'microsoft' && (
                          <div className="pt-4">
                            <h3 className="text-white font-medium mb-2">שירותים מחוברים</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="flex items-center space-x-2 space-x-reverse px-3 py-2 bg-gray-800 rounded-lg">
                                <div className="h-8 w-8 rounded bg-green-500/20 flex items-center justify-center">
                                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M23 4v16c0 .55-.45 1-1 1H2c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h20c.55 0 1 .45 1 1zm-1 1H2v14h20V5zM8.95 15.91l-3.77-3.77a.996.996 0 0 1 0-1.41c.39-.39 1.02-.39 1.41 0l2.36 2.36 6.54-6.54a.996.996 0 0 1 1.41 0c.39.39.39 1.02 0 1.41l-7.95 7.95zm5.52-11.41c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 2c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6z"/></svg>
                                </div>
                                <div>
                                  <p className="text-white font-medium">Excel</p>
                                  <p className="text-xs text-gray-400">מחובר מ-15/06/2023</p>
                                </div>
                                <Button size="sm" variant="ghost" className="mr-auto h-8 w-8 p-0" title="נתק">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center space-x-2 space-x-reverse px-3 py-2 bg-gray-800 rounded-lg">
                                <div className="h-8 w-8 rounded bg-green-500/20 flex items-center justify-center">
                                  <Mail className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">Outlook</p>
                                  <p className="text-xs text-gray-400">מחובר מ-15/06/2023</p>
                                </div>
                                <Button size="sm" variant="ghost" className="mr-auto h-8 w-8 p-0" title="נתק">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center space-x-2 space-x-reverse px-3 py-2 bg-gray-800 rounded-lg border border-dashed border-gray-700">
                                <div className="h-8 w-8 rounded bg-gray-700 flex items-center justify-center">
                                  <Globe className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">SharePoint</p>
                                  <p className="text-xs text-gray-400">לא מחובר</p>
                                </div>
                                <Button size="sm" variant="outline" className="mr-auto h-8 px-2 text-xs">
                                  חבר
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {integration.lastSync && (
                          <div className="flex items-center text-sm text-gray-400 mt-2">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            סנכרון אחרון: {integration.lastSync}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t border-gray-800 pt-4">
                      <div className="flex justify-between w-full">
                        <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                          נתק אינטגרציה
                        </Button>
                        <div className="flex space-x-2 space-x-reverse">
                          <Button variant="outline">
                            סנכרן עכשיו
                          </Button>
                          <Button className="bg-orange-500 hover:bg-orange-600">
                            הגדרות נוספות
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </>
                )}
                
                {!activeIntegrations[integration.id] && (
                  <CardFooter className="border-t border-gray-800 pt-4">
                    <Button className="bg-orange-500 hover:bg-orange-600 w-full">
                      הגדר אינטגרציה
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    </RequireAuth>
  );
} 