import { supabase } from '@/lib/supabase/client';

export const EMERGENCY_PAPER_IMAGES = ['/images/menu1.jpg', '/images/menu2.jpg'];

export interface PaperMenuQueryResult {
  images: string[];
  isFallback: boolean;
  fallbackReason: string | null;
  error: string | null;
}

/**
 * Fetches the scanned paper menu images directly from Supabase restaurant_policies.
 * Supabase is the Single Source of Truth for live configuration.
 * If Supabase is unreachable or data is missing/partial, seamlessly engages Emergency Fallback.
 */
export async function getPaperMenuImages(): Promise<PaperMenuQueryResult> {
  try {
    const { data, error } = await supabase
      .from('restaurant_policies')
      .select('value')
      .eq('key', 'paper_menu_images')
      .maybeSingle();

    if (error) {
      console.warn('[getPaperMenuImages] Supabase query failed, engaging Emergency Fallback:', error.message);
      return {
        images: [...EMERGENCY_PAPER_IMAGES],
        isFallback: true,
        fallbackReason: 'تعذر الاتصال بقاعدة البيانات لجلب أحدث نسخة.',
        error: error.message,
      };
    }

    if (!data || !data.value) {
      console.warn('[getPaperMenuImages] No paper menu configuration in Supabase, engaging Emergency Fallback.');
      return {
        images: [...EMERGENCY_PAPER_IMAGES],
        isFallback: true,
        fallbackReason: 'لم يتم العثور على إعدادات المنيو الورقي في قاعدة البيانات.',
        error: null,
      };
    }

    let urls: string[] = [];

    if (Array.isArray(data.value)) {
      urls = data.value.filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
    } else if (typeof data.value === 'string') {
      try {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed)) {
          urls = parsed.filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
        } else if (typeof parsed === 'string' && parsed.trim().length > 0) {
          urls = [parsed.trim()];
        }
      } catch {
        if (data.value.trim().length > 0) {
          urls = [data.value.trim()];
        }
      }
    }

    if (urls.length === 0) {
      return {
        images: [...EMERGENCY_PAPER_IMAGES],
        isFallback: true,
        fallbackReason: 'روابط المنيو الورقي في قاعدة البيانات غير صالحة.',
        error: null,
      };
    }

    // Partial coverage handling: If Supabase provides fewer pages than expected (e.g., 1 page), fill missing pages with emergency fallback
    if (urls.length < EMERGENCY_PAPER_IMAGES.length) {
      const combined = [...urls];
      for (let i = urls.length; i < EMERGENCY_PAPER_IMAGES.length; i++) {
        combined.push(EMERGENCY_PAPER_IMAGES[i]);
      }
      return {
        images: combined,
        isFallback: true,
        fallbackReason: 'بعض صفحات المنيو الورقي معروضة من النسخة الاحتياطية.',
        error: null,
      };
    }

    // Full Success from Supabase
    return {
      images: urls,
      isFallback: false,
      fallbackReason: null,
      error: null,
    };
  } catch (err: any) {
    console.error('[getPaperMenuImages] Unexpected exception, engaging Emergency Fallback:', err);
    return {
      images: [...EMERGENCY_PAPER_IMAGES],
      isFallback: true,
      fallbackReason: 'حدث خطأ غير متوقع أثناء الاتصال بالخادم.',
      error: err?.message || 'Unexpected error',
    };
  }
}
