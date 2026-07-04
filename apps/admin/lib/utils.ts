import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);
export const formatDate = (d: string, p = 'MMM d, yyyy') => format(new Date(d), p);
export const timeAgo = (d: string) => formatDistanceToNow(new Date(d), { addSuffix: true });
export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
