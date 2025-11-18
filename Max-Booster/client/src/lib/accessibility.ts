import { useEffect, useRef, useCallback, useState } from 'react';

// Accessibility utilities and constants

export const ARIA_LIVE_REGIONS = {
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
  OFF: 'off',
} as const;

export const ARIA_ROLES = {
  ALERT: 'alert',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  SEARCH: 'search',
  BUTTON: 'button',
  LINK: 'link',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
} as const;

// Focus management utilities
export const focusableElements = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details>summary:first-of-type',
  'details',
];

/**
 * TODO: Add function documentation
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(focusableElements.join(','));
  return Array.from(elements).filter((el) => {
    // Check if element is visible
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
  });
}

/**
 * TODO: Add function documentation
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return () => {};

  const firstElement = focusable[0];
  const lastElement = focusable[focusable.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element
  setTimeout(() => firstElement?.focus(), 0);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

// Screen reader announcements
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Check contrast ratio
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map((c) => {
      const val = parseInt(c) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Check if contrast meets WCAG AA standards
export function meetsContrastStandard(ratio: number, largeText = false): boolean {
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

// Generate unique ID for ARIA attributes
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// Manage ARIA expanded state
export function toggleAriaExpanded(element: HTMLElement) {
  const current = element.getAttribute('aria-expanded') === 'true';
  element.setAttribute('aria-expanded', String(!current));
}

// Add live region for dynamic updates
export function createLiveRegion(priority: 'polite' | 'assertive' = 'polite'): HTMLDivElement {
  const region = document.createElement('div');
  region.setAttribute('aria-live', priority);
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';
  document.body.appendChild(region);
  return region;
}

// Remove live region
export function removeLiveRegion(region: HTMLDivElement) {
  if (region && region.parentNode) {
    region.parentNode.removeChild(region);
  }
}

// Keyboard navigation helpers
export function handleArrowKeyNavigation(
  e: KeyboardEvent,
  items: HTMLElement[],
  orientation: 'horizontal' | 'vertical' = 'horizontal'
): number | null {
  const currentIndex = items.findIndex((item) => item === document.activeElement);
  if (currentIndex === -1) return null;

  let nextIndex = currentIndex;

  const isNext = orientation === 'horizontal' ? e.key === 'ArrowRight' : e.key === 'ArrowDown';

  const isPrev = orientation === 'horizontal' ? e.key === 'ArrowLeft' : e.key === 'ArrowUp';

  if (isNext) {
    nextIndex = (currentIndex + 1) % items.length;
  } else if (isPrev) {
    nextIndex = (currentIndex - 1 + items.length) % items.length;
  } else if (e.key === 'Home') {
    nextIndex = 0;
  } else if (e.key === 'End') {
    nextIndex = items.length - 1;
  } else {
    return null;
  }

  e.preventDefault();
  items[nextIndex]?.focus();
  return nextIndex;
}

// React Hooks for accessibility

// Focus Trap Hook
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const cleanup = trapFocus(container);
    return cleanup;
  }, [containerRef, isActive]);
}

// Keyboard Shortcuts Hook
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
  category?: string;
}

/**
 * TODO: Add function documentation
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (!shortcut.key || !event.key) continue;
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrl
          ? event.ctrlKey
          : !event.ctrlKey || event.key === 'Control';
        const matchesShift = shortcut.shift
          ? event.shiftKey
          : !event.shiftKey || event.key === 'Shift';
        const matchesAlt = shortcut.alt ? event.altKey : !event.altKey || event.key === 'Alt';
        const matchesMeta = shortcut.meta ? event.metaKey : !event.metaKey || event.key === 'Meta';

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
          event.preventDefault();
          shortcut.handler(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// Focus Return Hook
export function useFocusReturn() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && previousFocusRef.current.focus) {
      previousFocusRef.current.focus();
    }
  }, []);

  return { saveFocus, restoreFocus };
}

// Reduced Motion Detection Hook
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Dialog Accessibility Hook
export function useDialogAccessibility(
  dialogRef: React.RefObject<HTMLElement>,
  isOpen: boolean,
  onClose: () => void
) {
  const { saveFocus, restoreFocus } = useFocusReturn();

  useEffect(() => {
    if (isOpen) {
      saveFocus();
      announce('Dialog opened');
    } else {
      restoreFocus();
      announce('Dialog closed');
    }
  }, [isOpen, saveFocus, restoreFocus]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useFocusTrap(dialogRef, isOpen);
}

// Loading Announcement Hook
export function useLoadingAnnouncement(isLoading: boolean, message: string = 'Loading') {
  useEffect(() => {
    if (isLoading) {
      announce(`${message}, please wait`, 'polite');
    }
  }, [isLoading, message]);
}

// Roving TabIndex Hook for Lists
export function useRovingTabIndex(
  itemsRef: React.RefObject<HTMLElement[]>,
  orientation: 'horizontal' | 'vertical' | 'both' = 'vertical'
) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const items = itemsRef.current;
    if (!items) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentIndex = items.findIndex((item) => item === document.activeElement);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault();
            nextIndex = Math.max(0, currentIndex - 1);
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault();
            nextIndex = Math.min(items.length - 1, currentIndex + 1);
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault();
            nextIndex = Math.max(0, currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault();
            nextIndex = Math.min(items.length - 1, currentIndex + 1);
          }
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = items.length - 1;
          break;
      }

      if (nextIndex !== currentIndex) {
        setFocusedIndex(nextIndex);
        items[nextIndex]?.focus();
      }
    };

    items.forEach((item) => {
      item.addEventListener('keydown', handleKeyDown);
    });

    return () => {
      items.forEach((item) => {
        item.removeEventListener('keydown', handleKeyDown);
      });
    };
  }, [itemsRef, orientation]);

  return focusedIndex;
}
