import { create } from 'zustand';
import { CartItem, Product } from '@/types';

interface CartState {
  dispensaryId: string | null;
  items: CartItem[];

  // Derived
  itemCount: number;
  subtotal: number;

  // Actions
  addItem: (product: Product, dispensaryId: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

function computeSubtotal(items: CartItem[]): number {
  return items.reduce((sum, { product, quantity }) => sum + product.pricePerUnit * quantity, 0);
}

export const useCartStore = create<CartState>((set, get) => ({
  dispensaryId: null,
  items: [],
  itemCount: 0,
  subtotal: 0,

  addItem: (product, dispensaryId) => {
    const { items, dispensaryId: currentDispensaryId } = get();

    // If adding from a different dispensary, clear cart first
    if (currentDispensaryId && currentDispensaryId !== dispensaryId) {
      set({
        dispensaryId,
        items: [{ product, quantity: 1 }],
        itemCount: 1,
        subtotal: product.pricePerUnit,
      });
      return;
    }

    const existing = items.find((i) => i.product.id === product.id);
    const updated = existing
      ? items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      : [...items, { product, quantity: 1 }];

    set({
      dispensaryId,
      items: updated,
      itemCount: updated.reduce((n, i) => n + i.quantity, 0),
      subtotal: computeSubtotal(updated),
    });
  },

  removeItem: (productId) => {
    const updated = get().items.filter((i) => i.product.id !== productId);
    set({
      items: updated,
      itemCount: updated.reduce((n, i) => n + i.quantity, 0),
      subtotal: computeSubtotal(updated),
      dispensaryId: updated.length === 0 ? null : get().dispensaryId,
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const updated = get().items.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i,
    );
    set({
      items: updated,
      itemCount: updated.reduce((n, i) => n + i.quantity, 0),
      subtotal: computeSubtotal(updated),
    });
  },

  clearCart: () => set({ dispensaryId: null, items: [], itemCount: 0, subtotal: 0 }),
}));
