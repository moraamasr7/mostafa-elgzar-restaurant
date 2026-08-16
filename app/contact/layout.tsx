import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تواصل معنا وخريطة الموقع | مطعم مصطفى الجزار",
  description: "تواصل مع مطعم مصطفى الجزار بالمطرية، القاهرة. أرقام التليفون: 01122339739 و 01020058231. خريطة الفرع ومواعيد العمل يومياً من 10 صباحاً إلى 2 فجراً.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "تواصل معنا وخريطة الموقع | مطعم مصطفى الجزار",
    description: "عنوان وأرقام تليفون فرع مطعم مصطفى الجزار بالمطرية، القاهرة.",
    url: "https://mostafaelgzar.com/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
