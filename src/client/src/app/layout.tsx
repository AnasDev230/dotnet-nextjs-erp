import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "بُنيان | Bunyan ERP",
  description: "نظام تخطيط موارد المؤسسات - Bunyan Enterprise Resource Planning",
};

const PRE_PAINT_SCRIPT = `
  (function () {
    try {
      var theme = localStorage.getItem('bunyan-theme');
      var isDark;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      document.documentElement.classList.toggle('dark', isDark);

      var lang = localStorage.getItem('bunyan-lang');
      var isAr = lang !== 'en';
      document.documentElement.lang = isAr ? 'ar' : 'en';
      document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <Script id="bunyan-boot" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
