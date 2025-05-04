'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // הגדר את כתובת האתר המארח - השתמש בכתובת ורסל בייצור
      // ובמקומי בפיתוח
      const redirectUrl = process.env.NODE_ENV === 'production' 
        ? 'https://game-changer-gilt.vercel.app/dashboard' // שנה לכתובת המדויקת של האתר שלך
        : `${window.location.origin}/dashboard`;

      // Configure Google auth with redirect
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(error.message || 'אירעה שגיאה בכניסה עם חשבון Google');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('נא למלא את כל השדות');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          }
        });

        if (error) throw error;
        else {
          setError('נשלח אימייל אימות. אנא בדוק את תיבת הדואר הנכנס שלך');
        }
      }
    } catch (error: any) {
      console.error('Email auth error:', error);
      setError(error.message || `אירעה שגיאה ב${mode === 'login' ? 'התחברות' : 'הרשמה'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto rtl border-0 bg-black/80 backdrop-blur-sm shadow-lg text-white">
      <CardHeader className="text-center space-y-3 pb-6">
        <div className="mx-auto h-12 w-12 rounded-full bg-[#FF6F00]/20 flex items-center justify-center mb-2">
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
            className="h-6 w-6 text-[#FAA977]"
          >
            <path d="M16 16v-4a4 4 0 0 0-8 0v4"></path>
            <path d="M20 16H4"></path>
            <path d="M12 12v4"></path>
            <path d="M12 16v4"></path>
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF6F00] to-[#FAA977]">ברוכים הבאים ל-GameChang</CardTitle>
        <CardDescription className="text-gray-300">התחבר כדי להתחיל בניתוח שיחות מכירה ושירות</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6">
        {error && (
          <Alert variant="destructive" className="animate-shake bg-red-900/30 border border-red-500/50 text-white">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700">
            <TabsTrigger value="email" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              אימייל וסיסמה
            </TabsTrigger>
            <TabsTrigger value="google" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Google
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">כתובת אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="הזן את כתובת האימייל שלך"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                placeholder="הזן את הסיסמה שלך"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="link"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="p-0 text-[#FAA977] hover:text-white"
              >
                {mode === 'login' ? 'משתמש חדש? הירשם' : 'כבר רשום? התחבר'}
              </Button>
            </div>
            
            <Button 
              variant="default" 
              className="w-full bg-gradient-to-r from-[#FF6F00] to-[#FAA977] hover:from-[#FAA977] hover:to-[#FF6F00] text-white"
              onClick={handleEmailLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  מבצע...
                </span>
              ) : (
                <span>{mode === 'login' ? 'התחברות' : 'הרשמה'}</span>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="google" className="mt-4">
            <Button 
              variant="outline" 
              className="w-full relative group overflow-hidden border-2 border-[#FF6F00] hover:border-[#FAA977] text-white bg-gradient-to-r from-[#FF6F00] to-[#FAA977] hover:from-[#FAA977] hover:to-[#FF6F00] shadow-lg shadow-[#FF6F00]/20 hover:shadow-xl hover:shadow-[#FF6F00]/30 transition-all duration-300"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  מתחבר...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    <path d="M1 1h22v22H1z" fill="none"/>
                  </svg>
                  התחברות עם Google
                </span>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-center text-sm text-gray-400 px-6 pt-2 pb-6">
        <div className="w-full">
          המשך מהווה אישור ל&nbsp;
          <a href="/terms" className="text-[#FAA977] hover:text-white transition-colors duration-200">תנאי השימוש</a>
          &nbsp;ול&nbsp;
          <a href="/privacy" className="text-[#FAA977] hover:text-white transition-colors duration-200">מדיניות הפרטיות</a>
        </div>
      </CardFooter>
    </Card>
  );
} 