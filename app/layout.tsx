import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import FloatingActions from "@/components/FloatingActions";

export const metadata: Metadata = {
  title: "مصطفى الجزار - Mostafa Elgzar",
  description: "مطعم مصطفى الجزار - أشهى المأكولات والمشويات بأسعار مميزة. تصفح المنيو الخاص بنا الآن.",
  keywords: "مطعم مصطفى الجزار, أصل الأكل الحرش, كبدة, كفتة, سجق, ممبار, كلاوي, المطرية, القاهرة, مطعم بلدي, مشويات",
  authors: [{ name: "Mostafa Elgzar Restaurant" }],
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "مصطفى الجزار - Mostafa Elgzar",
    description: "مطعم مصطفى الجزار - أشهى المأكولات والمشويات بأسعار مميزة. تصفح المنيو الخاص بنا الآن.",
    type: "website",
    locale: "ar_EG",
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 800,
        alt: "Mostafa Elgzar Logo",
      },
    ],
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
