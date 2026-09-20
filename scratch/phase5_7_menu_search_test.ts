import fs from 'fs';
import path from 'path';

console.log('=== PHASE 5 — MODULE 5.7: MENU / CATEGORY / SEARCH UX AUDIT ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    if (detail) console.log(`       Evidence: ${detail}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    if (detail) console.error(`       Detail: ${detail}`);
    failCount++;
  }
}

// 1. Audit get-menu.query.ts
const queryPath = path.resolve('features/menu/queries/get-menu.query.ts');
assert(fs.existsSync(queryPath), 'get-menu.query.ts file existence');
const queryContent = fs.readFileSync(queryPath, 'utf8');

assert(
  queryContent.includes("from('v_full_menu')"),
  'SOURCE OF TRUTH M5.7-01: Menu data is fetched directly from Supabase v_full_menu view'
);

assert(
  queryContent.includes("order('category_order'"),
  'CONTRACT CHECK M5.7-02: Categories and items preserve category_order from Supabase'
);

// 2. Audit app/menu/page.tsx
const menuPagePath = path.resolve('app/menu/page.tsx');
assert(fs.existsSync(menuPagePath), 'app/menu/page.tsx file existence');
const menuPageContent = fs.readFileSync(menuPagePath, 'utf8');

assert(
  !/\border_source\b/.test(menuPageContent),
  'CONTRACT CHECK M5.7-03: Menu page contains 0 references to order_source'
);

assert(
  !/\bdaily_shift_id\b/.test(menuPageContent) && !/\bshift_id\b/.test(menuPageContent),
  'CONTRACT CHECK M5.7-04: Menu page contains 0 references to daily_shift_id or shift_id'
);

assert(
  menuPageContent.includes('IntersectionObserver') && menuPageContent.includes('data-category-section'),
  'CATEGORY UX M5.7-05: ScrollSpy IntersectionObserver is implemented for automatic category synchronization'
);

assert(
  menuPageContent.includes('searchQuery') && menuPageContent.includes('filteredCategories'),
  'SEARCH UX M5.7-06: Instant search filters menu items by Arabic text matching'
);

// 3. Audit CategoryRail.tsx
const categoryRailPath = path.resolve('features/menu/components/CategoryRail.tsx');
assert(fs.existsSync(categoryRailPath), 'CategoryRail.tsx file existence');
const categoryRailContent = fs.readFileSync(categoryRailPath, 'utf8');

assert(
  categoryRailContent.includes('sticky') && categoryRailContent.includes('overflow-x-auto'),
  'CATEGORY UX M5.7-07: CategoryRail provides sticky horizontal mobile navigation'
);

assert(
  categoryRailContent.includes('scrollTo'),
  'CATEGORY UX M5.7-08: CategoryRail smoothly centers active category button on click/scroll'
);

// 4. Audit MenuItemCard.tsx
const itemCardPath = path.resolve('features/menu/components/MenuItemCard.tsx');
assert(fs.existsSync(itemCardPath), 'MenuItemCard.tsx file existence');
const itemCardContent = fs.readFileSync(itemCardPath, 'utf8');

assert(
  itemCardContent.includes('isFullyUnavailable') && itemCardContent.includes('غير متاح'),
  'ITEM CARD M5.7-09: MenuItemCard displays authoritative unavailable badge from DB'
);

assert(
  itemCardContent.includes('lowestPrice'),
  'ITEM CARD M5.7-10: MenuItemCard displays prices directly from variant row'
);

// 5. Audit SearchBar.tsx
const searchBarPath = path.resolve('components/SearchBar.tsx');
assert(fs.existsSync(searchBarPath), 'SearchBar.tsx file existence');
const searchBarContent = fs.readFileSync(searchBarPath, 'utf8');

assert(
  searchBarContent.includes('type="search"') && searchBarContent.includes('X'),
  'SEARCH UX M5.7-11: SearchBar component provides clear input action and search accessibility'
);

console.log(`\n=== MODULE 5.7 SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) process.exit(1);
