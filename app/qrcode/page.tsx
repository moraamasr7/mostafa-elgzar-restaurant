"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Printer, Download, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getCanonicalUrl, siteConfig } from "@/lib/config";

export default function QRCodePage() {
  const defaultMenuUrl = getCanonicalUrl("/menu");
  const [siteUrl, setSiteUrl] = useState(defaultMenuUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // If running on a live domain (not localhost), sync to active origin /menu
      if (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")) {
        setSiteUrl(`${window.location.origin}/menu`);
      }
    }
  }, []);

  // Request QR code with High Error Correction (ecc=H) to allow central logo overlay without scan failure
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&ecc=H&color=000000&bgcolor=ffffff&qzone=2&data=${encodeURIComponent(siteUrl)}`;

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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 print:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary-650 dark:text-primary-400 hover:text-primary-700 font-semibold transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span>الرجوع للرئيسية</span>
          </Link>
          <span className="text-sm text-stone-500 dark:text-gray-400 font-medium">تصميم بطاقة الطاولة للمطعم</span>
        </div>

        {/* Input Settings Panel (Hidden during Print) */}
        <div className="glass-card p-6 mb-8 print:hidden space-y-4">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary-500" />
            <span>رابط الـ QR Code النشط</span>
          </h2>
          <p className="text-sm text-stone-500 dark:text-gray-400">
            تتعرف الصفحة تلقائياً على رابط موقعك وتولّد كود المسح له. يمكنك تغيير الرابط بالأسفل يدوياً للتوجيه لأي رابط تريده.
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
            className="w-full max-w-sm rounded-3xl p-8 text-center transition-all duration-300 bg-black border-4 border-stone-900 shadow-2xl text-white relative print:border-stone-950"
            style={{ minHeight: "560px" }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none rounded-3xl bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.2),transparent_70%)]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M24 22v-2h-2v2h-2v2h2v2h2v-2h2v-2h-2zm0-18V2h-2v2h-2v2h2v2h2V6h2V4h-2zM4 22v-2H2v2H0v2h2v2h2v-2h2v-2H4zm0-18V2H2v2H0v2h2v2h2V6h2V4H4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            {/* Restaurant Logo & Header */}
            <div className="flex flex-col items-center gap-2 mb-8 relative z-10">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="w-16 h-16 object-contain rounded-2xl shadow-lg border border-stone-800"
              />
              <h3 className="text-2xl font-bold font-cairo tracking-wide text-white">
                مطعم مصطفى الجزار
              </h3>
              <div className="h-0.5 w-16 bg-primary-600 mt-1 rounded-full"></div>
              <p className="text-xs font-semibold text-gold-400 mt-1">
                أصل الأكل الحرش
              </p>
            </div>

            {/* QR Code Container with Red/Black Scan Frame */}
            <div className="flex justify-center mb-6 relative z-10">
              <div className="relative p-6 bg-stone-950 rounded-3xl border border-stone-800 shadow-xl">
                
                {/* Red Scanner Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-600 rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-600 rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-600 rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-600 rounded-br-2xl"></div>
                
                {/* QR Code Image and Overlay Central Logo */}
                <div className="relative p-2 bg-white rounded-2xl shadow-lg">
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    className="w-48 h-48 object-contain select-none"
                  />
                  {/* Central Logo Overlay */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center shadow-md border border-stone-200">
                    <img
                      src="/images/logo.png"
                      alt="Center Logo"
                      className="w-10 h-10 object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pill "Scan Me" Label */}
            <div className="mb-4 relative z-10">
              <div className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-full text-xs font-extrabold shadow-lg shadow-primary-600/30 animate-pulse border border-primary-500">
                <QrCode className="w-3.5 h-3.5" />
                <span>امسح المنيو</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2 relative z-10">
              <p className="text-xs leading-relaxed max-w-xs mx-auto text-stone-300 font-medium">
                تصفح قائمة المشويات والأطباق بالكامل واطلب طعامك مباشرة من تليفونك
              </p>
            </div>

            {/* Subtext Info */}
            <div className="mt-8 pt-4 border-t border-dashed border-stone-800 flex items-center justify-between text-[10px] text-stone-400 relative z-10">
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
              background-color: black !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>

      </div>
    </div>
  );
}
