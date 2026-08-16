import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بطاقة QR المنيو للطباعة | مطعم مصطفى الجزار",
  description: "بطاقة رمز الـ QR المخصصة لطاولات مطعم مصطفى الجزار. امسح الكود لتصفح المنيو الإلكتروني والطلب فوراً.",
  alternates: {
    canonical: "/qrcode",
  },
  openGraph: {
    title: "بطاقة QR المنيو للطباعة | مطعم مصطفى الجزار",
    description: "تصميم بطاقة كود المسح لـ QR المنيو الخاص بمطعم مصطفى الجزار.",
    url: "https://mostafaelgzar.com/qrcode",
  },
};

export default function QRCodeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
