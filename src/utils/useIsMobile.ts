import { useEffect, useState } from 'react';

const QUERY = '(max-width: 767px)'; // below Tailwind's md breakpoint

/** True on phone-sized screens; updates when the window is resized or rotated. */
export function useIsMobile(): boolean {
  const get = () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
  const [isMobile, setIsMobile] = useState(get);
  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}
