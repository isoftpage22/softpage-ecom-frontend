'use client';

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

/** Compact Porter mark for map corner badges. */
export function PorterMark({ title = 'Porter', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" role="img" aria-label={title} {...props}>
      <title>{title}</title>
      <rect width="32" height="32" rx="8" fill="#0B1F33" />
      <path
        d="M8.5 22.5V9.5h6.2c3.1 0 5.1 1.7 5.1 4.4 0 1.7-.8 3-2.1 3.7l2.8 4.9h-3.5l-2.5-4.4h-2.5v4.4H8.5zm3.5-7h2.5c1.3 0 2.1-.7 2.1-1.8s-.8-1.8-2.1-1.8H12v3.6z"
        fill="#F5A623"
      />
    </svg>
  );
}

/** Compact Shiprocket mark for map corner badges. */
export function ShiprocketMark({ title = 'Shiprocket', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" role="img" aria-label={title} {...props}>
      <title>{title}</title>
      <rect width="32" height="32" rx="8" fill="#5B2EFF" />
      <path
        d="M9 21.5l7.2-12.4c.3-.5 1-.5 1.3 0L24.7 21.5c.3.6-.1 1.3-.8 1.3h-2.6c-.3 0-.6-.2-.7-.4L16.5 14l-4.1 8.4c-.2.3-.5.4-.8.4H9.8c-.7 0-1.1-.7-.8-1.3z"
        fill="#FFFFFF"
      />
      <circle cx="16.5" cy="20.2" r="1.4" fill="#9BE15D" />
    </svg>
  );
}

export function deliveryPartnerKind(
  provider?: string | null,
): 'porter' | 'shiprocket' | null {
  const key = String(provider || '').toLowerCase();
  if (!key) return null;
  if (key.includes('porter')) return 'porter';
  if (key.includes('shiprocket')) return 'shiprocket';
  return null;
}
