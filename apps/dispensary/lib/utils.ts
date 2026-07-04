import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Format a dollar amount. */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

/** Relative time string, e.g. "3 minutes ago". */
export function timeAgo(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

/** Format date to readable string. */
export function formatDate(dateString: string, pattern = 'MMM d, yyyy h:mm a'): string {
  return format(new Date(dateString), pattern);
}

/** Title-case a snake_case or space-separated string. */
export function toTitleCase(str: string): string {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
