'use client';

import { useState } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { SelectValue, SelectTrigger, SelectContent, SelectItem, Select } from '@/components/ui/select';
import { AlertCircle, ChevronLeft, Upload } from 'lucide-react';
import Link from 'next/link';

const b2bParameters = [
  { id: 'company_size', label: 'גודל חברה' },
  { id: 'geo_location', label: 'מיקום ג"ג' },
  { id: 'segment', label: 'תחום/סגמנט' },
  { id: 'urgency', label: 'רמת דחיפות אצל הלקוח' },
  { id: 'source', label: 'מקור הגעה' },
  { id: 'meetings_count', label: 'כמות פגישות' },
  { id: 'calls_count', label: 'כמות שיחות' },
  { id: 'time_to_close', label: 'משך זמן מליד לסגירה' },
  { id: 'agent', label: 'סוכן/משווק' },
  { id: 'deal_amount', label: 'סכום עסקה' },
  { id: 'acquisition_cost', label: 'עלות הרכשה שיווקית' },
  { id: 'pain_point', label: 'סיבת הפנייה/הכאב/צורך' },
  { id: 'lead_date', label: 'מועד כניסת הליד' },
  { id: 'last_interaction_date', label: 'מועד אינטראקציה אחרונה' },
  { id: 'last_interaction_type', label: 'סוג אינטראקציה אחרונה' },
  { id: 'status', label: 'סטטוס' },
  { id: 'notes', label: 'הערות' },
  { id: 'call_log', label: 'לוג שיחה' },
  { id: 'meeting_log', label: 'לוג פגישה' },
  { id: 'campaign', label: 'קמפיין' },
  { id: 'promotion', label: 'סוג מבצע/הטבה/הנחה' },
  { id: 'creative', label: 'קריאייטיב' },
];

const c2bParameters = [
  { id: 'age', label: 'גיל' },
  { id: 'gender', label: 'מין' },
  { id: 'geo_location', label: 'מיקום ג"ג' },
  { id: 'source', label: 'מקור הגעה' },
  { id: 'meetings_count', label: 'כמות פגישות' },
  { id: 'calls_count', label: 'כמות שיחות' },
  { id: 'time_to_close', label: 'משך זמן מליד לסגירה' },
  { id: 'agent', label: 'נציג' },
  { id: 'deal_amount', label: 'סכום עסקה' },
  { id: 'acquisition_cost', label: 'עלות הרכשה שיווקית' },
  { id: 'purchase_history', label: 'היסטוריית עסקאות' },
  { id: 'pain_point', label: 'סיבת הפנייה/הכאב/צורך' },
  { id: 'urgency', label: 'דחיפות הצורך' },
  { id: 'lead_date', label: 'מועד כניסת הליד' },
  { id: 'last_interaction_date', label: 'מועד אינטראקציה אחרונה' },
  { id: 'last_interaction_type', label: 'סוג אינטראקציה אחרונה' },
  { id: 'status', label: 'סטטוס' },
  { id: 'notes', label: 'הערות' },
  { id: 'call_log', label: 'לוג שיחה' },
  { id: 'meeting_log', label: 'לוג פגישה' },
  { id: 'profession', label: 'מקצוע' },
  { id: 'income', label: 'הכנסה' },
  { id: 'education', label: 'השכלה' },
  { id: 'campaign', label: 'קמפיין' },
  { id: 'promotion', label: 'סוג מבצע/הטבה/הנחה' },
  { id: 'creative', label: 'קריאייטיב' },
];

export default function NewAnalysisPage() {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [segment, setSegment] = useState('');
  const [audienceType, setAudienceType] = useState('');
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const parameters = audienceType === 'b2b' ? b2bParameters : audienceType === 'c2b' ? c2bParameters : [];

  const handleParameterChange = (paramId: string, checked: boolean) => {
    if (checked) {
      setSelectedParameters([...selectedParameters, paramId]);
    } else {
      setSelectedParameters(selectedParameters.filter(id => id !== paramId));
    }
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
    // כאן נבצע את הלוגיקה להעלאת הקובץ וביצוע הניתוח
    console.log({
      companyName,
      segment,
      audienceType,
      selectedParameters,
      file
    });
    
    // אחרי הגשה, נעבור לדף אישור או דף תוצאות
    // בשלב זה נישאר באותו דף לצורך הדגמה
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
              <h1 className="text-3xl font-bold text-white">ניתוח דאטה חדש</h1>
              <p className="text-gray-400">ניתוח כלל הדאטה לזיהוי פרמטרים המשפיעים על סגירת עסקה</p>
            </div>
          </div>

          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">פרטים ראשוניים נדרשים</CardTitle>
              <CardDescription className="text-gray-400">
                מלאו את הפרטים הבאים לניתוח אפקטיבי של הדאטה
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-name" className="text-white">שם החברה</Label>
                    <Input
                      id="company-name"
                      placeholder="הזינו את שם החברה"
                      className="bg-gray-800 border-gray-700 text-white"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="segment" className="text-white">תחום/סגמנט</Label>
                    <Input
                      id="segment"
                      placeholder="הזינו את תחום או סגמנט הפעילות"
                      className="bg-gray-800 border-gray-700 text-white"
                      value={segment}
                      onChange={(e) => setSegment(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">קהל יעד</Label>
                    <RadioGroup value={audienceType} onValueChange={setAudienceType} className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="b2b" id="b2b" className="border-orange-500 text-orange-500" />
                        <Label htmlFor="b2b" className="text-white">קהל עסקי (B2B)</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="c2b" id="c2b" className="border-orange-500 text-orange-500" />
                        <Label htmlFor="c2b" className="text-white">קהל פרטי (C2B)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600" 
                      onClick={() => audienceType ? setStep(2) : null}
                      disabled={!audienceType}
                    >
                      המשך
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-white block mb-2">פרמטרים זמינים לניתוח</Label>
                    <p className="text-gray-400 mb-4">סמנו את הפרמטרים הזמינים לניתוח:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {parameters.map((param) => (
                        <div key={param.id} className="flex items-start space-x-2 space-x-reverse">
                          <Checkbox 
                            id={param.id}
                            checked={selectedParameters.includes(param.id)}
                            onCheckedChange={(checked) => handleParameterChange(param.id, checked === true)}
                            className="mt-1 border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
                          />
                          <Label htmlFor={param.id} className="text-white">{param.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      חזרה
                    </Button>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600" 
                      onClick={() => setStep(3)}
                      disabled={selectedParameters.length === 0}
                    >
                      המשך
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-white block mb-2">העלאת קובץ</Label>
                    <p className="text-gray-400 mb-4">
                      העלו קובץ CSV או Excel המכיל את הנתונים של לקוחות שביצעו רכישה וכאלה שלא.
                      <br />
                      הקובץ חייב להכיל את הפרמטר "סטטוס" שמציין האם הלקוח רכש/סגר עסקה או לא.
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
                          <p className="text-white font-medium">בדקו שהקובץ כולל:</p>
                          <ul className="text-gray-400 text-sm list-disc list-inside">
                            <li>עמודת סטטוס שמציינת האם לקוח רכש/סגר עסקה</li>
                            <li>הפרמטרים שסימנתם בשלב הקודם</li>
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
                      בצע ניתוח
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 4 && (
                <div className="space-y-6 text-center">
                  <div className="h-16 w-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto">
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">הניתוח בתהליך...</h3>
                  <p className="text-gray-400">
                    הנתונים נמצאים בתהליך ניתוח. התהליך יכול להימשך מספר דקות, בהתאם לכמות הנתונים.
                    <br />
                    תוכלו לצפות בתוצאות בדף הניתוחים ברגע שהתהליך יסתיים.
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