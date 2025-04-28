'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const companyFormSchema = z.object({
  name: z.string().min(2, {
    message: 'שם החברה חייב להכיל לפחות 2 תווים',
  }),
  segment: z.string().min(2, {
    message: 'תחום/סגמנט חייב להכיל לפחות 2 תווים',
  }),
  product_details: z.string().min(10, {
    message: 'פרטי המוצר/השירות חייבים להכיל לפחות 10 תווים',
  }),
  product_cost: z.string().min(1, {
    message: 'עלות המוצר/השירות חייבת להיות מצוינת',
  }),
  product_types: z.string().min(2, {
    message: 'סוגי המוצרים חייבים להיות מצוינים',
  }),
  target_audience_type: z.enum(['C2B', 'B2B'], {
    required_error: 'יש לבחור סוג קהל יעד',
  }),
  advantages: z.string().min(10, {
    message: 'יתרונות משמעותיים חייבים להכיל לפחות 10 תווים',
  }),
  product_benefits: z.string().min(10, {
    message: 'תועלות המוצר/השירות חייבות להכיל לפחות 10 תווים',
  }),
  company_benefits: z.string().min(10, {
    message: 'תועלות החברה חייבות להכיל לפחות 10 תווים',
  }),
});

export function CompanySettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      segment: '',
      product_details: '',
      product_cost: '',
      product_types: '',
      target_audience_type: 'C2B' as const,
      advantages: '',
      product_benefits: '',
      company_benefits: '',
    },
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      setIsLoading(true);
      
      if (!supabase || !user) { 
        setIsLoading(false);
        if (!user) console.log('Waiting for user...');
        if (!supabase) console.error('Supabase client is not available');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('שגיאה בטעינת נתוני החברה:', error);
          if (error.code !== 'PGRST116') {
            toast.error('שגיאה בטעינת נתוני החברה: ' + error.message);
          }
        } else if (data) {
          form.reset({
            name: data.name || '',
            segment: data.segment || '',
            product_details: data.product_details || '',
            product_cost: data.product_cost || '',
            product_types: data.product_types || '',
            target_audience_type: data.target_audience_type || 'C2B',
            advantages: Array.isArray(data.advantages) ? data.advantages.join('\n') : data.advantages || '',
            product_benefits: Array.isArray(data.product_benefits) ? data.product_benefits.join('\n') : data.product_benefits || '',
            company_benefits: Array.isArray(data.company_benefits) ? data.company_benefits.join('\n') : data.company_benefits || '',
          });
        }
      } catch (err) {
        console.error('Unexpected error fetching company data:', err);
        toast.error('אירעה שגיאה בלתי צפויה בטעינת נתוני החברה.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof companyFormSchema>) => {
    setIsLoading(true);
    
    if (!supabase || !user) {
      toast.error('שגיאה: לקוח Supabase או המשתמש אינם זמינים.');
      setIsLoading(false);
      return;
    }

    try {
      const { data: existingCompany, error: fetchError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      // Convert multi-line text to arrays
      const advantagesArray = values.advantages.split('\n').filter(item => item.trim() !== '');
      const productBenefitsArray = values.product_benefits.split('\n').filter(item => item.trim() !== '');
      const companyBenefitsArray = values.company_benefits.split('\n').filter(item => item.trim() !== '');
      
      const companyData = {
        user_id: user.id,
        name: values.name,
        segment: values.segment,
        product_details: values.product_details,
        product_cost: values.product_cost,
        product_types: values.product_types,
        target_audience_type: values.target_audience_type,
        advantages: advantagesArray,
        product_benefits: productBenefitsArray,
        company_benefits: companyBenefitsArray,
        updated_at: new Date().toISOString(),
      };
      
      let error;
      
      if (existingCompany) {
        const { error: updateError } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', existingCompany.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('companies')
          .insert({
            ...companyData,
            created_at: new Date().toISOString(),
          });
        error = insertError;
      }
      
      if (error) {
        throw error;
      }
      
      toast.success('הגדרות החברה נשמרו בהצלחה');
    } catch (error) {
      console.error('שגיאה בשמירת נתוני החברה:', error);
      toast.error('שגיאה בשמירת נתוני החברה: ' + (error instanceof Error ? error.message : 'אירעה שגיאה לא ידועה'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden bg-gray-900 border border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">פרטי חברה</CardTitle>
        <CardDescription className="text-gray-400">
          הגדר את פרטי החברה שלך לצורך ניתוח שיחות מותאם
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">שם החברה</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הזן את שם החברה" 
                        {...field} 
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-orange-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="segment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">תחום/סגמנט</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="תחום הפעילות העיקרי של החברה" 
                        {...field} 
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-orange-400" />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="product_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">פרטי המוצר/שירות</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="תיאור המוצר/שירות שהחברה מציעה"
                      {...field}
                      className="bg-gray-800 border-gray-700 text-white h-20"
                    />
                  </FormControl>
                  <FormMessage className="text-orange-400" />
                </FormItem>
              )}
            />
            
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="product_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">עלות המוצר/שירות</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="עלות המוצר/שירות" 
                        {...field} 
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-orange-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="product_types"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">סוגי מוצרים</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="סוגי המוצרים שהחברה מציעה" 
                        {...field} 
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-orange-400" />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="target_audience_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">קהל יעד</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="בחר קהל יעד" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="C2B">קהל פרטי C2B</SelectItem>
                      <SelectItem value="B2B">קהל עסקי B2B</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-orange-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="advantages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">בידולים ויתרונות משמעותיים</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="רשום כל יתרון בשורה נפרדת (עד 3 יתרונות)"
                      {...field}
                      className="bg-gray-800 border-gray-700 text-white h-24"
                    />
                  </FormControl>
                  <FormMessage className="text-orange-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="product_benefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">תועלות המוצר/שירות</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="רשום כל תועלת בשורה נפרדת (עד 3 תועלות)"
                      {...field}
                      className="bg-gray-800 border-gray-700 text-white h-24"
                    />
                  </FormControl>
                  <FormMessage className="text-orange-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company_benefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">תועלות החברה</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="רשום כל תועלת בשורה נפרדת (עד 3 תועלות)"
                      {...field}
                      className="bg-gray-800 border-gray-700 text-white h-24"
                    />
                  </FormControl>
                  <FormMessage className="text-orange-400" />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isLoading ? 'שומר...' : 'שמור שינויים'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 