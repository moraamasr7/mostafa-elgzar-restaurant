'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';
import { OrderType, PaymentMethod } from '@/types/orders';
import { supabase } from '@/lib/supabase/client';
import { useCart } from '@/features/cart/context/CartContext';
import { X, Bike, Store, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useScrollLock } from '@/lib/hooks/useScrollLock';
import ProgressSteps from './ProgressSteps';
import CountdownTimer from './CountdownTimer';

interface CheckoutFormProps {
  isOpen: boolean;
  initialOrderType?: OrderType;
  onClose: () => void;
}

export default function CheckoutForm({
  isOpen,
  initialOrderType = 'takeaway',
  onClose,
}: CheckoutFormProps) {
  const router = useRouter();
  const { cart, clearCart, totalPrice } = useCart();

  const [orderType, setOrderType] = useState<OrderType>(initialOrderType);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialOrderType === 'takeaway' ? 'instapay' : 'cash'
  );
  const [paymentReceipt, setPaymentReceipt] = useState('');
  const [receiptPreview, setReceiptPreview] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [notes, setNotes] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('demo-token');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useScrollLock(isOpen);

  const hasEnteredData = Boolean(
    name.trim() ||
    phone.trim() ||
    (orderType === 'delivery' && deliveryAddress.trim()) ||
    paymentReceipt.trim() ||
    notes.trim()
  );

  const handleRequestClose = () => {
    if (isSubmitting) return;
    if (hasEnteredData) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  // Close on Escape key with safety check
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showExitConfirm) {
          setShowExitConfirm(false);
        } else {
          handleRequestClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showExitConfirm, hasEnteredData, isSubmitting]);

  if (!isOpen) return null;

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsUploadingReceipt(true);

    try {
      const fileName = `receipt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;

      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file, {
          contentType: file.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(error.message || 'فشل رفع الصورة على الخادم');
      }

      const { data: publicUrlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(data.path);

      const uploadedUrl = publicUrlData.publicUrl;
      setPaymentReceipt(uploadedUrl);
      setReceiptPreview(uploadedUrl);
    } catch (err: unknown) {
      console.error('Receipt upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'تعذر رفع الصورة';
      setUploadError(errorMessage || 'حصلت مشكلة أثناء رفع صورة الإثبات. يرجى كتابة رقم العملية نصياً.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const validatePhone = (value: string): boolean => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length !== 11) {
      setPhoneError('رقم الموبايل يجب أن يتكون من 11 رقماً');
      return false;
    }
    if (!cleaned.startsWith('01')) {
      setPhoneError('رقم الموبايل يجب أن يبدأ بـ 01');
      return false;
    }
    if (!/^\d+$/.test(cleaned)) {
      setPhoneError('يمنع استخدام الحروف أو الرموز في رقم الموبايل');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (value.length > 0) {
      validatePhone(value);
    } else {
      setPhoneError('');
    }
  };

  const handleOrderTypeChange = (type: OrderType) => {
    setOrderType(type);
    if (type === 'takeaway') {
      setPaymentMethod('instapay');
    } else {
      setPaymentMethod('cash');
    }
  };

  const isAddressValid = orderType !== 'delivery' || deliveryAddress.trim().length >= 5;
  const isReceiptValid =
    orderType !== 'takeaway' && paymentMethod === 'cash'
      ? true
      : paymentReceipt.trim().length >= 3;

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isTurnstileValid = !turnstileSiteKey || turnstileToken.length > 0;

  const isFormValid =
    name.trim().length > 0 &&
    /^01\d{9}$/.test(phone.replace(/\s/g, '')) &&
    isAddressValid &&
    isReceiptValid &&
    isTurnstileValid &&
    !isUploadingReceipt &&
    cart.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) return;
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const orderItemsPayload = cart.map((line) => ({
        variant_id: line.variant_id,
        quantity: line.quantity,
        item_notes: line.item_notes,
      }));

      const payload = {
        customer_name: name.trim(),
        customer_phone: phone.replace(/\s/g, ''),
        notes: notes.trim(),
        order_type: orderType,
        delivery_address: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
        payment_method: paymentMethod,
        payment_receipt_url: paymentReceipt.trim() || undefined,
        items: orderItemsPayload,
        turnstile_token: turnstileToken,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result.error || 'حصلت مشكلة أثناء تسجيل الطلب. يرجى المحاولة مرة أخرى.');
        setIsSubmitting(false);
        return;
      }

      // Success
      clearCart();
      onClose();

      const trackingUrl = result.tracking_token
        ? `/order/${result.order_id}?token=${result.tracking_token}`
        : `/order/${result.order_id}`;

      router.push(trackingUrl);
    } catch {
      setSubmitError('تعذر الاتصال بالخادم. يرجى التأكد من اتصال الإنترنت والمحاولة ثانية.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none dir-rtl animate-fade-in">
      {/* Backdrop - Safe from accidental taps (No auto-close on backdrop touch) */}
      <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-md" />

      {/* Modal Box */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-dark-900 border border-stone-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col animate-slide-up overflow-hidden z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        {/* Exit Confirmation Dialog */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-center">
            <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">هل تريد مغادرة إتمام الطلب؟</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                سيتم الاحتفاظ بأصناف السلة، ولكن ستفقد البيانات التي قمت بإدخالها في هذا النموذج.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs min-h-[44px] flex items-center justify-center active:scale-[0.98]"
                >
                  متابعة الطلب
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    onClose();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs min-h-[44px] flex items-center justify-center active:scale-[0.98]"
                >
                  نعم، مغادرة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pinned Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200 dark:border-white/10 shrink-0">
          <div>
            <h2 id="checkout-modal-title" className="font-bold text-lg sm:text-xl text-stone-900 dark:text-white">
              إتمام طلب الأكل الحرش
            </h2>
            <p className="text-xs text-stone-500 dark:text-gray-400 mt-0.5">
              الإجمالي: <strong className="text-gold-600 dark:text-gold-400">{totalPrice.toFixed(0)} ج.م</strong> ({cart.length} أصناف)
            </p>
          </div>
          <button
            type="button"
            onClick={handleRequestClose}
            disabled={isSubmitting}
            className="w-11 h-11 rounded-full bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors text-sm font-bold disabled:opacity-50 min-w-[44px] min-h-[44px]"
            aria-label="إغلاق نموذج الطلب"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container (Wraps scrollable body and docked footer) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
            <ProgressSteps currentStep={name.trim() && phone.trim() ? 3 : 2} />

            {/* Order Type Toggle */}
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-gray-400 mb-2">
                طريقة الاستلام <span className="text-primary-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOrderTypeChange('delivery')}
                  className={`py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex flex-col items-center justify-center gap-1.5 min-h-[56px] ${
                    orderType === 'delivery'
                      ? 'border-primary-600 bg-primary-600/10 text-primary-650 dark:text-primary-400 shadow-sm'
                      : 'border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-gray-400'
                  }`}
                >
                  <Bike className="w-5 h-5" />
                  <span>توصيل للمنزل (دليفري)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOrderTypeChange('takeaway')}
                  className={`py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex flex-col items-center justify-center gap-1.5 min-h-[56px] ${
                    orderType === 'takeaway'
                      ? 'border-primary-600 bg-primary-600/10 text-primary-650 dark:text-primary-400 shadow-sm'
                      : 'border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-gray-400'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  <span>استلام من الفرع (تيك اواي)</span>
                </button>
              </div>
            </div>

          {/* Delivery Address Field */}
          {orderType === 'delivery' && (
            <div className="space-y-1 animate-fade-in">
              <label className="block text-xs font-bold text-stone-700 dark:text-gray-300">
                عنوان التوصيل بالتفصيل <span className="text-primary-600">*</span>
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="المنطقة، الشارع، رقم العمارة والشقة..."
                required={orderType === 'delivery'}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white rounded-xl focus:outline-none focus:border-primary-500 transition-all text-xs sm:text-sm placeholder:text-stone-400 min-h-[44px]"
              />
              {deliveryAddress.length > 0 && deliveryAddress.trim().length < 5 && (
                <p className="text-red-500 text-[10px] font-bold">العنوان يجب أن لا يقل عن 5 حروف</p>
              )}
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-gray-300 mb-1.5">
              طريقة الدفع <span className="text-primary-600">*</span>
            </label>

            {orderType === 'delivery' ? (
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center ${
                    paymentMethod === 'cash'
                      ? 'border-gold-500 bg-gold-500/15 text-gold-700 dark:text-gold-400 shadow-xs'
                      : 'border-stone-200 dark:border-white/10 text-stone-600 dark:text-gray-400'
                  }`}
                >
                  💵 كاش عند الاستلام
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('instapay')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center ${
                    paymentMethod === 'instapay'
                      ? 'border-purple-500 bg-purple-500/15 text-purple-700 dark:text-purple-400 shadow-xs'
                      : 'border-stone-200 dark:border-white/10 text-stone-600 dark:text-gray-400'
                  }`}
                >
                  ⚡ إنستا باي
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center ${
                    paymentMethod === 'wallet'
                      ? 'border-red-500 bg-red-500/15 text-red-700 dark:text-red-400 shadow-xs'
                      : 'border-stone-200 dark:border-white/10 text-stone-600 dark:text-gray-400'
                  }`}
                >
                  📱 فودافون كاش
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('instapay')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center ${
                    paymentMethod === 'instapay'
                      ? 'border-purple-500 bg-purple-500/15 text-purple-700 dark:text-purple-400 shadow-xs'
                      : 'border-stone-200 dark:border-white/10 text-stone-600 dark:text-gray-400'
                  }`}
                >
                  ⚡ إنستا باي (تحويل مسبق)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center ${
                    paymentMethod === 'wallet'
                      ? 'border-red-500 bg-red-500/15 text-red-700 dark:text-red-400 shadow-xs'
                      : 'border-stone-200 dark:border-white/10 text-stone-600 dark:text-gray-400'
                  }`}
                >
                  📱 فودافون كاش (تحويل مسبق)
                </button>
              </div>
            )}
          </div>

          {/* Payment Proof for Takeaway or Digital Payment */}
          {(orderType === 'takeaway' || paymentMethod !== 'cash') && (
            <div className="p-3.5 bg-gold-500/10 border border-gold-500/25 rounded-2xl space-y-2.5 animate-fade-in text-right">
              <CountdownTimer initialMinutes={10} />

              <div className="text-xs text-stone-800 dark:text-gold-200 space-y-1">
                {orderType === 'takeaway' ? (
                  <p className="font-bold text-red-600 dark:text-red-400">
                    ⚠️ لضمان تحضير طلب الاستلام من الفرع طازجاً، يلزم تحويل المبلغ كاملاً وإرفاق صورة الإشعار أو رقم العملية.
                  </p>
                ) : (
                  <p className="font-bold">يرجى تحويل المبلغ كاملاً لتأكيد التجهيز السريع.</p>
                )}
                <p className="text-[11px] text-stone-600 dark:text-gray-300">
                  • إنستاباي / فودافون كاش: <strong className="font-mono text-stone-900 dark:text-white" dir="ltr">01122339739</strong>
                </p>
              </div>

              {/* Upload image or write reference */}
              <div className="space-y-2 pt-1 border-t border-gold-500/20">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptFileChange}
                  disabled={isSubmitting || isUploadingReceipt}
                  className="hidden"
                  id="receipt-upload-input"
                />
                <label
                  htmlFor="receipt-upload-input"
                  className={`w-full py-2.5 px-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-bold min-h-[44px] ${
                    isUploadingReceipt
                      ? 'border-gold-500 bg-gold-500/10 text-gold-600'
                      : receiptPreview
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                      : 'border-stone-300 dark:border-white/20 text-stone-600 dark:text-gray-300 hover:border-primary-500'
                  }`}
                >
                  {isUploadingReceipt ? (
                    <span>جاري رفع صورة الإيصال...</span>
                  ) : receiptPreview ? (
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم رفع إثبات التحويل بنجاح (انقر للتغيير)</span>
                    </span>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>اضغط لرفع صورة إشعار التحويل</span>
                    </>
                  )}
                </label>

                {uploadError && <p className="text-red-500 text-[10px] font-bold">{uploadError}</p>}

                <input
                  type="text"
                  value={paymentReceipt}
                  onChange={(e) => setPaymentReceipt(e.target.value)}
                  placeholder="أو أدخل رقم العملية / كود التحويل نصياً..."
                  required={orderType === 'takeaway' || paymentMethod !== 'cash'}
                  disabled={isSubmitting || isUploadingReceipt}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-primary-500 min-h-[44px]"
                />
              </div>
            </div>
          )}

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700 dark:text-gray-300">
              الاسم الكريم <span className="text-primary-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسمك الكريم..."
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white rounded-xl focus:outline-none focus:border-primary-500 transition-all text-xs sm:text-sm placeholder:text-stone-400 min-h-[44px]"
            />
          </div>

          {/* Customer Phone */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700 dark:text-gray-300">
              رقم الموبايل <span className="text-primary-600">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="01xxxxxxxxx"
              required
              disabled={isSubmitting}
              dir="ltr"
              className={`w-full px-4 py-2.5 bg-stone-50 dark:bg-white/5 border rounded-xl focus:outline-none transition-all text-xs sm:text-sm text-left min-h-[44px] ${
                phoneError
                  ? 'border-red-500'
                  : 'border-stone-200 dark:border-white/10 focus:border-primary-500'
              }`}
            />
            {phoneError && <p className="text-red-500 text-[10px] font-bold">{phoneError}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-500 dark:text-gray-400">
              ملاحظات على الطلب <span className="text-[10px] font-normal">(اختياري)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي تعليمات خاصة بالتحضير أو التوصيل..."
              rows={2}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white rounded-xl focus:outline-none focus:border-primary-500 transition-all text-xs resize-none placeholder:text-stone-400 min-h-[60px]"
            />
          </div>

          {/* Turnstile Captcha - Responsive Container (no overflow on 320px) */}
          {turnstileSiteKey && (
            <div className="w-full flex justify-center py-1 overflow-x-auto max-w-full">
              <Turnstile
                siteKey={turnstileSiteKey}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken('')}
                onExpire={() => setTurnstileToken('')}
                options={{ theme: 'auto', language: 'ar' }}
              />
            </div>
          )}
        </div>

        {/* Pinned Docked Modal Footer (Checkout Focus Mode) */}
        <div
          className="p-4 sm:p-5 border-t border-stone-200 dark:border-white/10 bg-stone-50/90 dark:bg-dark-950/90 backdrop-blur-md space-y-2.5 shrink-0"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0.75rem))' }}
        >
          {/* Submit Error Banner */}
          {submitError && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold text-center">
              {submitError}
            </div>
          )}

          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-stone-500 dark:text-gray-400 font-bold">المبلغ المطلوب:</span>
            <span className="font-black text-lg text-stone-900 dark:text-white tabular-nums">
              {totalPrice.toFixed(0)} <small className="text-xs font-bold text-gold-600 dark:text-gold-400">ج.م</small>
            </span>
          </div>

          {/* Primary Confirm Order Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full btn-primary py-3.5 rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[50px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري تسجيل وإرسال طلبك...</span>
              </span>
            ) : (
              <span>
                تأكيد طلب {orderType === 'delivery' ? 'الدليفري 🛵' : 'الاستلام من الفرع 🏪'} · {totalPrice.toFixed(0)} ج
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}
