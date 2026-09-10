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

- [x] **Phase 12: Phase 0 Discovery & Shared DB Extensions Lock**
  - توثيق خريطة العقود وإجابات الأسئلة الـ 7 في `docs/architecture/PHASE_0_DISCOVERY_AND_CONTRACT_LOCK.md`.
  - اكتشاف وتأمين جدولي `reservations` و `feedback` في سوبابيس مع فهارس الاستعلام الموجهة وحماية RLS.
  - تثبيت قرار نطاق المسؤولية في `docs/architecture/ADR-008-scope-lock-customer-facing-boundaries.md`.

- [x] **Phase 13: Operating Hours & Reservation Availability Engine**
  - دومين التوافر `features/reservations/domain/reservation-availability.ts`:
    - قراءة `restaurant_operating_hours` و `restaurant_special_closures` و `restaurant_schedule_overrides`.
    - التحقق الصارم من ساعات العمل (15:00 إلى 03:00) وفترة السماح المسبقة 45 دقيقة.
    - حساب السلوتات الزمنية المتاحة (30 دقيقة) وفق سعة الحجوزات القائمة والأيام المسموحة (اليوم والغد).

- [x] **Phase 14: Strict Customer Reservation Flow & Decoupled Events (ADR-008 Scoped)**
  - واجهة العميل `TableReservationModal`: (الاسم، الهاتف، عدد الأفراد، التاريخ، الوقت، الملاحظات) دون أي شاشات إدارة.
  - محرك تحقق خادمي صارم داخل `/api/reservations` مع Rate Limiting و Anti-Spam.
  - إدراج الحجز بحالة `'pending'` فقط في جدول `reservations` بسوبابيس وتوليد كود الحجز.
  - إطلاق حدث معزول لتليجرام الإدارة عبر `TelegramAdapter` غير حاجب للعميل.

- [x] **Phase 15: Customer Quality & Feedback Flow (ADR-008 Scoped)**
  - واجهة العميل الخفيفة `CustomerFeedbackModal` لجمع (الاسم، الهاتف، النوع `suggestion` / `complaint`، والرسالة).
  - نقطة نهاية `/api/feedback` مع Rate Limiting وحماية كاملة.
  - إدراج الشكوى بحالة `'new'` فقط في جدول `feedback` بسوبابيس.
  - إطلاق إشعار معزول لتليجرام الإدارة.

- [x] **Phase 16: Menu UX Polish (Adapted from UX Insights)**
  - شريط الأقسام المتقدم مع عدادات الأصناف المستخرجة ديناميكياً من `v_full_menu`.
  - شريط التفاعل وإمكانية الوصول الفوري لأزرار "احجز طاولتك بالمطعم" و "الشكاوى والمقترحات" من صفحات المنيو وNavbar وFooter.
  - البطاقة الهجينة التفاعلية `MenuItemCard` مع خيارات الحجم والكمية والإضافة المباشرة للسلة.
  - إضافة شريط مسار خطوات الطلب `ProgressSteps` ومؤقت مهلة التحويل المسبق `CountdownTimer` في نافذة إتمام الطلب `CheckoutForm`.
  - ربط حاوية السلة بالدفع عبر `GlobalCheckout` في `RootLayout`.

- [x] **Phase 17: Production Verification & Zero-Regression Check**
  - فحص TypeScript الصارم: `npx tsc --noEmit` (0 errors).
  - فحص ESLint الكامل: `npm run lint` (0 errors).
  - اختبار بناء الإنتاج الشامل: `npm run build` (Exit code 0، 14 مساراً ثابتاً وديناميكياً بنجاح تام).
  - الالتزام التام بعدم المساس بأصول `public/` أو أي جداول/Views/RPCs مشتركة في قاعدة البيانات.

