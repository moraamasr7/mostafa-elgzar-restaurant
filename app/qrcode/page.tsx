"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Printer, Download, Globe, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function QRCodePage() {
  const [siteUrl, setSiteUrl] = useState("https://mostafa-elgzar-restaurant.vercel.app");
  const [qrStyle, setQrStyle] = useState<"royal" | "print">("royal");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Automatically detect the current domain
      setSiteUrl(window.location.origin);
    }
  }, []);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=000000&bgcolor=ffffff&qzone=2&data=${encodeURIComponent(siteUrl)}`;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24 pb-16 transition-colors duration-300 print:bg-white print:pt-4 print:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 print:px-0">
        
        {/* Navigation & Controls Header (Hidden during Print) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 print:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary-650 dark:text-primary-400 hover:text-primary-700 font-semibold transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span>الرجوع للرئيسية</span>
          </Link>
          
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 p-1.5 rounded-2xl shadow-sm">
            <button
              onClick={() => setQrStyle("royal")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                qrStyle === "royal"
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/10"
                  : "text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              الستايل الملكي الداكن
            </button>
            <button
              onClick={() => setQrStyle("print")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                qrStyle === "print"
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/10"
                  : "text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              ستايل الطباعة (موفر للحبر)
            </button>
          </div>
        </div>

        {/* Input Settings Panel (Hidden during Print) */}
        <div className="glass-card p-6 mb-8 print:hidden space-y-4">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary-500" />
            <span>تخصيص الرابط الإلكتروني الـ QR Code</span>
          </h2>
          <p className="text-sm text-stone-500 dark:text-gray-400">
            بشكل افتراضي، تم ربط الـ QR Code بموقعك الحالي تلقائياً. يمكنك تغيير الرابط يدوياً أدناه إذا أردت توجيهه لصفحة أخرى (مثل واتساب أو إنستجرام).
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Globe className="w-5 h-5 text-stone-400 dark:text-gray-500" />
              </span>
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="أدخل رابط المنيو هنا..."
                className="w-full bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl py-3 pr-10 pl-4 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all text-left"
                dir="ltr"
              />
            </div>
            <button
              onClick={copyLink}
              className="bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-800 dark:text-white px-4 rounded-xl text-sm font-semibold transition-all border border-stone-200 dark:border-white/10"
            >
              {copied ? "تم النسخ!" : "نسخ الرابط"}
            </button>
          </div>
        </div>

        {/* QR CODE CARD PRINT TEMPLATE */}
        <div className="flex justify-center print:block">
          <div
            id="qr-print-card"
            className={`w-full max-w-sm rounded-3xl p-8 text-center transition-all duration-300 ${
              qrStyle === "royal"
                ? "bg-dark-950 border-4 border-gold-500 shadow-2xl text-white relative"
                : "bg-white border-4 border-stone-950 text-stone-950"
            }`}
            style={{ minHeight: "520px" }}
          >
            {/* Background Pattern for Royal Style (Hidden during Print) */}
            {qrStyle === "royal" && (
              <div className="absolute inset-0 opacity-10 pointer-events-none rounded-3xl bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15),transparent_70%)]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M24 22v-2h-2v2h-2v2h2v2h2v-2h2v-2h-2zm0-18V2h-2v2h-2v2h2v2h2V6h2V4h-2zM4 22v-2H2v2H0v2h2v2h2v-2h2v-2H4zm0-18V2H2v2H0v2h2v2h2V6h2V4H4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }} />
            )}

            {/* Logo */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="w-16 h-16 object-contain rounded-2xl shadow-lg border border-stone-200/20"
              />
              <h3 className="text-2xl font-bold font-cairo">
                مطعم مصطفى الجزار
              </h3>
              <p className={`text-xs font-semibold ${qrStyle === "royal" ? "text-gold-400" : "text-stone-600"}`}>
                أصل الأكل الحرش
              </p>
            </div>

            {/* QR Code Frame */}
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-2xl shadow-inner ${
                qrStyle === "royal" ? "bg-white" : "bg-stone-50 border border-stone-200"
              }`}>
                <img
                  src={qrImageUrl}
                  alt="QR Code"
                  className="w-56 h-56 object-contain select-none"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <h4 className="text-lg font-bold">
                امسح الـ QR Code 📱
              </h4>
              <p className={`text-xs leading-relaxed max-w-xs mx-auto ${
                qrStyle === "royal" ? "text-stone-300" : "text-stone-600"
              }`}>
                لتصفح المنيو الكامل والطلب المباشر من هاتفك المحمول داخل الصالة أو للمنزل
              </p>
            </div>

            {/* Subtext info */}
            <div className="mt-6 pt-4 border-t border-dashed border-stone-200/20 dark:border-stone-900/10 flex items-center justify-between text-[10px] text-stone-500">
              <span>01122339739</span>
              <span>المطرية - القاهرة</span>
              <span>01020058231</span>
            </div>
          </div>
        </div>

        {/* Print & Download Panel Actions (Hidden during Print) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 print:hidden">
          <button
            onClick={handlePrint}
            className="btn-primary text-base px-6 py-3 flex items-center gap-2 shadow-lg shadow-primary-500/20 w-full sm:w-auto justify-center select-none"
          >
            <Printer className="w-5 h-5" />
            <span>طباعة بطاقات المنيو</span>
          </button>
          
          <a
            href={qrImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download="qrcode.png"
            className="btn-gold text-base px-6 py-3 flex items-center gap-2 shadow-lg shadow-gold-500/20 w-full sm:w-auto justify-center select-none"
          >
            <Download className="w-5 h-5" />
            <span>تحميل رمز الـ QR فقط</span>
          </a>
        </div>

        {/* Styling overrides for Print Mode */}
        <style jsx global>{`
          @media print {
            body {
              background-color: white !important;
              color: black !important;
            }
            main {
              padding-top: 0 !important;
            }
            nav, footer, .print\\:hidden {
              display: none !important;
            }
            #qr-print-card {
              box-shadow: none !important;
              margin: 0 auto !important;
              page-break-inside: avoid;
            }
          }
        `}</style>

      </div>
    </div>
  );
}
