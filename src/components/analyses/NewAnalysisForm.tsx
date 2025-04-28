'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Company, STORAGE_BUCKET } from '@/lib/supabase'; // Import STORAGE_BUCKET constant
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react'; // Import upload icon
import { processAnalysis } from '@/lib/api';

const formSchema = z.object({
  analysis_type: z.enum(['sales', 'sales_followup', 'appointment_setting', 'appointment_followup', 'service'], {
    required_error: 'נא לבחור סוג ניתוח',
  }),
  // Allow file to be null initially
  file: z.instanceof(File, { message: 'נא להעלות קובץ שמע (mp3, wav)' }).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

// Helper function to sanitize filenames for Supabase Storage
const sanitizeFileName = (fileName: string): string => {
  // Replace Hebrew characters and special characters with English equivalents or remove them
  // Replace spaces with underscores
  return fileName
    .replace(/[^\w\s.-]/g, '') // Remove any character that's not alphanumeric, underscore, dot, hyphen, or space
    .replace(/\s+/g, '_'); // Replace spaces with underscores
};

export function NewAnalysisForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isCompanyLoading, setIsCompanyLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      analysis_type: 'sales',
      file: null, // Initialize file as null
    },
  });

  const fileValue = form.watch('file');

  // Fetch the user's company when the component mounts
  useEffect(() => {
    async function fetchCompany() {
      try {
        setIsCompanyLoading(true);
        if (!user) return;

        // Dynamically fetch the Supabase client
        const { supabase } = await import('@/lib/supabase');

        // Check if the user has a company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (companyError && companyError.code !== 'PGRST116') {
          throw new Error('שגיאה בטעינת נתוני חברה: ' + companyError.message);
        }

        if (companyData) {
          setCompany(companyData);
        }
      } catch (error: any) {
        console.error('Error fetching company:', error);
        toast.error('שגיאה בטעינת נתוני החברה: ' + error.message);
      } finally {
        setIsCompanyLoading(false);
      }
    }

    fetchCompany();
  }, [user]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setProgress(10);
      setError(null);

      if (!company) {
        setError('יש להגדיר פרטי חברה לפני העלאת שיחות לניתוח');
        setIsSubmitting(false);
        return;
      }

      const file = values.file;
      if (!file) {
        setError('נא להעלות קובץ שמע');
        form.setError('file', { type: 'manual', message: 'נא להעלות קובץ שמע' });
        setIsSubmitting(false);
        return;
      }

      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError('גודל הקובץ עולה על המותר (20MB)');
        form.setError('file', { type: 'manual', message: 'גודל הקובץ עולה על המותר (20MB)' });
        setIsSubmitting(false);
        return;
      }

      // Check file type
      if (!['audio/mpeg', 'audio/wav', 'audio/mp3'].includes(file.type)) {
        setError('סוג הקובץ אינו נתמך. נא להעלות קובץ mp3 או wav');
        form.setError('file', { type: 'manual', message: 'סוג הקובץ אינו נתמך (mp3, wav)' });
        setIsSubmitting(false);
        return;
      }

      setProgress(20);

      // Dynamically fetch the Supabase client
      const { supabase } = await import('@/lib/supabase');

      // Sanitize the filename to avoid issues with special characters and non-Latin alphabets
      const sanitizedFileName = sanitizeFileName(file.name);

      // 1. שימוש בפונקציית Edge להעלאת הקובץ עם הרשאות מתאימות
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('חסרה כתובת Supabase URL בהגדרות');
      }

      setProgress(30);
      console.log('מתחיל העלאת קובץ באמצעות Edge Function');

      // יצירת FormData עבור העלאת הקובץ
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucketName', STORAGE_BUCKET);
      formData.append('folder', `public/${company.id}`);
      formData.append('fileName', `${Date.now()}-${sanitizedFileName}`);

      // קריאה לפונקציית Edge חדשה
      const uploadResponse = await fetch(`${supabaseUrl}/functions/v1/upload-file`, {
        method: 'POST',
        body: formData,
        headers: {
          // לא צריך להגדיר Content-Type עבור FormData
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`שגיאה בהעלאת הקובץ: ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success || !uploadResult.signedUrl) {
        throw new Error('שגיאה בקבלת קישור לקובץ שהועלה');
      }

      const recordingUrl = uploadResult.signedUrl; // URL חתום עם הרשאות גישה
      const filePath = uploadResult.filePath; // נתיב הקובץ בתוך הדלי

      console.log('הקובץ הועלה בהצלחה. URL:', recordingUrl);
      console.log('נתיב הקובץ:', filePath);

      setProgress(50);

      // 2.5. בדיקה שה-URL תקין וניתן להורדה
      try {
        const testResponse = await fetch(recordingUrl, {
          method: 'HEAD', // רק בדיקת תקינות ללא הורדת תוכן
          // נוסיף timeout למקרה שהשרת לא מגיב
          signal: AbortSignal.timeout(3000) // 3 שניות timeout
        });
        
        if (!testResponse.ok) {
          console.warn('שגיאה בבדיקת נגישות הקובץ:', testResponse.statusText);
          // רק מציג אזהרה, לא זורק שגיאה שמפסיקה את התהליך
        } else {
          console.log('אישור גישה לקובץ התקבל בהצלחה');
        }
      } catch (fetchError: any) {
        console.warn('שגיאה בבדיקת נגישות הקובץ:', fetchError?.message || fetchError);
        // ממשיכים למרות השגיאה, רק רושמים אזהרה
      }

      // 3. Insert the analysis request into the database
      const { data: analysisData, error: insertError } = await supabase
        .from('call_analyses')
        .insert({
          user_id: user?.id,
          company_id: company.id,
          analysis_type: values.analysis_type,
          recording_url: recordingUrl,
          status: 'pending', // Initial status
        })
        .select()
        .single();

      if (insertError) {
        throw new Error('שגיאה ביצירת בקשת הניתוח: ' + insertError.message);
      }

      // 4. יוצר אובייקט עם כל המידע הדרוש לניתוח
      setProgress(75);

      // התחלת תהליך העיבוד ב-server-side
      // לא נמתין כאן, כי העיבוד יכול לקחת זמן רב
      // נריץ את זה במקביל כדי לא לתקוע את הממשק
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            analysisId: analysisData.id,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error('שגיאה בהתחלת הניתוח: ' + (errorData.error || response.statusText));
        }
        
        // תגובה התקבלה בהצלחה
        const responseData = await response.json();
        console.log('התהליך החל בהצלחה:', responseData);
        
        // נודיע למשתמש
        toast.success('התמלול החל, התהליך עשוי להימשך מספר דקות');
      } catch (fetchError: any) {
        console.error('שגיאה בקריאה ל-API:', fetchError);
        // נמשיך בתהליך למרות השגיאה, אבל נודיע למשתמש
        toast.error('שגיאה בהתחלת תהליך הניתוח: ' + fetchError.message);
      }

      setProgress(100);
      toast.success('הקובץ הועלה בהצלחה. הניתוח יתבצע ברקע ויהיה זמין בקרוב');
      
      // Optionally reset the form or navigate away
      form.reset(); 
      // router.push(`/analyses/${analysisData.id}`); // Navigate to specific analysis if needed
      // Maybe just refresh the list or navigate to the list tab
      router.push('/analyses'); // Go back to the list view

    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.message || 'אירעה שגיאה בתהליך העלאת הקובץ');
      toast.error('אירעה שגיאה בהעלאת הקובץ: ' + error.message);
    } finally {
      setIsSubmitting(false);
      setProgress(0);
    }
  };

  if (isCompanyLoading) {
    return (
      <Card className="overflow-hidden bg-gray-900 border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">טוען נתונים...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="w-16 h-16 border-t-4 border-orange-500 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (!company) {
    return (
      <Card className="overflow-hidden bg-gray-900 border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">יש צורך בהגדרת פרטי חברה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-yellow-900/30 border-yellow-700 text-yellow-300">
            <AlertDescription>
              לפני שניתן להעלות שיחות לניתוח, יש להגדיר את פרטי החברה שלך במערכת.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            <a href="/settings/company">הגדרת פרטי חברה</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gray-900 border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">ניתוח שיחה חדשה</CardTitle>
        <CardDescription className="text-gray-400">העלה קובץ שמע לניתוח ובחר את סוג השיחה</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <FormField
              control={form.control}
              name="analysis_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">סוג ניתוח</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="בחר סוג ניתוח" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="sales">מכירה טלפונית</SelectItem>
                      <SelectItem value="sales_followup">פולו אפ מכירה טלפונית</SelectItem>
                      <SelectItem value="appointment_setting">תאום פגישה</SelectItem>
                      <SelectItem value="appointment_followup">פולו אפ תאום פגישה</SelectItem>
                      <SelectItem value="service">שיחת שירות</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-orange-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel className="text-white">קובץ שמע (mp3, wav)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="file" 
                        accept="audio/mpeg,audio/wav,audio/mp3" 
                        className="hidden" // Hide the default input
                        id="file-upload"
                        onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)} 
                        onBlur={onBlur}
                        name={name}
                        ref={ref}
                        disabled={isSubmitting}
                      />
                      <label 
                        htmlFor="file-upload"
                        className={`flex items-center justify-center w-full h-32 px-4 transition bg-gray-800 border-2 border-gray-700 border-dashed rounded-md appearance-none cursor-pointer hover:border-orange-400 focus:outline-none ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="font-medium text-gray-400">
                            {fileValue ? fileValue.name : 'לחץ כאן או גרור קובץ להעלאה'}
                            <span className="text-xs text-gray-500 block"> (מקסימום 20MB)</span>
                          </span>
                        </span>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage className="text-orange-400" />
                </FormItem>
              )}
            />

            {isSubmitting && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full h-2 bg-gray-700 [&>*]:bg-orange-500" />
                <p className="text-sm text-center text-gray-400">מעלה ומעבד... ({progress}%)</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'מעבד...' : 'התחל ניתוח'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 