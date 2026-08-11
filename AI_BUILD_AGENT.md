# 🤖 AI Build Agent - Instructions
# مطعم مصطفى الجزار - Restaurant Website

## 📋 Project Overview
Build a modern, dark-themed restaurant website for "Mostafa Elgzar" - an Egyptian traditional (Baladi) restaurant specializing in offal, grilled meats, and clay pot dishes.

**Tech Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
**Deployment:** Static Export (GitHub → Vercel)
**Language:** Arabic (RTL)

---

## 📁 Project Structure

```
mostafa-elgzar-restaurant/
├── app/
│   ├── globals.css          # Global styles, animations, fonts
│   ├── layout.tsx           # Root layout (Navbar + Footer + metadata)
│   ├── page.tsx             # Homepage (Hero + Featured + Info)
│   ├── menu/
│   │   └── page.tsx         # Full menu page with filter & search
│   ├── about/
│   │   └── page.tsx         # About page (story + values + stats)
│   └── contact/
│       └── page.tsx         # Contact page (info + map + delivery links)
├── components/
│   ├── Navbar.tsx           # Top navigation (sticky, responsive)
│   ├── Footer.tsx           # Footer with links & contact info
│   ├── HeroSection.tsx      # Landing hero with animations
│   ├── FeaturedDishes.tsx   # Popular dishes showcase
│   ├── InfoSection.tsx      # Why choose us + contact info
│   ├── MenuCard.tsx         # Individual dish card component
│   ├── CategoryFilter.tsx   # Category filter buttons
│   └── SearchBar.tsx        # Menu search input
├── data/
│   └── menu.ts              # ALL menu data (40+ items, categories)
├── public/
│   └── images/              # Placeholder for real food photos
├── package.json
├── tsconfig.json
├── next.config.js           # Static export config
├── tailwind.config.ts       # Custom colors (primary red + gold)
└── postcss.config.js
```

---

## 🎨 Design System

### Colors
- **Primary Red:** `#dc2626` (buttons, accents, highlights)
- **Gold:** `#f59e0b` (prices, badges, secondary accents)
- **Background:** `#0a0a0a` (dark base)
- **Card BG:** `rgba(255,255,255,0.05)` with backdrop blur
- **Text:** White headings, `#9ca3af` gray body text

### Typography
- **Arabic Font:** Cairo (Google Fonts)
- **English Font:** Inter (Google Fonts)
- **Direction:** RTL (`dir="rtl"`)

### Key CSS Classes (from globals.css)
```css
.text-gradient          /* Red-to-gold gradient text */
.glass-card             /* Frosted glass card effect */
.hover-lift             /* Hover lift animation */
.btn-primary            /* Red gradient button */
.btn-gold               /* Gold gradient button */
.section-title          /* Section heading style */
.section-subtitle       /* Section description style */
```

---

## 📊 Data Source (data/menu.ts)

### Categories (10 categories)
```typescript
const categories = [
  { id: "all", name: "الكل", icon: "Grid3X3" },
  { id: "sandwiches", name: "السندوتشات", icon: "Sandwich" },
  { id: "tajin", name: "الطواجن", icon: "Soup" },
  { id: "meat", name: "لحمة بلدي", icon: "Beef" },
  { id: "mix", name: "طلب مشكل", icon: "UtensilsCrossed" },
  { id: "soup", name: "الشوربة", icon: "Soup" },
  { id: "hawawshi", name: "الحواوشي", icon: "Pizza" },
  { id: "fatta", name: "الفتة", icon: "ChefHat" },
  { id: "rice", name: "الأرز", icon: "Wheat" },
  { id: "extras", name: "الإضافات", icon: "Salad" },
];
```

### Menu Items (40+ items)
Each item has: `id`, `name`, `price` (EGP), `description`, `category`, `popular` (boolean flag)

**Key Items to Highlight (popular = true):**
- رغيف مشكل كبير (70ج)
- رغيف الجزار كبير (100ج) - THE SIGNATURE DISH
- طاجن كوارع (300ج)
- لحمة بلدي محمرة باللية - نص كيلو (500ج)
- طلب طحال ولحمة راس وممبار (حسب الاختيار)
- طلب الجزار (حسب الاختيار) - THE ULTIMATE MIX

**Items with price = 0:** Display "حسب الاختيار" instead of price

---

## 🔗 External Links to Include

| Platform | URL |
|----------|-----|
| **Phone (Primary)** | `tel:01122339739` |
| **Phone (Alt 1)** | `tel:01153455452` |
| **Phone (Alt 2)** | `tel:01156768608` |
| **TikTok** | `https://www.tiktok.com/@m.elgzar` |
| **Talabat** | `https://www.talabat.com/ar/egypt/restaurant/781448/mostafa-algazaar-restaurant-matareya` |
| **Elmenus** | `https://www.elmenus.com/ar/القاهرة/مطعم-مصطفى-الجزار-q9zod` |
| **Google Maps** | `https://maps.google.com/?q=5+Omar+El+Mokhtar+St+Matareya+Cairo` |

---

## 📱 Pages Breakdown

### 1. Homepage (`/`)
- **HeroSection:** Full-screen hero with restaurant name, tagline "أصل الأكل الحرش", CTA buttons (View Menu + Call Now), phone number display
- **FeaturedDishes:** Grid of 6 popular dishes with "الأكثر طلباً" badge, link to full menu
- **InfoSection:** Why choose us (3 features) + Contact info card with order buttons

### 2. Menu Page (`/menu`)
- Search bar (filters by name/description)
- Category filter buttons (horizontal scroll on mobile)
- Results count display
- Grid of MenuCards (responsive: 1→2→3→4 columns)
- Empty state when no results
- Each card: image placeholder + name + price + description + "اطلب الآن" button

### 3. About Page (`/about`)
- Restaurant story (3 paragraphs)
- Stats grid (4 stats: customers, menu items, quality, experience)
- Values section (3 cards: Quality, Authenticity, Service)

### 4. Contact Page (`/contact`)
- 3 contact cards: Phone, Address, Hours
- Delivery platforms section (Talabat + Elmenus)
- Google Maps placeholder with link

---

## 🚀 Build Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production (static export)
npm run build

# The static files will be in /dist folder
```

---

## 🎯 Key Features to Implement

1. **RTL Layout:** All text right-aligned, navigation flows right-to-left
2. **Sticky Navbar:** Changes background on scroll (transparent → dark blur)
3. **Mobile Menu:** Hamburger menu with slide-down animation
4. **Framer Motion Animations:**
   - Fade-in on scroll for all sections
   - Staggered card animations
   - Hover lift effects on cards
   - Scroll indicator bounce animation
5. **Menu Filtering:** Filter by category + real-time search
6. **Click-to-Call:** All phone numbers are clickable `tel:` links
7. **External Links:** Talabat, Elmenus, TikTok, Google Maps open in new tabs
8. **SEO:** Meta tags, Open Graph, keywords in Arabic

---

## ⚠️ Important Notes

1. **Images:** Currently using Unsplash placeholders. Replace with real food photos when available.
2. **Logo:** Using letter "م" as placeholder. Replace with actual restaurant logo.
3. **Prices:** Some items show "حسب الاختيار" - these are custom-order items.
4. **Working Hours:** Set as "12 ظهراً - 12 منتصف الليل" (adjust if needed).
5. **Address:** 5 شارع عمر المختار، متفرع من شارع الحرية، الرشاح، المطرية، القاهرة

---

## 📝 Metadata (SEO)

```
Title: مطعم مصطفى الجزار | أصل الأكل الحرش
Description: مطعم مصطفى الجزار - أصل الأكل الحرش في المطرية. نقدم أشهى الأكلات البلدي المصرية: كبدة، كفتة، سجق، ممبار، كلاوي، طواجن، لحمة بلدي.
Keywords: مطعم مصطفى الجزار, أكل حرش, كبدة, كفتة, سجق, ممبار, كلاوي, المطرية, القاهرة, مطعم بلدي
```

---

## ✅ Deployment Checklist

- [ ] All pages render without errors
- [ ] Menu filtering works correctly
- [ ] Search functionality works
- [ ] All phone links are clickable
- [ ] External links open in new tabs
- [ ] Mobile responsive (test on 320px width)
- [ ] RTL layout correct
- [ ] Animations smooth on all devices
- [ ] Build succeeds with `npm run build`
- [ ] Static files generated in `/dist`
- [ ] Deployed to Vercel successfully

---

**Restaurant Name:** مطعم مصطفى الجزار  
**Tagline:** أصل الأكل الحرش  
**Location:** المطرية، القاهرة، مصر  
**Primary Phone:** 01122 339 739  
**TikTok:** @m.elgzar
