'use client';

import { useState } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectValue, SelectTrigger, SelectContent, SelectItem, Select } from '@/components/ui/select';
import { AlertCircle, ChevronLeft, Upload } from 'lucide-react';
import Link from 'next/link';

export default function NewPrioritizationPage() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // מידע דמה על מודלים קיימים
  const availableModels = [
    { id: 'model-1', name: 'מודל ניתוח דאטה - B2B - יוני 2023', date: '15/06/2023' },
    { id: 'model-2', name: 'מודל ניתוח דאטה - C2B - ינואר 2023', date: '10/01/2023' },
    { id: 'model-3', name: 'מודל ניתוח דאטה - קמפיין קיץ 2023', date: '20/07/2023' },
  ];

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
      file
    });
    
    // אחרי הגשה, נעבור לדף אישור או דף תוצאות
    setStep(3);
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
              <h1 className="text-3xl font-bold text-white">תיעדוף לקוחות פוטנציאליים</h1>
              <p className="text-gray-400">דירוג לקוחות פוטנציאליים לפי הסתברות לסגירת עסקה</p>
            </div>
          </div>

          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">תיעדוף לקוחות פוטנציאליים חדש</CardTitle>
              <CardDescription className="text-gray-400">
                השתמשו במודל ניתוח הדאטה הקיים כדי לתעדף רשימת לקוחות פוטנציאליים
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
                  <div>
                    <Label className="text-white block mb-2">העלאת רשימת לקוחות פוטנציאליים</Label>
                    <p className="text-gray-400 mb-4">
                      העלו קובץ CSV או Excel המכיל את נתוני הלקוחות הפוטנציאליים.
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
                            <li>התיעדוף יתבסס על המשקלות והקורלציות שנמצאו בניתוח המקורי</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      חזרה
                    </Button>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600" 
                      onClick={handleSubmit}
                      disabled={!file}
                    >
                      בצע תיעדוף
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 3 && (
                <div className="space-y-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto">
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">התיעדוף בתהליך...</h3>
                  <p className="text-gray-400">
                    הנתונים נמצאים בתהליך תיעדוף. התהליך יכול להימשך מספר דקות, בהתאם לכמות הנתונים.
                    <br />
                    תוכלו לצפות בתוצאות בדף התיעדופים ברגע שהתהליך יסתיים.
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