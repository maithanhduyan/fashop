"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "@/lib/api";
import type { Cart } from "@/lib/types";
import { useAuth } from "./auth-context";

interface CartCtx {
  cart: Cart | null;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: number, qty: number) => Promise<void>;
  updateItem: (itemId: number, qty: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartCtx>({
  cart: null,
  loading: false,
  refresh: async () => {},
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clear: async () => {},
  itemCount: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const c = await api.getCart();
      setCart(c);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) refresh();
    else setCart(null);
  }, [user, refresh]);

  const addItem = useCallback(
    async (productId: number, qty: number) => {
      await api.addToCart(productId, qty);
      await refresh();
    },
    [refresh],
  );

  const updateItem = useCallback(
    async (itemId: number, qty: number) => {
      await api.updateCartItem(itemId, qty);
      await refresh();
    },
    [refresh],
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      await api.removeCartItem(itemId);
      await refresh();
    },
    [refresh],
  );

  const clear = useCallback(async () => {
    await api.clearCart();
    await refresh();
  }, [refresh]);

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, loading, refresh, addItem, updateItem, removeItem, clear, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
