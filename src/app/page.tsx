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
        {/* Hero Section with background pattern */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF6F00]/10 to-[#4D1F0F]/10 opacity-20"></div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block text-sm font-medium px-3 py-1 bg-[#FF6F00]/10 text-[#FAA977] rounded-full mb-2">
                    הדרך החכמה לניתוח שיחות
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6F00] to-[#FAA977]">GameChanger</span> - מערכת לניתוח שיחות מכירה ושירות
                  </h1>
                  <p className="max-w-[600px] text-gray-300 md:text-xl">
                    שדרגו את שיחות המכירה והשירות שלכם באמצעות ניתוח מתקדם מבוסס AI.
                    זהו נתונים חשובים, חוזקות ונקודות לשיפור, וקבלו המלצות מעשיות.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
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
              <div className="flex items-center justify-center">
                <div className="relative h-80 w-full overflow-hidden rounded-xl bg-gray-800 md:h-96 shadow-2xl shadow-[#FF6F00]/10 transform hover:scale-[1.01] transition-transform duration-300">
                  <div className="bg-gradient-to-br from-[#000000] to-[#4D1F0F] h-full w-full flex items-center justify-center text-center p-6">
                    <div className="space-y-4 text-white">
                      <div className="flex justify-center mb-2">
                        <div className="h-16 w-16 rounded-full bg-[#FF6F00]/20 flex items-center justify-center">
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
                        <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-[#FF6F00]/20 transition-colors duration-200">
                          <p><strong className="text-[#FAA977]">חוזקות:</strong> הקשבה אקטיבית, זיהוי צרכים</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-[#FF6F00]/20 transition-colors duration-200">
                          <p><strong className="text-[#FAA977]">לשיפור:</strong> טכניקות סגירה, התמודדות עם התנגדויות</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[#FF6F00]/5 hover:bg-[#FF6F00]/10 border border-[#FF6F00]/30 transition-colors duration-200">
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
              <div className="group grid gap-2 transition-all duration-200 p-4 rounded-xl hover:bg-[#FF6F00]/5 border border-transparent hover:border-[#FF6F00]/20">
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
                  ניתוח מתקדם של שיחות מכירה ושירות, זיהוי חוזקות ונקודות לשיפור
                </p>
              </div>
              <div className="group grid gap-2 transition-all duration-200 p-4 rounded-xl hover:bg-[#FF6F00]/5 border border-transparent hover:border-[#FF6F00]/20">
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
              <div className="group grid gap-2 transition-all duration-200 p-4 rounded-xl hover:bg-[#FF6F00]/5 border border-transparent hover:border-[#FF6F00]/20">
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
      </main>
      <footer className="border-t border-gray-800 bg-black">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
          <div className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} GameChang. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </div>
  );
}
