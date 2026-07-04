import { useCartStore } from '@/store/cart.store';

/**
 * Convenience hook for cart state + actions.
 */
export function useCart() {
  const items = useCartStore((s) => s.items);
  const dispensaryId = useCartStore((s) => s.dispensaryId);
  const itemCount = useCartStore((s) => s.itemCount);
  const subtotal = useCartStore((s) => s.subtotal);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  return { items, dispensaryId, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart };
}
