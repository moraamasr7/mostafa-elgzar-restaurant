import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { OrderModalProvider } from "@/components/OrderModalContext";
import FloatingActions from "@/components/FloatingActions";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "مطعم مصطفى الجزار - أصل الأكل الحرش",
    template: "%s | مطعم مصطفى الجزار",
  },
  description: "الموقع الرسمي لمطعم مصطفى الجزار بالقاهرة والمطرية - أشهى الكبدة، الكفتة، السجق، الممبار، والكلاوي البلدي. تصفح المنيو واطلب الآن.",
  keywords: [
    "مطعم مصطفى الجزار",
    "أصل الأكل الحرش",
    "كبدة بلدي",
    "كفتة بلدي",
    "سجق شرقي",
    "ممبار",
    "كلاوي",
    "المطرية",
    "القاهرة",
    "منيو مصطفى الجزار",
    "توصيل أكل المطرية",
    "أكل حرش مصري",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.siteUrl }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "مطعم مصطفى الجزار - أصل الأكل الحرش",
    description: "أشهى المأكولات والمشويات البلدي بأسعار مميزة في المطرية، القاهرة. تصفح المنيو الإلكتروني والورقي الآن.",
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    type: "website",
    locale: "ar_EG",
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 800,
        alt: "Mostafa Elgzar Restaurant Logo",
      },
      {
        url: "/images/storefront.jpg",
        width: 1200,
        height: 630,
        alt: "Mostafa Elgzar Restaurant Storefront",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "مطعم مصطفى الجزار - أصل الأكل الحرش",
    description: "أشهى الأكلات المصرية الحرشة والمشويات البلدي بالمطرية.",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": siteConfig.name,
  "alternateName": "Mostafa Elgzar Restaurant",
  "image": [
    `${siteConfig.siteUrl}/images/logo.png`,
    `${siteConfig.siteUrl}/images/storefront.jpg`
  ],
  "@id": siteConfig.siteUrl,
  "url": siteConfig.siteUrl,
  "telephone": [siteConfig.phone, siteConfig.phoneSecondary],
  "priceRange": "$$",
  "servesCuisine": ["Egyptian", "Grilled", "Middle Eastern"],
  "menu": `${siteConfig.siteUrl}/menu`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": siteConfig.location,
    "addressLocality": "المطرية",
    "addressRegion": "القاهرة",
    "addressCountry": "EG"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 30.13,
    "longitude": 31.31
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "opens": "10:00",
    "closes": "02:00"
  },
  "acceptsReservations": "False",
  "sameAs": [
    "https://www.facebook.com/mostafa.elgazar.res",
    "https://www.tiktok.com/@m.elgzar"
  ]
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
                  document.documentElement.classList.add('dark');
                } catch (e) {}
              })()
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="min-h-screen bg-stone-50 text-stone-900 dark:bg-dark-950 dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <OrderModalProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <FloatingActions />
          </OrderModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
