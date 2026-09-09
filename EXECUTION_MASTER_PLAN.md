# سجل تنفيذ وتتبع مراحل منصة مطعم مصطفى الجزار (EXECUTION MASTER PLAN)

## 📌 ملخص التحول الشامل (Architecture Summary)
تم دمج وتوحيد كامل وظائف المنصة في مشروع واحد مستقل ومتكامل (`mostafa-elgzar-restaurant`) مع التخلص الكامل والنهائي من المجلد المؤقت (`Menu_Elgazar`) بدون أي بقايا أو مراجع.
تم الالتزام الصارم بعدم المساس بفولدر `#public` أو `public/`.

---

## 🏗️ البنية المعمارية النهائية (High-Level Architecture)

```
                    MOSTAFA ELGAZAR
                    RESTAURANT PLATFORM
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   STOREFRONT             ORDERS           OPERATIONS
        │                   │                   │
      Menu                Cart             Dashboard (/admin)
      Brand              Checkout          Orders Table (/admin/orders)
      QR (/qrcode)       Payment           Drivers & Shifts (/admin/drivers)
      Tracking           Tracking          Kitchen & Trip Engine
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                         EVENTS
                            │
                    NOTIFICATIONS (Telegram Hub - Decoupled)
```

---

## 📋 سجل المراحل وحالة التنفيذ (Phases Status)

- [x] **Phase 0: Architecture Decision Records (ADRs) & Runtime Decoupling**
  - توثيق 7 قرارات معمارية في `docs/architecture/` (ADR-001 إلى ADR-007).
  - إزالة `output: 'export'` من `next.config.js` لتشغيل خادم Node.js / Vercel هجين (Static + Dynamic SSR + API Routes).

- [x] **Phase 1: Contracts, Types & Supabase Client Foundations**
  - تثبيت حزم `@supabase/supabase-js` و `@marsidev/react-turnstile`.
  - إنشاء عقود الأنواع الصارمة في `types/menu.ts` و `types/orders.ts` و `types/trips.ts`.
  - تهيئة عميل سوبابيس في `lib/supabase/client.ts`.

- [x] **Phase 2: Live Menu Domain (Strict Single Source of Truth)**
  - اعتماد View `v_full_menu` في سوبابيس كمصدر وحيد وحصري للبيانات (Single Source of Truth).
  - بناء مكون حالة الخطأ والاتصال الهاتفي المباشر `MenuErrorState.tsx` بدون استخدام بيانات وهمية صامتة.
  - دعم الأصناف، الأحجام (Variants)، والملاحظات الخاصة في `MenuItemCard.tsx`.
  - الحفاظ على مستعرض صور المنيو الورقية عالية الدقة في صفحة `/menu`.

- [x] **Phase 3: Global Cart Domain & State Management**
  - بناء `CartContext.tsx` وحفظ الحالة محلياً في `localStorage`.
  - شريط السلة العائم `CartBar.tsx` ونافذة تفاصيل السلة `CartModal.tsx`.
  - دمج السلة في `app/layout.tsx`.

- [x] **Phase 4: Checkout & Order Intake API**
  - نموذج الدفع المكتمل `CheckoutForm.tsx` (توصيل/استلام، هاتف مصري، رفع إيصال الدفع البنكي/إنستاباي).
  - نقطة النهاية `/api/orders` الآمنة بحماية Turnstile والتحقق من التكرار (Anti-Spam 10s Rate Limit) واستدعاء RPC `create_order_secure`.

- [x] **Phase 5: Decoupled Notification Hub (Telegram Adapter)**
  - بنية أحداث غير حاجزة (Event-Driven Architecture) في `features/notifications`.
  - فصل إشعارات تليجرام تماماً عن المعاملة البنكية/قاعدة البيانات بحيث لا يؤثر فشل تليجرام على إنشاء الطلب.

- [x] **Phase 6: Customer Realtime Order Tracking (`/order/[id]`)**
  - ربط فوري عبر سوبابيس Realtime (`order-status-${id}`).
  - شريط مراحل زمني (Step Tracker) للطلب من الاستلام حتى التسليم في `OrderTrackingView.tsx`.
  - دعم التتبع الآمن عبر `token` و RPC `get_customer_order_tracking`.

- [x] **Phase 7: Domain State Machine & Operations Engine**
  - بناء محرك حالات الطلبات النقي في `features/orders/domain/order-state-machine.ts`.
  - عمليات الدومين الصريحة `OrderOperations` (`assignDriver`, `unassignDriver`, `markDeliveryFailed`, `cancelOrder`).
  - تطبيق سياسة الرحلات `TripPolicy` وسقف الـ 5 طلبات كحد أقصى لكل رحلة.

- [x] **Phase 8: Operations Dashboard (`/admin`)**
  - لوحة تحكم العمليات والمطبخ:
    - `/admin`: مؤشرات الأداء الحية (KPIs)، الإيرادات، خط تدفق الطلبات.
    - `/admin/orders`: فلترة الطلبات، البحث اللحظي، وتحديث الحالات المحمية بآلة الحالات.
    - `/admin/drivers`: إدارة المناديب، الوردية، وتطبيق سياسة الـ 5 طلبات للرحلة.
    - `/api/admin/orders`: واجهة برمجية محمية بقواعد آلة الحالات.

- [x] **Phase 9: Storefront Integration & Clean UI Transition**
  - توجيه أزرار "اطلب الآن" في `Navbar` و `FloatingActions` و `OrderModalContext` للانتقال الداخلي السلس إلى `/menu`.
  - إلغاء أي اعتماد على روابط خارجية أو تطبيقات منفصلة.

- [x] **Phase 10: Zero-Dependency Audit & Deletion of `Menu_Elgazar`**
  - التأكد التام من عدم وجود أي Import أو مسار يشير إلى `Menu_Elgazar`.
  - حذف مجلد `Menu_Elgazar` نهائياً من الـ Workspace.

- [x] **Phase 11: Production Verification & Zero Regression**
  - فحص TypeScript (`npx tsc --noEmit`): **0 errors**.
  - فحص ESLint (`npm run lint`): **0 errors**.
  - اختبار بناء الإنتاج بالكامل (`npm run build`): **Pass (Exit code 0)**، تم إنشاء 12 مساراً بنجاح.

---

## 🚀 التوسعات المعتمدة (Architectural UX & Advanced Services Integration)
> **المبدأ الحاكم:** قاعدة البيانات مشتركة مع نظام إداري في Repo آخر. لا مساس بأي جداول قائمة.
> المنهجية: Extract (UX Idea) → Adapt (Mostafa Domain) → Integrate (Layered) → Validate.

- [ ] **Phase 12: Phase 0 Discovery & Shared DB Extensions Lock**
  - توثيق خريطة العقود وإجابات الأسئلة الـ 7 في `docs/architecture/PHASE_0_DISCOVERY_AND_CONTRACT_LOCK.md`.
  - إنشاء جدولي `reservations` و `feedback` في سوبابيس مع دورة حياة صريحة وحماية RLS متكاملة.

- [ ] **Phase 13: Operating Hours & Reservation Availability Engine**
  - بناء دومين `features/operating-hours/domain`:
    - قراءة `restaurant_operating_hours` و `restaurant_special_closures` و `restaurant_schedule_overrides`.
    - فصل فحص اللحظة الحالية `isRestaurantOpenNow()` عن فحص التوافر المستقبلي `getReservationAvailability(date)`.
    - حساب السلوتات الزمنية المتاحة (30 دقيقة) وفق سعة الطاولات والأيام المسموحة (اليوم والغد).
  - بناء دومين `features/policies/domain`:
    - قراءة `restaurant_policies` (الحد الأدنى 80 ج، نطاق 13 كم، سعر الكيلو 8 ج).

- [ ] **Phase 14: Strict Table Reservation Domain & Decoupled Events**
  - بناء `features/reservations`:
    - دورة حياة الحجز: `pending` → `confirmed` → `completed` / `cancelled` / `no_show`.
    - نقطة نهاية آمنة `/api/reservations` مع التحقق الخادمي الصارم ومكافحة الإساءة (Rate Limiting + Turnstile).
    - حدث `ReservationCreatedEvent` معزول يرسل لتليجرام الإدارة بدون تأخير أو كسر للعملية.
    - واجهة `TableReservationModal` الفاخرة بدون أي ذكر لكلمة "كافيه" أو هاردكود لأوقات العمل.

- [ ] **Phase 15: Customer Quality & Feedback Domain**
  - بناء `features/feedback`:
    - نقطة نهاية `/api/feedback` مع Rate Limiting وحماية كاملة.
    - حدث `FeedbackReceivedEvent` معزول لتليجرام الإدارة.
    - واجهة `CustomerFeedbackModal` الراقية للمقترحات والشكاوى.

- [ ] **Phase 16: Menu UX Polish (Adapted from UX Insights)**
  - شريط الأقسام المتقدم مع عدادات الأصناف المستخرجة ديناميكياً من `v_full_menu`.
  - شريط التفاعل الزجاجي العائم مع مؤشر حالة المنيو اللحظي والبحث السريع وأزرار الحجز والشكاوى.
  - تحسين البطاقة الهجينة `MenuItemCard` للموبايل (مدمجة وأفقية) والديسكتوب.
  - إضافة شريط مسار خطوات الطلب `ProgressSteps` ومؤقت مهلة التحويل `CountdownTimer` في السلة/الدفع.

- [ ] **Phase 17: Admin Operations & Final Build Verification**
  - إضافة شاشة إدارة الحجوزات في لوحة التحكم `/admin/reservations` للتحكم في قبول وتأكيد الحجوزات.
  - التحقق الكامل: `npx tsc --noEmit` + `npm run lint` + `npm run build` (Exit 0).
  - الالتزام الصارم بسياسة الأصول الثابتة `public/` (عدم تعديل أو حذف أي ملف موجود).

