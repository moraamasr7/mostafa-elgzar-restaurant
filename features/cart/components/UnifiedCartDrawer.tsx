'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';
import { OrderType, PaymentMethod } from '@/types/orders';
import { supabase } from '@/lib/supabase/client';
import { useCart } from '../context/CartContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Bike,
  Store,
  Upload,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Phone,
  User,
  Check,
  FileText,
  Navigation,
} from 'lucide-react';
import { useScrollLock } from '@/lib/hooks/useScrollLock';
import CountdownTimer from '@/features/orders/components/CountdownTimer';

const CUSTOMER_DRAFT_KEY = 'elgzar_customer_draft';

interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  distance_km?: number;
}

const DEFAULT_DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'matariya-station', name: 'المطرية - المحطة والميدان الرئيسي', fee: 15, distance_km: 1.5 },
  { id: 'matariya-trolley', name: 'المطرية - شارع التروللي والبلسم', fee: 15, distance_km: 2 },
  { id: 'matariya-naaam', name: 'المطرية - مساكن النعام وميدان النعام', fee: 15, distance_km: 2.8 },
  { id: 'matariya-shagaret-maryam', name: 'المطرية - مزار شجرة مريم ومسلة سيزوستريس', fee: 15, distance_km: 2.2 },
  { id: 'matariya-arbaeen', name: 'المطرية - الأربعين ومصر والسودان', fee: 20, distance_km: 3.2 },
  { id: 'matariya-cables', name: 'المطرية - شارع الكابلات والترعة التوفيقية', fee: 20, distance_km: 3 },
  { id: 'helmeyat-elzaytoun', name: 'حلمية الزيتون وشارع ابن الحكم', fee: 25, distance_km: 3.8 },
  { id: 'ain-shams-gharbiya', name: 'عين شمس الغربية ومحطة عين شمس', fee: 25, distance_km: 4 },
];

function cleanEgyptianPhone(input: string): string {
  return input
    .replace(/[\s\-_]/g, '')
    .replace(/^(\+20|20)/, '0');
}

export default function UnifiedCartDrawer() {
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    closeCart,
    isCheckoutOpen,
    closeCheckout,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalCount,
    totalPrice,
  } = useCart();

  const isDrawerOpen = isCartOpen || isCheckoutOpen;
  useScrollLock(isDrawerOpen);

  // Step 1: Cart Items | Step 2: Fulfillment & Customer Data | Step 3: Payment & Order Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Customer & Checkout Form State
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDetailedDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentReceipt, setPaymentReceipt] = useState('');
  const [receiptPreview, setReceiptPreview] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [notes, setNotes] = useState('');

  // Geolocation & Delivery Zones State
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(DEFAULT_DELIVERY_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [customerLat, setCustomerLat] = useState<number | null>(null);
  const [customerLng, setCustomerLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSuccess, setLocationSuccess] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Turnstile
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const [turnstileToken, setTurnstileToken] = useState(turnstileSiteKey ? '' : 'demo-token');
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [turnstileWidgetKey, setTurnstileWidgetKey] = useState(0);

  // Submission & Validation UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Fetch Delivery Zones from Supabase Source of Truth
  useEffect(() => {
    let isMounted = true;
    async function loadDeliveryZones() {
      try {
        const { data, error } = await supabase
          .from('restaurant_policies')
          .select('value')
          .eq('key', 'delivery_zones')
          .single();

        if (isMounted && data?.value && !error && Array.isArray(data.value)) {
          setDeliveryZones(data.value as DeliveryZone[]);
        }
      } catch (err) {
        console.warn('Failed to load delivery zones from Supabase:', err);
      }
    }
    loadDeliveryZones();
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize step if opened directly from checkout trigger
  useEffect(() => {
    if (isCheckoutOpen) {
      setCurrentStep(2);
    }
  }, [isCheckoutOpen]);

  // Restore Customer Draft safely from LocalStorage
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(CUSTOMER_DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          if (parsed.name) setName(parsed.name);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.deliveryAddress) setDetailedDeliveryAddress(parsed.deliveryAddress);
          if (parsed.orderType) setOrderType(parsed.orderType);
          if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
          if (parsed.selectedZoneId) setSelectedZoneId(parsed.selectedZoneId);
        }
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  // Save Customer Draft on changes (Zero Data Loss)
  useEffect(() => {
    try {
      const draftData = {
        name,
        phone,
        deliveryAddress,
        orderType,
        paymentMethod,
        selectedZoneId,
      };
      localStorage.setItem(CUSTOMER_DRAFT_KEY, JSON.stringify(draftData));
    } catch {
      // Ignore storage write error
    }
  }, [name, phone, deliveryAddress, orderType, paymentMethod, selectedZoneId]);

  const handleClose = () => {
    if (isSubmitting) return;
    if (currentStep > 1 && (name.trim() || phone.trim() || deliveryAddress.trim())) {
      setShowExitConfirm(true);
    } else {
      closeCart();
      closeCheckout();
      setCurrentStep(1);
    }
  };

  const handleForceClose = () => {
    setShowExitConfirm(false);
    closeCart();
    closeCheckout();
    setCurrentStep(1);
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        if (showExitConfirm) {
          setShowExitConfirm(false);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, showExitConfirm]);

  const handleGetLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك. يرجى اختيار منطقتك من القائمة أدناه.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerLat(position.coords.latitude);
        setCustomerLng(position.coords.longitude);
        setLocationSuccess(true);
        setIsLocating(false);
        setLocationError(null);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        setLocationSuccess(false);
        if (err.code === 1) {
          setLocationError('تم رفض إذن الوصول للموقع. يمكنك اختيار منطقتك بالمطرية من القائمة أدناه.');
        } else if (err.code === 3) {
          setLocationError('استغرق تحديد الموقع وقتاً طويلاً. يرجى اختيار منطقتك من القائمة أدناه.');
        } else {
          setLocationError('تعذر تحديد الموقع تلقائياً. يرجى اختيار منطقتك من القائمة أدناه.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  if (!isDrawerOpen) return null;

  // Validation Helpers
  const cleanedPhone = cleanEgyptianPhone(phone);
  const isPhoneValid = /^01[0125][0-9]{8}$/.test(cleanedPhone);
  const isNameValid = name.trim().length >= 2;
  const isLocationProvided = locationSuccess || Boolean(selectedZoneId);
  const isAddressValid = orderType === 'takeaway' || (isLocationProvided && deliveryAddress.trim().length >= 5);

  const isReceiptRequired = orderType === 'takeaway' || paymentMethod !== 'cash';
  const isReceiptValid = !isReceiptRequired || paymentReceipt.trim().length >= 3;
  const isTurnstileValid = !turnstileSiteKey || turnstileToken.length > 0;

  const isStep2Valid = isNameValid && isPhoneValid && isAddressValid;
  const isStep3Valid = isReceiptValid && isTurnstileValid && !isUploadingReceipt && cart.length > 0;

  const selectedZoneObj = deliveryZones.find((z) => z.id === selectedZoneId);

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    // B1: Strict Client-Side File Validation
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      setUploadError('نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPG أو PNG أو WebP فقط.');
      return;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت.');
      return;
    }

    setIsUploadingReceipt(true);

    try {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const fileName = `receipt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file, {
          contentType: file.type,
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
      setUploadError(errorMessage || 'حصلت مشكلة أثناء رفع الصورة. يمكنك كتابة رقم التحويل نصياً.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleFulfillmentChange = (type: OrderType) => {
    setOrderType(type);
    if (type === 'takeaway') {
      setPaymentMethod('instapay');
    } else {
      setPaymentMethod('cash');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep2Valid || !isStep3Valid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const orderItemsPayload = cart.map((line) => ({
        variant_id: line.variant_id,
        quantity: line.quantity,
        item_notes: line.item_notes,
      }));

      const zonePrefix = selectedZoneObj ? `[منطقة: ${selectedZoneObj.name}] ` : '';
      const formattedAddress =
        orderType === 'delivery'
          ? `${zonePrefix}${deliveryAddress.trim()}`
          : undefined;

      const payload = {
        customer_name: name.trim(),
        customer_phone: cleanedPhone,
        notes: notes.trim() || undefined,
        order_type: orderType,
        delivery_address: formattedAddress,
        payment_method: paymentMethod,
        payment_receipt_url: paymentReceipt.trim() || undefined,
        customer_lat: customerLat !== null ? customerLat : undefined,
        customer_lng: customerLng !== null ? customerLng : undefined,
        delivery_zone_id: selectedZoneId || undefined,
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

      // Success: Save active order locally so customer never loses access to tracking
      try {
        localStorage.setItem(
          'elgzar_active_order',
          JSON.stringify({
            order_id: result.order_id,
            order_number: result.order_number,
            tracking_token: result.tracking_token || null,
            total_amount: result.total_amount || totalPrice,
            created_at: new Date().toISOString(),
          })
        );
      } catch (err) {
        console.warn('Failed to save active order to localStorage', err);
      }

      // Clear cart and clean draft
      clearCart();
      closeCart();
      closeCheckout();

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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/85 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Unified Drawer Modal Box */}
      <div
        className="relative w-full max-w-lg bg-stone-900 border border-stone-800 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col animate-slide-up overflow-hidden z-10 text-stone-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Exit Confirmation Dialog */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-center">
            <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">هل تريد إغلاق نافذة الطلب؟</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                سيتم الاحتفاظ بأصناف السلة وبياناتك كمسودة، ويمكنك العودة لإكمال الطلب في أي وقت.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs min-h-[44px] flex items-center justify-center cursor-pointer"
                >
                  متابعة الطلب
                </button>
                <button
                  type="button"
                  onClick={handleForceClose}
                  className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs min-h-[44px] flex items-center justify-center cursor-pointer"
                >
                  نعم، إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 shrink-0 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 text-primary-400 border border-primary-500/30 flex items-center justify-center">
              {currentStep === 1 ? (
                <ShoppingBag className="w-5 h-5" />
              ) : currentStep === 2 ? (
                <User className="w-5 h-5" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 id="drawer-title" className="font-bold text-lg text-white">
                {currentStep === 1
                  ? 'سلة الطلب'
                  : currentStep === 2
                  ? 'بيانات الاستلام والتوصيل'
                  : 'الدفع وتأكيد الطلب'}
              </h2>
              <span className="text-xs text-stone-400">
                {totalCount} أصناف · {totalPrice.toFixed(0)} ج.م
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-10 h-10 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors min-w-[40px] min-h-[40px] cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        {cart.length > 0 && (
          <div className="grid grid-cols-3 gap-1 px-4 sm:px-5 py-2.5 bg-stone-950/40 border-b border-stone-800/60 text-[11px] font-bold text-center">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                currentStep === 1
                  ? 'bg-primary-600/30 text-primary-400 border border-primary-500/30'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>1. السلة</span>
              {currentStep > 1 && <Check className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => {
                if (cart.length > 0) setCurrentStep(2);
              }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                currentStep === 2
                  ? 'bg-primary-600/30 text-primary-400 border border-primary-500/30'
                  : currentStep > 2
                  ? 'text-stone-300'
                  : 'text-stone-500'
              }`}
            >
              <span>2. البيانات</span>
              {currentStep > 2 && <Check className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => {
                if (isStep2Valid) setCurrentStep(3);
              }}
              disabled={!isStep2Valid}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                currentStep === 3
                  ? 'bg-primary-600/30 text-primary-400 border border-primary-500/30'
                  : isStep2Valid
                  ? 'text-stone-400 hover:text-white cursor-pointer'
                  : 'text-stone-600 cursor-not-allowed'
              }`}
            >
              <span>3. التأكيد</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
          {/* STEP 1: CART ITEMS LIST */}
          {currentStep === 1 && (
            <div className="space-y-3 animate-fade-in">
              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-stone-800/80 flex items-center justify-center mx-auto text-stone-500">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-white text-base">السلة فارغة حالياً</h3>
                  <p className="text-stone-400 text-xs max-w-xs mx-auto">
                    تصفح قائمة الطعام واختر وجباتك المفضلة لبدء طلب الأكل الحرش
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-primary text-xs px-5 py-2.5 mt-2 cursor-pointer"
                  >
                    تصفح قائمة الطعام
                  </button>
                </div>
              ) : (
                cart.map((line) => (
                  <div
                    key={line.variant_id}
                    className="bg-stone-800/60 border border-stone-750 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0 text-right">
                      <h4 className="font-bold text-white text-sm truncate">{line.item_name}</h4>
                      {line.variant_name && line.variant_name !== 'افتراضي' && (
                        <span className="inline-block text-[11px] font-semibold text-gold-400 mt-0.5">
                          الحجم: {line.variant_name}
                        </span>
                      )}
                      {line.item_notes && (
                        <p className="text-xs text-stone-400 mt-0.5 truncate">
                          📝 {line.item_notes}
                        </p>
                      )}
                      <p className="text-white font-black text-sm mt-1 tabular-nums">
                        {(line.price * line.quantity).toFixed(0)}{' '}
                        <small className="text-xs font-bold text-gold-400">ج.م</small>
                      </p>
                    </div>

                    {/* Stepper & Remove */}
                    <div className="flex items-center gap-0 border border-stone-700 bg-stone-900 rounded-xl overflow-hidden shadow-xs shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (line.quantity <= 1) {
                            removeFromCart(line.variant_id);
                          } else {
                            updateQuantity(line.variant_id, line.quantity - 1);
                          }
                        }}
                        className="w-10 h-10 flex items-center justify-center text-stone-400 hover:bg-red-500/10 hover:text-red-400 transition-colors min-w-[40px] min-h-[40px] cursor-pointer"
                        aria-label={line.quantity <= 1 ? 'حذف الصنف' : 'تقليل الكمية'}
                      >
                        {line.quantity <= 1 ? (
                          <Trash2 className="w-4 h-4 text-red-400" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                      </button>
                      <span className="px-2 text-xs font-black text-white min-w-[1.75rem] text-center tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.variant_id, line.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-stone-400 hover:bg-primary-600/20 hover:text-primary-400 transition-colors min-w-[40px] min-h-[40px] cursor-pointer"
                        aria-label="زيادة الكمية"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* STEP 2: FULFILLMENT & CUSTOMER DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in text-right">
              {/* Fulfillment Method Toggle */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-2">
                  طريقة استلام الطلب <span className="text-primary-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleFulfillmentChange('delivery')}
                    className={`py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex flex-col items-center justify-center gap-1.5 min-h-[54px] cursor-pointer ${
                      orderType === 'delivery'
                        ? 'border-primary-500 bg-primary-600/20 text-white shadow-sm ring-1 ring-primary-500/40'
                        : 'border-stone-800 bg-stone-800/50 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Bike className="w-5 h-5 text-primary-400" />
                    <span>توصيل للمنزل (دليفري)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFulfillmentChange('takeaway')}
                    className={`py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex flex-col items-center justify-center gap-1.5 min-h-[54px] cursor-pointer ${
                      orderType === 'takeaway'
                        ? 'border-primary-500 bg-primary-600/20 text-white shadow-sm ring-1 ring-primary-500/40'
                        : 'border-stone-800 bg-stone-800/50 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Store className="w-5 h-5 text-gold-400" />
                    <span>استلام من الفرع (تيك اواي)</span>
                  </button>
                </div>
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-300">
                  الاسم الكريم <span className="text-primary-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اكتب اسمك الكريم..."
                    className={`w-full px-4 py-2.5 bg-stone-950 border rounded-xl text-base sm:text-sm text-white placeholder:text-stone-500 focus:outline-none transition-all min-h-[44px] ${
                      name.trim().length >= 2
                        ? 'border-emerald-500/50'
                        : 'border-stone-800 focus:border-primary-500'
                    }`}
                  />
                  {name.trim().length >= 2 && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>

              {/* Egyptian Phone */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-300">
                    رقم الموبايل (11 رقم) <span className="text-primary-500">*</span>
                  </label>
                  {isPhoneValid && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>رقم مصري صحيح</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    className={`w-full px-4 py-2.5 bg-stone-950 border rounded-xl text-base sm:text-sm text-left transition-all min-h-[44px] font-mono ${
                      isPhoneValid
                        ? 'border-emerald-500/60 text-emerald-400'
                        : phone.length > 0 && !isPhoneValid
                        ? 'border-red-500/60 text-red-400'
                        : 'border-stone-800 text-white focus:border-primary-500'
                    }`}
                  />
                </div>
                {phone.length > 0 && !isPhoneValid && (
                  <p className="text-[10px] text-red-400 font-bold">
                    يرجى إدخال رقم موبايل مصري يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقماً
                  </p>
                )}
              </div>

              {/* DELIVERY GEOLOCATION & ADDRESS SECTION */}
              {orderType === 'delivery' && (
                <div className="space-y-3 pt-1 animate-fade-in text-right">
                  {/* Location Selector (GPS / Zone) */}
                  <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary-400" />
                        <span>تحديد موقع التوصيل <span className="text-primary-500">*</span></span>
                      </span>
                      {isLocationProvided && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>تم تحديد الموقع</span>
                        </span>
                      )}
                    </div>

                    {/* GPS Button */}
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                        locationSuccess
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                          : 'bg-primary-600/20 hover:bg-primary-600/30 border border-primary-500/30 text-primary-300'
                      }`}
                    >
                      {isLocating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-primary-400" />
                          <span>جاري تحديد موقعك الحالي عبر GPS...</span>
                        </>
                      ) : locationSuccess && customerLat && customerLng ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>تم تحديد موقعك بدقة بنجاح ✓ (اضغط لإعادة التحديد)</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4 text-primary-400" />
                          <span>📍 تحديد موقعي الحالي تلقائياً (GPS)</span>
                        </>
                      )}
                    </button>

                    {/* Location Error Banner */}
                    {locationError && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{locationError}</span>
                      </div>
                    )}

                    {/* Fallback / Approved Matariya Zones Selector */}
                    <div className="space-y-1.5 pt-1 border-t border-stone-800">
                      <label className="block text-[11px] font-bold text-stone-400">
                        أو اختر منطقتك بالمطرية وضواحيها:
                      </label>
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-primary-500 min-h-[42px]"
                      >
                        <option value="">-- اختر المنطقة من القائمة المعتمدة --</option>
                        {deliveryZones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} (توصيل: {zone.fee} ج.م)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Detailed Delivery Address */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-stone-300">
                        العنوان بالتفصيل (الشارع، العمارة، الدور، الشقة) <span className="text-primary-500">*</span>
                      </label>
                      {deliveryAddress.trim().length >= 5 && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>مكتمل</span>
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDetailedDeliveryAddress(e.target.value)}
                      placeholder="اسم الشارع، رقم العقار، الدور، رقم الشقة، علامة مميزة بجوارك..."
                      className={`w-full px-4 py-2 bg-stone-950 border rounded-xl text-base sm:text-xs text-white placeholder:text-stone-500 focus:outline-none transition-all resize-none min-h-[64px] ${
                        deliveryAddress.trim().length >= 5
                          ? 'border-emerald-500/50'
                          : 'border-stone-800 focus:border-primary-500'
                      }`}
                    />
                    {deliveryAddress.length > 0 && deliveryAddress.trim().length < 5 && (
                      <p className="text-[10px] text-red-400 font-bold">
                        العنوان يجب أن لا يقل عن 5 حروف لضمان وصول المندوب بدقة
                      </p>
                    )}
                    {!isLocationProvided && (
                      <p className="text-[10px] text-amber-400 font-bold">
                        ⚠️ يلزم تحديد موقع GPS أو اختيار منطقتك من القائمة أعلاه
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PAYMENT & FINAL ORDER REVIEW */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in text-right">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-2">
                  طريقة الدفع <span className="text-primary-500">*</span>
                </label>

                {orderType === 'delivery' ? (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center cursor-pointer ${
                        paymentMethod === 'cash'
                          ? 'border-gold-500 bg-gold-500/15 text-gold-400 ring-1 ring-gold-500/40'
                          : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      💵 كاش عند الاستلام
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('instapay')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center cursor-pointer ${
                        paymentMethod === 'instapay'
                          ? 'border-primary-500 bg-primary-600/20 text-primary-400 ring-1 ring-primary-500/40'
                          : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      ⚡ إنستا باي
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center cursor-pointer ${
                        paymentMethod === 'wallet'
                          ? 'border-red-500 bg-red-500/15 text-red-400 ring-1 ring-red-500/40'
                          : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      📱 محفظة إلكترونية
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('instapay')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center cursor-pointer ${
                        paymentMethod === 'instapay'
                          ? 'border-primary-500 bg-primary-600/20 text-primary-400 ring-1 ring-primary-500/40'
                          : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      ⚡ إنستا باي (مسبق)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center cursor-pointer ${
                        paymentMethod === 'wallet'
                          ? 'border-red-500 bg-red-500/15 text-red-400 ring-1 ring-red-500/40'
                          : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      📱 فودافون كاش (مسبق)
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Proof / Countdown for Advance Payment */}
              {(orderType === 'takeaway' || paymentMethod !== 'cash') && (
                <div className="p-3.5 bg-gold-500/10 border border-gold-500/25 rounded-2xl space-y-2.5 animate-fade-in text-right">
                  <CountdownTimer initialMinutes={10} />

                  <div className="text-xs text-gold-200 space-y-1">
                    <p className="font-bold">
                      {orderType === 'takeaway'
                        ? '⚠️ لضمان تجهيز طلب الاستلام طازجاً، يلزم تحويل المبلغ وإرفاق رقم العملية أو صورة الإشعار:'
                        : 'يرجى تحويل إجمالي الطلب لتأكيد التجهيز الفوري:'}
                    </p>
                    <p className="text-[11px] text-stone-300">
                      • إنستاباي: <strong className="font-mono text-white" dir="ltr">elgzar@instapay</strong>
                    </p>
                    <p className="text-[11px] text-stone-300">
                      • محفظة كاش (فودافون/أورانج/اتصالات/وي): <strong className="font-mono text-white" dir="ltr">01026131499</strong>
                    </p>
                  </div>

                  {/* Upload receipt or write reference */}
                  <div className="space-y-2 pt-1 border-t border-gold-500/20">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleReceiptFileChange}
                      disabled={isSubmitting || isUploadingReceipt}
                      className="hidden"
                      id="drawer-receipt-upload"
                    />
                    <label
                      htmlFor="drawer-receipt-upload"
                      className={`w-full py-2.5 px-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-bold min-h-[44px] ${
                        isUploadingReceipt
                          ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                          : receiptPreview
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-stone-700 text-stone-300 hover:border-primary-500'
                      }`}
                    >
                      {isUploadingReceipt ? (
                        <span>جاري رفع صورة الإيصال...</span>
                      ) : receiptPreview ? (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تم رفع إثبات التحويل بنجاح ✓</span>
                        </span>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>اضغط لرفع صورة إشعار التحويل</span>
                        </>
                      )}
                    </label>

                    {uploadError && (
                      <p className="text-red-400 text-[10px] font-bold">{uploadError}</p>
                    )}

                    <input
                      type="text"
                      value={paymentReceipt}
                      onChange={(e) => setPaymentReceipt(e.target.value)}
                      placeholder="أو اكتب رقم العملية / كود التحويل نصياً..."
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-base sm:text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-primary-500 min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              {/* Order Level Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-400">
                  ملاحظات عامة على الطلب <span className="text-stone-500 font-normal">(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي تعليمات خاصة بالتحضير..."
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-base sm:text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-primary-500 min-h-[44px]"
                />
              </div>

              {/* Order Review Summary Card */}
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
                <h4 className="font-bold text-gold-400 flex items-center gap-1.5 border-b border-stone-800 pb-1.5">
                  <FileText className="w-4 h-4" />
                  <span>ملخص الطلب</span>
                </h4>
                <div className="space-y-1 text-stone-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-stone-400">الاسم والموبايل:</span>
                    <span className="font-bold text-white">
                      {name} ({cleanedPhone})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">طريقة الاستلام:</span>
                    <span className="font-bold text-white">
                      {orderType === 'delivery' ? '🛵 دليفري' : '🏪 استلام من الفرع'}
                    </span>
                  </div>
                  {orderType === 'delivery' && (
                    <>
                      {selectedZoneObj && (
                        <div className="flex justify-between">
                          <span className="text-stone-400">المنطقة:</span>
                          <span className="font-bold text-white">{selectedZoneObj.name}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-stone-400">العنوان:</span>
                        <span className="font-bold text-white truncate max-w-[200px]">
                          {deliveryAddress}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-400">طريقة الدفع:</span>
                    <span className="font-bold text-white">
                      {paymentMethod === 'cash'
                        ? 'كاش'
                        : paymentMethod === 'instapay'
                        ? 'إنستاباي'
                        : 'محفظة إلكترونية'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cloudflare Turnstile */}
              {turnstileSiteKey ? (
                <div className="w-full flex flex-col items-center justify-center py-1">
                  <Turnstile
                    key={turnstileWidgetKey}
                    siteKey={turnstileSiteKey}
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      setTurnstileError(null);
                    }}
                    onError={() => {
                      setTurnstileToken('');
                      setTurnstileError('تعذر إكمال التحقق الأمني. يرجى المحاولة ثانية.');
                    }}
                    onExpire={() => {
                      setTurnstileToken('');
                      setTurnstileError('انتهت صلاحية رمز التحقق، يرجى إعادة النقر.');
                    }}
                    options={{ theme: 'dark', language: 'ar' }}
                  />
                  {turnstileError && (
                    <p className="text-red-400 text-[10px] font-bold mt-1">{turnstileError}</p>
                  )}
                </div>
              ) : null}

              {/* Submit Error Banner */}
              {submitError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                  {submitError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Docked Drawer Footer */}
        {cart.length > 0 && (
          <div
            className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950/95 backdrop-blur-md shrink-0 space-y-3"
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0.75rem))' }}
          >
            <div className="flex justify-between items-center px-1">
              <span className="text-xs text-stone-400 font-bold">المبلغ المطلوب:</span>
              <span className="font-black text-xl text-white tabular-nums">
                {totalPrice.toFixed(0)}{' '}
                <small className="text-xs font-bold text-gold-400">ج.م</small>
              </span>
            </div>

            {/* Navigation Buttons based on Step */}
            {currentStep === 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full btn-primary py-3.5 rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 active:scale-[0.98] min-h-[48px] cursor-pointer"
              >
                <span>متابعة إدخال البيانات</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {currentStep === 2 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs min-h-[48px] flex items-center justify-center cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  <span>السلة</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isStep2Valid) setCurrentStep(3);
                  }}
                  disabled={!isStep2Valid}
                  className="flex-1 btn-primary py-3.5 rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] cursor-pointer"
                >
                  <span>متابعة للدفع والتأكيد</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs min-h-[48px] flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  <span>البيانات</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={!isStep3Valid || isSubmitting}
                  className="flex-1 btn-primary py-3.5 rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري تأكيد طلبك...</span>
                    </span>
                  ) : (
                    <span>
                      تأكيد الطلب · {totalPrice.toFixed(0)} ج.م
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
