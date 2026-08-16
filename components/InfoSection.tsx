"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Truck, Award, ChefHat, ShoppingBag } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { useOrderModal } from "@/components/OrderModalContext";

const features = [
  {
    icon: ChefHat,
    title: "أكل بلدي أصيل",
    description: "نستخدم أجود أنواع اللحوم والأحشاء البلدي الطازجة يومياً",
  },
  {
    icon: Truck,
    title: "خدمة توصيل",
    description: "نوصل لباب بيتك عبر طلب أونلاين أو تطبيق طلبات (Talabat) بسرعة وأمان",
  },
  {
    icon: Award,
    title: "جودة مضمونة",
    description: "أكثر من 30 صنف بلدي بأعلى معايير الجودة والنظافة",
  },
];

export default function InfoSection() {
  const { openOrderModal } = useOrderModal();

  return (
    <section className="py-24 bg-stone-50 dark:bg-dark-900/30 relative transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.03),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.05),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4 mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white">
                ليه تختار <span className="text-gradient">{siteConfig.name}؟</span>
              </h2>
              <p className="text-stone-600 dark:text-gray-400 text-lg leading-relaxed">
                احنا مش مجرد مطعم، احنا تجربة أصيلة للأكل البلدي المصري.
                كل صنف بنقدمه بيحمل في طياته تاريخ وسنين من الخبرة.
              </p>
            </div>

            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 flex items-start gap-4 hover:bg-stone-50/50 dark:hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 bg-primary-600/10 dark:bg-primary-600/20 rounded-xl flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-primary-650 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">{feature.title}</h3>
                  <p className="text-stone-500 dark:text-gray-400 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="glass-card p-8 space-y-6">
              <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-6 border-b border-stone-200 dark:border-white/5 pb-4">معلومات التواصل</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-600/10 dark:bg-primary-600/20 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary-650 dark:text-primary-400" />
                  </div>
                  <div>
                    <h4 className="text-stone-900 dark:text-white font-semibold mb-1">العنوان</h4>
                    <p className="text-stone-600 dark:text-gray-400 text-sm leading-relaxed">
                      {siteConfig.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold-500/10 dark:bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-gold-600 dark:text-gold-450" />
                  </div>
                  <div>
                    <h4 className="text-stone-900 dark:text-white font-semibold mb-1">أرقام التليفون</h4>
                    <div className="space-y-1">
                      <a href={siteConfig.telUrl} className="block text-stone-600 dark:text-gray-400 text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-right" dir="ltr">
                        {siteConfig.phone}
                      </a>
                      <a href={siteConfig.telUrlSecondary} className="block text-stone-600 dark:text-gray-400 text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-right" dir="ltr">
                        {siteConfig.phoneSecondary}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-600/10 dark:bg-primary-600/20 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-primary-650 dark:text-primary-400" />
                  </div>
                  <div>
                    <h4 className="text-stone-900 dark:text-white font-semibold mb-1">مواعيد العمل</h4>
                    <p className="text-stone-600 dark:text-gray-400 text-sm font-medium">
                      نعمل يومياً {siteConfig.workingHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Buttons */}
              <div className="pt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => openOrderModal()}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>طلب أونلاين (استلام / توصيل)</span>
                </button>
                <a
                  href={siteConfig.talabatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold w-full flex items-center justify-center gap-2 text-center"
                >
                  <Truck className="w-5 h-5" />
                  <span>اطلب عبر طلبات</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
