"use client";

import { motion } from "framer-motion";
import { Award, Heart, Users, TrendingUp, Star, MapPin } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const stats = [
  { icon: Users, value: "+500", label: "عميل لدينا" },
  { icon: Star, value: "30+", label: "صنف في المنيو" },
  { icon: Heart, value: "100%", label: "لحوم بلدي" },
  { icon: TrendingUp, value: "5+", label: "سنين خبرة" },

];

const values = [
  {
    icon: Heart,
    title: "جودة فوق كل شيء",
    description: "نختار أجود أنواع اللحوم والأحشاء البلدي الطازجة يومياً عشان نقدملك أحسن تجربة",
  },
  {
    icon: Award,
    title: "أصالة مصرية",
    description: "كل صنف في المنيو يحمل طعم الأصالة المصرية الأصيلة اللي مالهاش مثيل",
  },
  {
    icon: Users,
    title: "خدمة عملاء ممتازة",
    description: "فريقنا جاهز يخدمك بأسرع وقت وأحسن طريقة، رضاكم هو هدفنا الأول",
  },
];

export default function AboutPage() {
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
            عن <span className="text-gradient">مطعم مصطفى الجزار</span>
          </h1>
          <p className="text-stone-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            قصة نجاح بدأت من حب الأكل البلدي المصري الأصيل
          </p>
        </motion.div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white">قصتنا</h2>
            <div className="space-y-4 text-stone-600 dark:text-gray-400 leading-relaxed">
              <p>
                مطعم مصطفى الجزار مش مجرد مطعم، هو تجربة أصيلة للأكل البلدي المصري.
                بدأنا رحلتنا من قلب المطرية عشان نوصل لكل بيت مصرى أشهى الأكلات البلدي.
              </p>
              <p>
                بنفتخر إننا بنستخدم أجود أنواع اللحوم والأحشاء البلدي الطازجة،
                وكل صنف بنقدمه بيحمل في طياته تاريخ وسنين من الخبرة في الطبخ المصري الأصيل.
              </p>
              <p>
                من الكبدة والكفتة للسجق والممبار، ومن الطواجن الفخارية للحمة البلدي المحمرة باللية،
                كل صنف في المنيو هو قطعة من التراث المصري.
              </p>
            </div>
            <div className="flex items-center gap-2 text-gold-600 dark:text-gold-450 font-medium">
              <MapPin className="w-5 h-5 text-primary-500" />
              <span>5 شارع عمر المختار، المطرية، القاهرة</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8"
          >
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-4"
                >
                  <div className="w-12 h-12 bg-primary-600/10 dark:bg-primary-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-primary-650 dark:text-primary-400" />
                  </div>
                  <div className="text-2xl font-bold text-stone-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-stone-500 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">قيمنا</h2>
          <p className="text-stone-500 dark:text-gray-400">اللي بنمشي عليه في كل يوم</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 text-center hover-lift"
            >
              <div className="w-16 h-16 bg-primary-600/10 dark:bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <value.icon className="w-8 h-8 text-primary-650 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">{value.title}</h3>
              <p className="text-stone-500 dark:text-gray-400 text-sm leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>

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
