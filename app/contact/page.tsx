"use client";

import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Truck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const contactMethods = [
  {
    icon: Phone,
    title: "اتصل بنا",
    description: "اتصل بنا مباشرة على أي من الأرقام التالية",
    items: [
      { label: "الرئيسي", value: "01122 339 739", href: "tel:01122339739" },
      { label: "بديل 1", value: "01020 058 231", href: "tel:01020058231" },
    ],
    color: "primary",
  },
  {
    icon: MapPin,
    title: "العنوان",
    description: "زورنا في المطرية",
    items: [
      { label: "", value: "5 شارع عمر المختار، متفرع من شارع الحرية، الرشاح، المطرية، القاهرة", href: "https://maps.app.goo.gl/D5ENYuQWe8EdeyjS6" },
    ],
    color: "gold",
  },
  {
    icon: Clock,
    title: "مواعيد العمل",
    description: "مفتوح يومياً",
    items: [
      { label: "ساعات العمل", value: "نعمل يومياً من [4 العصر] إلى [4 ليلآ]", href: "" },
    ],
    color: "primary",
  },
];

const deliveryPlatforms = [
  {
    name: "طلبات (Talabat)",
    url: "https://www.talabat.com/ar/egypt/restaurant/781448/mostafa-algazaar-restaurant-matareya?aid=7828",
    description: "اطلب ونوصل لباب بيتك",
  },
  {
    name: "Elmenus",
    url: "https://www.elmenus.com/ar/القاهرة/مطعم-مصطفى-الجزار-q9zod",
    description: "شوف المنيو وقيمنا",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white mb-4">
            تواصل <span className="text-gradient">معانا</span>
          </h1>
          <p className="text-stone-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            احنا جاهزين نخدمك في أي وقت. اتصل بينا أو زورنا في المطعم
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 flex flex-col justify-between"
            >
              <div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${method.color === "primary" ? "bg-primary-600/10 dark:bg-primary-600/20" : "bg-gold-500/10 dark:bg-gold-500/20"
                  }`}>
                  <method.icon className={`w-7 h-7 ${method.color === "primary" ? "text-primary-650 dark:text-primary-400" : "text-gold-650 dark:text-gold-400"
                    }`} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">{method.title}</h3>
                <p className="text-stone-500 dark:text-gray-400 text-sm mb-6">{method.description}</p>
              </div>
              <div className="space-y-3 pt-4 border-t border-stone-200/50 dark:border-white/5">
                {method.items.map((item) => (
                  <div key={item.value} className="flex items-center justify-between gap-2">
                    {item.label && <span className="text-stone-400 dark:text-gray-500 text-sm shrink-0">{item.label}</span>}
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className={`font-semibold text-sm hover:underline break-all text-right ${method.color === "primary" ? "text-primary-650 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300" : "text-gold-650 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300"
                          }`}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-stone-800 dark:text-white font-medium text-sm text-right">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Delivery Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-2 mb-4">
            <Truck className="w-4 h-4 text-gold-600 dark:text-gold-450" />
            <span className="text-gold-800 dark:text-gold-300 text-sm font-medium">أطلب أونلاين (قريبآ)</span>
          </div>
          <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">اطلب من Talabat & Elmenus</h2>
          <p className="text-stone-500 dark:text-gray-400">نوصل لباب بيتك بسرعة وأمان</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
          {deliveryPlatforms.map((platform, index) => (
            <motion.a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 flex items-center gap-4 hover:bg-stone-100/50 dark:hover:bg-white/10 transition-colors group"
            >
              <div className="w-14 h-14 bg-gold-500/10 dark:bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-gold-500/20 dark:group-hover:bg-gold-500/30 transition-colors">
                <ExternalLink className="w-7 h-7 text-gold-600 dark:text-gold-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                  {platform.name}
                </h3>
                <p className="text-stone-500 dark:text-gray-400 text-sm">{platform.description}</p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-2 mb-16"
        >
          <div className="relative h-80 rounded-xl overflow-hidden bg-stone-200 dark:bg-dark-800 flex items-center justify-center transition-colors duration-300">
            <div className="absolute inset-0 bg-[url('/images/storefront.jpg')] bg-cover bg-center opacity-40 dark:opacity-30" />
            <div className="relative z-10 text-center px-4">
              <MapPin className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">موقعنا على الخريطة</h3>
              <p className="text-stone-600 dark:text-gray-450 text-sm mb-4">5 شارع عمر المختار، المطرية، القاهرة</p>
              <a
                href="https://maps.app.goo.gl/D5ENYuQWe8EdeyjS6"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>افتح في خرائط جوجل</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-650 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>الرجوع للرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
