# ADR-008: نطاق وحدود المسؤولية للحجوزات والشكاوى (Scope Lock: Customer-Facing Boundaries)

## 📌 الحالة (Status)
**مقبول ومُثبّت (Accepted & Scope-Locked)** — 2026-09-10

## 🏛️ السياق (Context)
قاعدة بيانات مطعم مصطفى الجزار (Supabase) مشتركة مع مستودع آخر (Repository) منفصل مخصص لإدارة وتشغيل المطعم ومتابعة الطاولات وتأكيد الحجوزات والورديات.
تجنباً لتضخم المشروع الحالي أو ازدواجية وظائف الإدارة مع المستودع الآخر، ولضمان بقاء `mostafa-elgzar-restaurant` واجهة عملاء سريعة ورشيقة ومستقرة، كان من الضروري وضع حدود مسؤولية معمارية قاطعة (Responsibility Boundary).

---

## 🔒 القرار المعماري (Decision)

### 1. حدود مسؤولية هذا المشروع (`mostafa-elgzar-restaurant`):
المشروع الحالي هو واجهة العميل (Customer-Facing Storefront). مسؤوليته محددة بدقة في التدفق التالي:
```text
Display ➔ Collect ➔ Validate ➔ Submit ➔ Show Result
```
* **المطلوب تنفيذه هنا فقط:**
  1. **نموذج الحجز (`TableReservationModal`):** واجهة خفيفة وأنيقة لجمع (الاسم، الهاتف، عدد الأفراد، التاريخ، الوقت المتاح، الملاحظات).
  2. **محرك تحقق خادمي صارم (Small but Strict Server Validation Engine):**
     - التحقق من الاسم وتنسيق الهاتف المصري (11 رقم).
     - التحقق من التوافر (`Availability`) بالاعتماد على:
       `Operating Hours` + `Closures` + `Overrides` + `Existing Reservations` + `Table Capacity`.
     - منع أي حجز غير صالح خادمياً.
  3. **نموذج الشكاوى والمقترحات (`CustomerFeedbackModal`):** واجهة بسيطة لجمع (الاسم، الهاتف، النوع `suggestion` / `complaint`، والرسالة).
  4. **إرسال البيانات إلى سوبابيس (Write / Submit):** إدراج السجل بحالته الأولية (`pending` للحجز، و`new` للشكوى).
  5. **إطلاق حدث التنبيه (Decoupled Notification Event):** تنبيه الإدارة عبر تليجرام في الخلفية دون تأخير للعميل.
  6. **إظهار رسالة التأكيد للعميل (Show Result).**

---

### 2. حدود مسؤولية مستودع الإدارة المنفصل (Admin / Operations Repo):
المستودع الآخر هو المسؤول الحصري عن تدفق الإدارة:
```text
Receive ➔ Manage ➔ Confirm / Cancel ➔ Monitor ➔ Resolve ➔ Report
```
* **ممنوع قطعاً بناؤه في `mostafa-elgzar-restaurant`:**
  - ❌ لا يوجد Reservation Dashboard أو لوحة إدارة طاولات.
  - ❌ لا يوجد Feedback Management أو تقارير شكاوى.
  - ❌ لا يوجد Reservation Calendar موسع أو CRM للعملاء.
  - ❌ لا توجد وظائف تغيير وتأكيد حالات الحجز للعميل داخل React.

---

## 🎯 المبادئ الحاكمة (Guiding Principles)
1. **الـ Source of Truth:** هو مطعم مصطفى الجزار دائماً. الأفكار المستخلصة من تجارب أخرى مثل أبو خاطر تستخدم فقط في إثراء تجربة المستخدم والواجهة البصرية (UX/UI Interaction) مع التكييف التام، ولا تستخدم في قواعد العمل أو إدارة البيانات.
2. **المنهجية:** `Extract (UX Idea) ➔ Adapt (Mostafa Domain) ➔ Integrate (Layered Architecture) ➔ Validate (Zero Regressions)`.
