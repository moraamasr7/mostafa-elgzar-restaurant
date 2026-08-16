import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "منيو مطعم مصطفى الجزار الكامل | قائمة الطعام",
  description: "تصفح منيو مطعم مصطفى الجزار بالكامل - الكبدة البلدي، الكفتة المشوية، السجق الشرقي، الممبار، والطواجن بأسعار مميزة. اختر الاستلام من الفرع أو التوصيل.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "منيو مطعم مصطفى الجزار الكامل | قائمة الطعام",
    description: "تصفح قائمة أطباقنا الحرشة والمشويات البلدي بأسعار مميزة بالمطرية، القاهرة.",
    url: "https://mostafaelgzar.com/menu",
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
