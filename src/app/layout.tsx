import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameChanger - מערכת לניתוח שיחות מכירה ושירות בעזרת AI",
  description: "שדרגו את שיחות המכירה והשירות שלכם באמצעות ניתוח מתקדם מבוסס AI. זיהוי חוזקות, הצעות לשיפור וניתוח דאטה של לקוחות.",
  keywords: "ניתוח שיחות, מכירות, שירות לקוחות, בינה מלאכותית, AI",
  authors: [{ name: "צוות GameChanger" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <AuthProvider>
          {children}
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
