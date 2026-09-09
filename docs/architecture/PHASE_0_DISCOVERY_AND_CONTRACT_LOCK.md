# Phase 0 — Discovery & Contract Lock
## وثيقة التدقيق الشامل وتثبيت العقود (Mostafa Elgzar Platform)

> **القاعدة الحاكمة:**  
> مطعم مصطفى الجزار هو الـ **Source of Truth** الأوحد (Business Logic + Database + Contracts).  
> قاعدة البيانات مشتركة مع نظام إداري آخر في Repo آخر، وبالتالي **يُحظر تماماً كسر أو تعديل أي جداول أو Views أو RPCs حالية**.  
> الاستخلاص من أي مشروع آخر يخضع لمنهجية:  
> **Extract (UX Idea) → Adapt (Mostafa Domain) → Integrate (Layered Architecture) → Validate (Zero Regressions)**.

---

## 1. خريطة فحص وتدقيق قاعدة البيانات المشتركة (Database Contract Map)

### أ. الجداول والـ Views الحالية الموجودة بالفعل (Existing & Read-Only / Consumed)
| الكيان | النوع | الدور التشغيلي | الحقول الرئيسية | السياسة البرمجية |
| :--- | :--- | :--- | :--- | :--- |
| `v_full_menu` | View | المصدر الوحيد لقائمة الطعام | `category_id`, `category_name`, `category_order`, `item_id`, `item_name`, `price`, `variant_id`, `variant_name` | قراءة فقط (ممنوع تجاوزها) |
| `categories` | Table | تصنيفات الأصناف | `id`, `name`, `display_order`, `is_active` | RLS: Public Read (`is_active = true`) |
| `menu_items` | Table | أصناف الطعام | `id`, `category_id`, `name`, `description`, `is_available` | RLS: Public Read (`is_available = true`) |
| `item_variants` | Table | أحجام وأوزان الأصناف | `id`, `item_id`, `variant_name`, `price`, `is_available` | RLS: Public Read (`is_available = true`) |
| `restaurant_operating_hours` | Table | ساعات العمل الأسبوعية (0-6) | `day_of_week`, `open_time`, `close_time`, `is_closed` | RLS: Public Read. **المرجع الحصري لمواعيد الفتح والإغلاق** |
| `restaurant_special_closures` | Table | إغلاقات المناسبات والعطلات | `closure_date`, `reason` | RLS: Public Read. **تُلغي الحجز في أيام الإغلاق** |
| `restaurant_schedule_overrides`| Table | تعديل ساعات يوم استثنائي | `override_date`, `open_time`, `close_time`, `is_closed`, `reason`| RLS: Public Read. **تعدل مواعيد الفتح/الإغلاق لليوم** |
| `restaurant_policies` | Table | سياسات التشغيل والأسعار | `key` (varchar), `value` (jsonb), `description` | `min_order_amount` (80 ج.م), `max_delivery_radius_km` (13 كم), `delivery_fee_per_km` (8 ج.م), `max_driver_active_orders` (5) |
| `orders` | Table | الطلبات المركزية | `id`, `order_number`, `customer_name`, `customer_phone`, `status`, `total_amount`, `order_type`, `tracking_token` | تدار عبر الـ RPC والـ Domain State Machine |
| `drivers` | Table | المناديب | `id`, `name`, `phone`, `is_active`, `status` | تدار عبر لوحة الإدارة |
| `daily_shifts` | Table | ورديات الكاشير | `id`, `shift_number`, `status`, `opened_at`, `closed_at` | تدار عبر النظام الإداري |

### ب. الكيانات الجديدة المطلوبة فقط بعد إثبات عدم وجودها (The 7 Questions Verification)
بعد استعلام `information_schema.tables`، ثبت قطعاً **عدم وجود** جداول للحجوزات (`reservations`) أو الشكاوى (`feedback`).

#### الكيان 1: جدول الحجوزات الصارم (`reservations`)
- **الإجابة على الأسئلة الـ 7:**
  1. *هل يوجد بالفعل؟* لا.
  2. *أين يجب أن يوجد؟* في Supabase Public Schema كجدول أساسي مستقل.
  3. *من يملكه؟* دومين الحجوزات (`features/reservations`).
  4. *ما الـ Contract الخاص به؟*
     - `id`: uuid (Primary Key)
     - `reservation_number`: bigint (تسلسلي للقراءة السريعة)
     - `customer_name`: varchar(100) (NOT NULL)
     - `customer_phone`: varchar(20) (NOT NULL - هاتف مصري معتمد)
     - `reservation_date`: date (NOT NULL - تاريخ اليوم أو الغد فقط)
     - `reservation_time`: time (NOT NULL - محدد بالساعة والدقيقة ومطابق لساعات التشغيل)
     - `guest_count`: integer (NOT NULL - من 2 إلى 20 فرداً)
     - `table_number`: varchar(20) (NULLABLE - يحدده مدير الصالة)
     - `notes`: text (NULLABLE)
     - `status`: varchar(30) (DEFAULT `'pending'`)
       - **دورة الحياة الصارمة (Lifecycle):**
         - `pending` (جديد بانتظار مراجعة الصالة)
         - `confirmed` (مؤكد من إدارة المطعم)
         - `completed` (حضر العميل وشغلت الطاولة)
         - `cancelled` (ملغي من الإدارة أو بعد تواصل العميل)
         - `no_show` (لم يحضر العميل في الموعد)
     - `deposit_amount`: numeric (DEFAULT 0)
     - `deposit_receipt_url`: text (NULLABLE)
     - `created_at`: timestamptz (DEFAULT now())
     - `updated_at`: timestamptz (DEFAULT now())
  5. *هل يمكن إعادة استخدامه؟* نعم، بواسطة هذا التطبيق وبواسطة الـ Repo الآخر الذي يدير نفس قاعدة البيانات.
  6. *هل التعديل عليه آمن؟* آمن تماماً لأنه إضافة جديدة لا تعدل أي جدول قائم.
  7. *لماذا نحتاج إنشاءه؟* لتمكين حجز طاولات العائلات والعزائم إلكترونياً بدلاً من الاتصالات التليفونية المعرضة للنسيان.
- **الحماية والأمان:**
  - RLS: إدراج عبر Backend Service / API فقط مع Server-side validation و Rate Limiting لمنع الـ Abuse.
  - القراءة: مفتوحة للإدارة أو برمز تتبع الحجز.

#### الكيان 2: جدول الشكاوى والمقترحات (`feedback`)
- **الإجابة على الأسئلة الـ 7:**
  1. *هل يوجد بالفعل؟* لا.
  2. *أين يجب أن يوجد؟* في Supabase Public Schema.
  3. *من يملكه؟* دومين خدمة العملاء والجودة (`features/feedback`).
  4. *ما الـ Contract الخاص به؟*
     - `id`: uuid (PK)
     - `customer_name`: varchar(100) (NOT NULL)
     - `customer_phone`: varchar(20) (NOT NULL)
     - `feedback_type`: varchar(20) (CHECK `feedback_type IN ('suggestion', 'complaint')`)
     - `message`: text (NOT NULL, min 10 chars)
     - `status`: varchar(20) (DEFAULT `'new'`, values: `'new'`, `'reviewed'`, `'resolved'`)
     - `admin_notes`: text (NULLABLE)
     - `created_at`: timestamptz (DEFAULT now())
  5. *هل التعديل عليه آمن؟* آمن ومعزول تماماً.
  6. *لماذا نحتاج إنشاءه؟* لتمكين إدارة المطعم من قياس رضا العملاء وحل المشاكل قبل تفاقمها.

---

## 2. محرك التوافر والحجز الحسابي (Reservation Availability Engine)

العميل لا يرى مجرد ساعات العمل؛ بل يمر الفحص بالتسلسل الرياضي التالي:

```
                  DATE REQUESTED (e.g. 2026-09-11)
                                │
         ┌──────────────────────┴──────────────────────┐
         ▼                                             ▼
Check Special Closures                       Check Schedule Overrides
(restaurant_special_closures)              (restaurant_schedule_overrides)
         │                                             │
         ├──────── Is Closed? ──► [RETURN NO SLOTS]    │
         │                                             │
         ▼                                             ▼
Fetch Base Operating Hours                   Override Open/Close Hours
(restaurant_operating_hours for day)                  │
         │                                             │
         └──────────────────────┬──────────────────────┘
                                │
                    [Effective Operating Window]
                    (e.g., 15:00 to 03:00 next day)
                                │
                                ▼
                   Generate 30-min Time Slots
                                │
                                ▼
             Fetch Existing Confirmed/Pending Reservations
                     (for that specific date)
                                │
                                ▼
             Calculate Remaining Table Capacity Per Slot
                (Max concurrent tables/capacity limit)
                                │
                                ▼
           [RETURN ACTIVE AVAILABLE SLOTS TO FRONTEND]
```

### القواعد الصارمة:
1. **لا ربط بين حالة المطعم الآن وبين الحجز:** دالة `isRestaurantOpenNow()` تفحص اللحظة الحالية فقط (لعرض شارة "مفتوح الآن" أو "مغلق" في الهيدر). بينما دالة `getReservationAvailability(date)` تفحص التوافر المستقبلي لتاريخ الحجز.
2. **منع الأوقات المنقضية:** إذا كان تاريخ الحجز هو "اليوم"، تُستبعد تلقائياً جميع الـ Slots التي انقضى وقتها الحالي بـ 60 دقيقة على الأقل (وقت تحضير كافي للمطعم).

---

## 3. أمان الإدخال ومكافحة الإساءة (Rate Limiting & Anti-Abuse)

نظراً لأن نقاط النهاية عامة (Public Endpoints):
1. **Rate Limiting نافذة زمنية (Sliding Window):**
   - منع تكرار إرسال الحجز أو الشكوى لنفس رقم الهاتف خلال 60 ثانية.
   - حد أقصى 3 حجوزات نشطة لنفس رقم الهاتف في نفس اليوم لمنع إغراق الطاولات.
2. **Turnstile Captcha Verification:** التحقق من التوكن على الخادم قبل لمس قاعدة البيانات.
3. **Strict Phone Format:** رقم هاتف مصري صالح (11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015).

---

## 4. فك ارتباط الإشعارات (Decoupled Notification Architecture)

```
[Reservation API / Domain]
            │
            ▼ (Emits)
[ReservationCreatedEvent]
            │
            ▼
[NotificationService Dispatcher] (Background / Non-Blocking)
            │
            ▼
[TelegramAdapter] ──► (Sends HTML formatted Arabic Alert to Management Group)
```
- **حماية الأداء:** يتم إرسال التنبيه في الخلفية دون تعطيل استجابة العميل؛ وإذا تعطل تليجرام، يكتمل الحجز بنجاح بنسبة 100%.

---

## 5. سياسة الأصول الثابتة (`public/` Assets Policy)

- **القاعدة الحاكمة:**
  > *Do not modify, delete, replace, or restructure existing public assets unless the task explicitly requires it and the change is proven necessary. Preserve all existing assets and routes.*
- لن يتم حذف أو تغيير أي أصل قائم إطلاقاً.
