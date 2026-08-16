import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "عن المطعم وقصة الجزار | مطعم مصطفى الجزار",
  description: "تعرف على تاريخ وقصة مطعم مصطفى الجزار - أصل الأكل الحرش بالمطرية والقاهرة. التزام دائم بالجودة والنظافة واللحوم البلدي الطازجة.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "عن المطعم وقصة الجزار | مطعم مصطفى الجزار",
    description: "قصة تاريخ وخبرة مطعم مصطفى الجزار في تقديم المأكولات الحرشة وفواكة اللحوم البلدي.",
    url: "https://mostafaelgzar.com/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
