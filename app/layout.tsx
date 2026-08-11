import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import FloatingActions from "@/components/FloatingActions";

export const metadata: Metadata = {
  title: "مطعم مصطفى الجزار | أصل الأكل الحرش",
  description: "مطعم مصطفى الجزار - أصل الأكل الحرش في المطرية. نقدم أشهى الأكلات البلدي المصرية: كبدة، كفتة، سجق، ممبار، كلاوي، طواجن، لحمة بلدي محمرة باللية.",
  keywords: "مطعم مصطفى الجزار, أكل حرش, كبدة, كفتة, سجق, ممبار, كلاوي, المطرية, القاهرة, مطعم بلدي",
  authors: [{ name: "Mostafa Elgzar Restaurant" }],
  openGraph: {
    title: "مطعم مصطفى الجزار | أصل الأكل الحرش",
    description: "أشهى الأكلات البلدي المصرية في المطرية - كبدة، كفتة، سجق، ممبار، كلاوي",
    type: "website",
    locale: "ar_EG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-stone-50 text-stone-900 dark:bg-dark-950 dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <FloatingActions />
        </ThemeProvider>
      </body>
    </html>
  );
}
