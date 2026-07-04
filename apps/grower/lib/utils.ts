import { clsx, type ClassValue } from 'clsx';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]): string { return clsx(inputs); }
export function formatDate(d: string, p = 'MMM d, yyyy'): string { return format(new Date(d), p); }
export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}
