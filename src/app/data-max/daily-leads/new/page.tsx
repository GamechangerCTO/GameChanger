'use client';

import { useState } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectValue, SelectTrigger, SelectContent, SelectItem, Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, ChevronLeft, Upload } from 'lucide-react';
import Link from 'next/link';

export default function NewDailyLeadsPage() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dailyUpdates, setDailyUpdates] = useState<{[key: string]: boolean}>({
    campaigns: false,
    promotions: false,
    seasonal: false,
    product: false,
    market: false,
    team: false
  });
  const [updateDetails, setUpdateDetails] = useState<{[key: string]: string}>({});
  
  // מידע דמה על מודלים קיימים
  const availableModels = [
    { id: 'model-1', name: 'מודל ניתוח דאטה - B2B - יוני 2023', date: '15/06/2023' },
    { id: 'model-2', name: 'מודל ניתוח דאטה - C2B - ינואר 2023', date: '10/01/2023' },
    { id: 'model-3', name: 'מודל ניתוח דאטה - קמפיין קיץ 2023', date: '20/07/2023' },
  ];

  const handleUpdateChange = (key: string, value: boolean) => {
    setDailyUpdates({
      ...dailyUpdates,
      [key]: value
    });
    
    if (!value) {
      const newDetails = {...updateDetails};
      delete newDetails[key];
      setUpdateDetails(newDetails);
    }
  };

  const handleDetailChange = (key: string, value: string) => {
    setUpdateDetails({
      ...updateDetails,
      [key]: value
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const uploadedFile = e.dataTransfer.files[0];
      setFile(uploadedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    // כאן נבצע את הלוגיקה להעלאת הקובץ וביצוע התיעדוף
    console.log({
      selectedModel,
      dailyUpdates,
      updateDetails,
      file
    });
    
    // אחרי הגשה, נעבור לדף אישור או דף תוצאות
    setStep(4);
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
              <h1 className="text-3xl font-bold text-white">תיעדוף לידים יומי</h1>
              <p className="text-gray-400">דירוג לידים חדשים לטיפול יומי לפי הסתברות לסגירת עסקה</p>
            </div>
          </div>

          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">תיעדוף לידים יומי חדש</CardTitle>
              <CardDescription className="text-gray-400">
                דירוג והמלצות לטיפול בלידים חדשים שהתקבלו היום
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">בחירת מודל ניתוח דאטה</Label>
                    <p className="text-gray-400 text-sm mb-4">
                      בחרו את המודל שיתבסס עליו התיעדוף. מודל הניתוח מכיל את המשקלות והפרמטרים המשפיעים על ההסתברות לסגירת עסקה.
                    </p>
                    
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="בחרו מודל ניתוח דאטה" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        {availableModels.map(model => (
                          <SelectItem key={model.id} value={model.id} className="focus:bg-gray-700">
                            <div className="flex flex-col">
                              <span>{model.name}</span>
                              <span className="text-gray-400 text-sm">{model.date}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600" 
                      onClick={() => selectedModel ? setStep(2) : null}
                      disabled={!selectedModel}
                    >
                      המשך
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-white block">עדכונים ושינויים יומיים</Label>
                    <p className="text-gray-400 text-sm">
                      סמנו האם חלו שינויים או עדכונים שיכולים להשפיע על התיעדוף היומי
                    </p>
                    
                    <div className="space-y-4 pt-2">
                      <div className="flex items-start space-x-2 space-x-reverse">
                        <Checkbox 
                          id="campaigns" 
                          className="mt-1 border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white" 
                          checked={dailyUpdates.campaigns}
                          onCheckedChange={(checked) => handleUpdateChange('campaigns', checked === true)}
                        />
                        <div className="space-y-1 w-full">
                          <Label htmlFor="campaigns" className="text-white">קמפיינים פעילים</Label>
                          {dailyUpdates.campaigns && (
                            <Input 
                              className="bg-gray-800 border-gray-700 text-white text-sm" 
                              placeholder="פרטו את הקמפיינים הפעילים ומטרתם" 
                              value={updateDetails.campaigns || ''}
                              onChange={(e) => handleDetailChange('campaigns', e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2 space-x-reverse">
                        <Checkbox 
                          id="promotions" 
                          className="mt-1 border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white" 
                          checked={dailyUpdates.promotions}
                          onCheckedChange={(checked) => handleUpdateChange('promotions', checked === true)}
                        />
                        <div className="space-y-1 w-full">
                          <Label htmlFor="promotions" className="text-white">הטבות/מבצעים מיוחדים</Label>
                          {dailyUpdates.promotions && (
                            <Input 
                              className="bg-gray-800 border-gray-700 text-white text-sm" 
                              placeholder="פרטו את ההטבות או המבצעים החדשים" 
                              value={updateDetails.promotions || ''}
                              onChange={(e) => handleDetailChange('promotions', e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2 space-x-reverse">
                        <Checkbox 
                          id="seasonal" 
                          className="mt-1 border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white" 
                          checked={dailyUpdates.seasonal}
                          onCheckedChange={(checked) => handleUpdateChange('seasonal', checked === true)}
                        />
                        <div className="space-y-1 w-full">
                          <Label htmlFor="seasonal" className="text-white">אירועים עונתיים</Label>
                          {dailyUpdates.seasonal && (
                            <Input 
                              className="bg-gray-800 border-gray-700 text-white text-sm" 
                              placeholder="ציינו אם מתקרב חג או עונה מיוחדת" 
                              value={updateDetails.seasonal || ''}
                              onChange={(e) => handleDetailChange('seasonal', e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2 space-x-reverse">
                        <Checkbox 
                          id="product" 
                          className="mt-1 border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white" 
                          checked={dailyUpdates.product}
                          onCheckedChange={(checked) => handleUpdateChange('product', checked === true)}
                        />
                        <div className="space-y-1 w-full">
                          <Label htmlFor="product" className="text-white">שינויים במוצר/שירות</Label>
                          {dailyUpdates.product && (
                            <Input 
                              className="bg-gray-800 border-gray-700 text-white text-sm" 
                              placeholder="פרטו אם חלו שינויים במוצר או בשירות" 
                              value={updateDetails.product || ''}
                              onChange={(e) => handleDetailChange('product', e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2 space-x-reverse">
                        <Checkbox 
                          id="market" 
                          className="mt-1 border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white" 
                          checked={dailyUpdates.market}
                          onCheckedChange={(checked) => handleUpdateChange('market', checked === true)}
                        />
                        <div className="space-y-1 w-full">
                          <Label htmlFor="market" className="text-white">שינויים בשוק</Label>
                          {dailyUpdates.market && (
                            <Input 
                              className="bg-gray-800 border-gray-700 text-white text-sm" 
                              placeholder="ציינו אם חלו שינויים משמעותיים בשוק" 
                              value={updateDetails.market || ''}
                              onChange={(e) => handleDetailChange('market', e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2 space-x-reverse">
                        <Checkbox 
                          id="team" 
                          className="mt-1 border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white" 
                          checked={dailyUpdates.team}
                          onCheckedChange={(checked) => handleUpdateChange('team', checked === true)}
                        />
                        <div className="space-y-1 w-full">
                          <Label htmlFor="team" className="text-white">משאבי צוות</Label>
                          {dailyUpdates.team && (
                            <Input 
                              className="bg-gray-800 border-gray-700 text-white text-sm" 
                              placeholder="ציינו אם יש שינויים בזמינות אנשי המכירות" 
                              value={updateDetails.team || ''}
                              onChange={(e) => handleDetailChange('team', e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      חזרה
                    </Button>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600" 
                      onClick={() => setStep(3)}
                    >
                      המשך
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-white block mb-2">העלאת רשימת לידים חדשים</Label>
                    <p className="text-gray-400 mb-4">
                      העלו קובץ CSV או Excel המכיל את נתוני הלידים החדשים שהתקבלו היום.
                      <br />
                      הקובץ חייב להכיל את הפרמטרים המופיעים במודל הניתוח שבחרתם.
                    </p>
                    
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 hover:border-orange-500/50 hover:bg-gray-800/50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-white text-lg font-medium mb-1">
                        {file ? file.name : 'גררו קובץ לכאן או לחצו לבחירת קובץ'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'תומך בקבצי CSV ו-Excel'}
                      </p>
                      <input 
                        id="file-upload" 
                        type="file" 
                        accept=".csv,.xlsx,.xls" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </div>
                    
                    {file && (
                      <div className="mt-4 p-3 bg-gray-800 rounded-lg flex items-center space-x-3 space-x-reverse">
                        <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">שימו לב:</p>
                          <ul className="text-gray-400 text-sm list-disc list-inside">
                            <li>הקובץ חייב להכיל את הפרמטרים שהוגדרו במודל הניתוח</li>
                            <li>המערכת תייצר תיעדוף עם המלצות לטיפול מותאמות לצוות</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      חזרה
                    </Button>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600" 
                      onClick={handleSubmit}
                      disabled={!file}
                    >
                      בצע תיעדוף יומי
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 4 && (
                <div className="space-y-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto">
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">התיעדוף היומי בתהליך...</h3>
                  <p className="text-gray-400">
                    הנתונים נמצאים בתהליך תיעדוף. התהליך יסתיים תוך מספר דקות.
                    <br />
                    הרשימה המתועדפת תהיה זמינה בדף התיעדופים היומיים ותישלח בדוא"ל למנהלי הצוות.
                  </p>
                  
                  <div className="pt-6">
                    <Button asChild className="bg-orange-500 hover:bg-orange-600">
                      <Link href="/data-max">
                        חזרה לדף הראשי
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </RequireAuth>
  );
} 