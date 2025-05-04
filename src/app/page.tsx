import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/Logo';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col rtl bg-black text-white">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-10">
        <Logo />
        <nav className="mr-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium text-white hover:text-[#FAA977] transition-colors duration-200 underline-offset-4">
            כניסה
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        {/* Hero Section with background pattern and animation */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF6F00]/10 to-[#4D1F0F]/10 opacity-20"></div>
          {/* Animated Gradient Orbs */}
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-[#FF6F00]/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-[#4D1F0F]/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block text-sm font-medium px-3 py-1 bg-[#FF6F00]/10 text-[#FAA977] rounded-full mb-2 animate-fadeIn border border-[#FF6F00]/20">
                    הדרך החכמה לניתוח שיחות
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none animate-slideFromBottom" style={{ animationDelay: '0.2s' }}>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6F00] to-[#FAA977]">GameChanger</span> - הפלטפורמה לניהול מכירות ושירות
                  </h1>
                  <p className="max-w-[600px] text-gray-300 md:text-xl animate-slideFromBottom" style={{ animationDelay: '0.4s' }}>
                    שדרגו את שיחות המכירה והשירות שלכם באמצעות ניתוח מתקדם מבוסס AI.
                    זהו נתונים חשובים, חוזקות ונקודות לשיפור, וקבלו המלצות מעשיות.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row animate-slideFromBottom" style={{ animationDelay: '0.6s' }}>
                  <Button asChild size="lg" className="bg-gradient-to-r from-[#FF6F00] to-[#FAA977] hover:from-[#FAA977] hover:to-[#FF6F00] shadow-lg shadow-[#FF6F00]/20 hover:shadow-xl hover:shadow-[#FF6F00]/30 transition-all duration-200 border-0 text-white">
                    <Link href="/login">
                      התחל כעת
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-[#FF6F00]/50 hover:border-[#FF6F00] hover:bg-[#FF6F00]/5 transition-colors duration-200 text-white">
                    <Link href="#features">
                      למידע נוסף
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center animate-slideFromRight" style={{ animationDelay: '0.8s' }}>
                <div className="relative h-80 w-full overflow-hidden rounded-xl bg-gray-800 md:h-96 shadow-2xl shadow-[#FF6F00]/10 transform hover:scale-[1.03] transition-transform duration-300 border border-[#FF6F00]/10">
                  <div className="bg-gradient-to-br from-[#000000] to-[#4D1F0F] h-full w-full flex items-center justify-center text-center p-6">
                    <div className="space-y-4 text-white">
                      <div className="flex justify-center mb-2">
                        <div className="h-16 w-16 rounded-full bg-[#FF6F00]/20 flex items-center justify-center animate-pulse">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-[#FAA977]"
                          >
                            <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1" />
                            <path d="M15 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1" />
                            <path d="M8 3v2a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V3" />
                            <line x1="2" x2="22" y1="19" y2="19" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold">דוגמת ניתוח שיחת מכירה</h3>
                      <div className="space-y-3 text-start">
                        <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-[#FF6F00]/20 transition-colors duration-200 transform hover:translate-x-1">
                          <p><strong className="text-[#FAA977]">נקודות לשימור:</strong> הקשבה אקטיבית, זיהוי צרכים</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-[#FF6F00]/20 transition-colors duration-200 transform hover:translate-x-1">
                          <p><strong className="text-[#FAA977]">נקודות לשיפור:</strong> טכניקות סגירה, התמודדות עם התנגדויות</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[#FF6F00]/5 hover:bg-[#FF6F00]/10 border border-[#FF6F00]/30 transition-colors duration-200 transform hover:translate-x-1">
                          <p><strong>ציון כולל:</strong> <span className="text-[#FAA977] font-bold text-xl">85/100</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="w-full py-12 bg-gradient-to-b from-black to-[#1A0D06]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center p-6 rounded-xl bg-[#000000]/60 border border-[#FF6F00]/10 hover:border-[#FF6F00]/30 hover:bg-[#FF6F00]/5 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-4xl font-bold text-[#FAA977]">+83%</h3>
                <p className="text-gray-400 mt-2">שיפור ביצועי מכירות</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-[#000000]/60 border border-[#FF6F00]/10 hover:border-[#FF6F00]/30 hover:bg-[#FF6F00]/5 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-4xl font-bold text-[#FAA977]">+65%</h3>
                <p className="text-gray-400 mt-2">שיפור בשביעות רצון לקוחות</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-[#000000]/60 border border-[#FF6F00]/10 hover:border-[#FF6F00]/30 hover:bg-[#FF6F00]/5 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-4xl font-bold text-[#FAA977]">-40%</h3>
                <p className="text-gray-400 mt-2">ירידה בזמן הדרכת עובדים</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-[#000000]/60 border border-[#FF6F00]/10 hover:border-[#FF6F00]/30 hover:bg-[#FF6F00]/5 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-4xl font-bold text-[#FAA977]">+95%</h3>
                <p className="text-gray-400 mt-2">שביעות רצון משתמשים</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black relative" id="features">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#FF6F00]/5 blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-[#4D1F0F]/10 blur-3xl"></div>
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-gradient-to-r from-[#FF6F00] to-[#FAA977] px-4 py-1.5 text-sm text-white font-medium shadow-md shadow-[#FF6F00]/20">
                  תכונות
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white">
                  כל מה שצריך לשיפור השיחות שלכם
                </h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  המערכת מציעה מגוון כלים לניתוח ושיפור שיחות המכירה והשירות בארגון שלכם
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="group grid gap-2 transition-all duration-200 p-6 rounded-xl hover:bg-[#FF6F00]/5 border border-transparent hover:border-[#FF6F00]/20 hover:-translate-y-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6F00] to-[#FAA977] text-white shadow-lg shadow-[#FF6F00]/20 group-hover:shadow-[#FF6F00]/30 transition-all duration-200">
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
                </div>
                <h3 className="text-xl font-bold group-hover:text-[#FAA977] transition-colors duration-200">ניתוח שיחות</h3>
                <p className="text-gray-300">
                  ניתוח מתקדם של שיחות מכירה ושירות, זיהוי נקודות לשימור ונקודות לשיפור
                </p>
              </div>
              <div className="group grid gap-2 transition-all duration-200 p-6 rounded-xl hover:bg-[#FF6F00]/5 border border-transparent hover:border-[#FF6F00]/20 hover:-translate-y-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6F00] to-[#FAA977] text-white shadow-lg shadow-[#FF6F00]/20 group-hover:shadow-[#FF6F00]/30 transition-all duration-200">
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
                </div>
                <h3 className="text-xl font-bold group-hover:text-[#FAA977] transition-colors duration-200">אוגדני מכירות ושירות</h3>
                <p className="text-gray-300">
                  יצירת אוגדני מכירות ושירות מקצועיים על בסיס ניתוחי השיחות
                </p>
              </div>
              <div className="group grid gap-2 transition-all duration-200 p-6 rounded-xl hover:bg-[#FF6F00]/5 border border-transparent hover:border-[#FF6F00]/20 hover:-translate-y-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6F00] to-[#FAA977] text-white shadow-lg shadow-[#FF6F00]/20 group-hover:shadow-[#FF6F00]/30 transition-all duration-200">
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
                </div>
                <h3 className="text-xl font-bold group-hover:text-[#FAA977] transition-colors duration-200">מקסום דאטה</h3>
                <p className="text-gray-300">
                  ניתוח דאטה של לקוחות לזיהוי ומקסום פוטנציאל המכירות
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 bg-gradient-to-b from-[#1A0D06] to-black">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white mb-4">
                מה לקוחותינו אומרים
              </h2>
              <p className="max-w-[700px] mx-auto text-gray-300">
                אלפי חברות כבר משתמשות ב-GameChanger כדי לשפר את תהליכי המכירה והשירות שלהן
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 hover:border-[#FF6F00]/30 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#FF6F00]/20 rounded-full flex items-center justify-center text-xl font-bold text-[#FAA977]">א</div>
                  <div className="mr-4">
                    <h4 className="font-bold">אריאל טכנולוגיות</h4>
                    <p className="text-sm text-gray-400">אורי, מנהל מכירות</p>
                  </div>
                </div>
                <p className="text-gray-300">"הפלטפורמה שינתה לחלוטין את תהליכי ההדרכה והבקרה שלנו. נציגי המכירות שלנו משתפרים הרבה יותר מהר עם המשובים המדויקים."</p>
                <div className="flex mt-4 text-[#FAA977]">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 hover:border-[#FF6F00]/30 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#FF6F00]/20 rounded-full flex items-center justify-center text-xl font-bold text-[#FAA977]">מ</div>
                  <div className="mr-4">
                    <h4 className="font-bold">מגדל ביטוח</h4>
                    <p className="text-sm text-gray-400">רונית, מנהלת שירות</p>
                  </div>
                </div>
                <p className="text-gray-300">"היכולת לנתח שיחות שירות בזמן אמת ולקבל תובנות מיידיות היא פשוט מדהימה. שיפרנו את שביעות רצון הלקוחות ב-30% תוך חודשיים."</p>
                <div className="flex mt-4 text-[#FAA977]">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 hover:border-[#FF6F00]/30 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#FF6F00]/20 rounded-full flex items-center justify-center text-xl font-bold text-[#FAA977]">ד</div>
                  <div className="mr-4">
                    <h4 className="font-bold">דיגיטל פלוס</h4>
                    <p className="text-sm text-gray-400">יואב, סמנכ"ל מכירות</p>
                  </div>
                </div>
                <p className="text-gray-300">"הניתוחים המעמיקים שהמערכת מספקת עזרו לנו לזהות דפוסים שלא היינו ערים להם. כעת יש לנו תהליך מכירה אחיד ויעיל הרבה יותר."</p>
                <div className="flex mt-4 text-[#FAA977]">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 bg-black">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="bg-gradient-to-r from-[#1A0D06] to-black rounded-2xl p-8 md:p-12 border border-[#FF6F00]/20 shadow-lg relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#FF6F00]/10 blur-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white mb-4 max-w-2xl">
                  מוכנים להפוך את השיחות שלכם למוצלחות יותר?
                </h2>
                <p className="max-w-[700px] text-gray-300 mb-8">
                  התחילו עוד היום ותגלו איך GameChanger יכול לשפר משמעותית את תהליכי המכירה והשירות בארגון שלכם.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-gradient-to-r from-[#FF6F00] to-[#FAA977] hover:from-[#FAA977] hover:to-[#FF6F00] shadow-lg shadow-[#FF6F00]/20 hover:shadow-xl hover:shadow-[#FF6F00]/30 transition-all duration-200 border-0 text-white">
                    <Link href="/login">
                      התחל חינם לתקופת ניסיון
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-[#FF6F00]/50 hover:border-[#FF6F00] hover:bg-[#FF6F00]/5 transition-colors duration-200 text-white">
                    <Link href="#">
                      תיאום הדגמה אישית
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-gray-800 bg-gradient-to-b from-[#1A0D06] to-black pt-12 pb-6">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="space-y-4">
              <Logo />
              <p className="text-gray-400 text-sm">
                פלטפורמה מתקדמת לניתוח והכשרה מבוססי AI עבור צוותי מכירות ושירות לקוחות.
              </p>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <a href="#" className="w-10 h-10 rounded-full bg-[#FF6F00]/10 flex items-center justify-center hover:bg-[#FF6F00]/20 transition-colors duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#FAA977]"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#FF6F00]/10 flex items-center justify-center hover:bg-[#FF6F00]/20 transition-colors duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#FAA977]"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#FF6F00]/10 flex items-center justify-center hover:bg-[#FF6F00]/20 transition-colors duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#FAA977]"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#FF6F00]/10 flex items-center justify-center hover:bg-[#FF6F00]/20 transition-colors duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#FAA977]"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">קישורים מהירים</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">דף הבית</Link></li>
                <li><a href="#features" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">תכונות</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">תמחור</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">בלוג</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">צור קשר</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">פתרונות</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">לחברות קטנות</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">לחברות בינוניות</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">לארגונים גדולים</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">שותפים עסקיים</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">אינטגרציות</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">הישארו מעודכנים</h3>
              <p className="text-gray-400 mb-4">הירשמו לניוזלטר שלנו וקבלו עדכונים ומאמרים על תחום המכירות והשירות</p>
              <div className="flex flex-col space-y-2">
                <input 
                  type="email" 
                  placeholder="האימייל שלך"
                  className="px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:outline-none focus:border-[#FF6F00] transition-colors duration-200"
                />
                <button className="bg-gradient-to-r from-[#FF6F00] to-[#FAA977] hover:from-[#FAA977] hover:to-[#FF6F00] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-[#FF6F00]/20 hover:shadow-xl hover:shadow-[#FF6F00]/30">
                  הרשמה לניוזלטר
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-right text-sm text-gray-400 mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} GameChanger. כל הזכויות שמורות ל-GameChanger ונבנה באמצעות KA
              </div>
              <div className="flex space-x-6 rtl:space-x-reverse text-sm">
                <a href="#" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">תנאי שימוש</a>
                <a href="#" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">מדיניות פרטיות</a>
                <a href="#" className="text-gray-400 hover:text-[#FAA977] transition-colors duration-200">מדיניות עוגיות</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
