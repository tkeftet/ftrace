/**
 * useCartManager
 *
 * Encapsulates all cart-mutation logic that previously lived inline inside
 * OrdersPage. Extracting it here:
 *  - keeps the page component responsible only for layout/composition,
 *  - makes cart operations independently testable,
 *  - ensures each updater is stable across renders via useCallback (no
 *    unnecessary re-renders in child components that receive them as props).
 */
import { useCallback, useMemo, useState } from "react";
import type { MenuItem } from "@/api/endpoints/menu.api";
import type { CartItem } from "../../components/orders/orderConstants";

export interface CartManager {
  cart: CartItem[];
  customerName: string;
  setCustomerName: (name: string) => void;
  /** Add one unit of a menu item; increments quantity if already present. */
  addToCart: (item: MenuItem) => void;
  /** Decrement one unit; removes the item when quantity reaches 0. */
  removeOne: (menuItemId: string) => void;
  /** Apply an arbitrary +/- delta; clamps minimum quantity to 1. */
  changeQty: (menuItemId: string, delta: number) => void;
  changeNotes: (menuItemId: string, notes: string) => void;
  removeFromCart: (menuItemId: string) => void;
  /** Reset cart and customer name (called after a successful order submit). */
  clearCart: () => void;
  /** Sum of (price × quantity) for every cart line. */
  total: number;
  /** Sum of all quantities. */
  count: number;
}

export function useCartManager(): CartManager {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item._id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [
        ...prev,
        {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          target: item.target,
          quantity: 1,
          notes: "",
        },
      ];
    });
  }, []);

  const removeOne = useCallback((menuItemId: string) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c,
        )
        .filter((c) => c.quantity > 0),
    );
  }, []);

  const changeQty = useCallback((menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItemId === menuItemId
            ? { ...c, quantity: Math.max(1, c.quantity + delta) }
            : c,
        )
        .filter((c) => c.quantity > 0),
    );
  }, []);

  const changeNotes = useCallback((menuItemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((c) => (c.menuItemId === menuItemId ? { ...c, notes } : c)),
    );
  }, []);

  const removeFromCart = useCallback((menuItemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCustomerName("");
  }, []);

  // Derived values are memoized so downstream consumers only re-render when
  // the cart array reference actually changes.
  const { total, count } = useMemo(
    () => ({
      total: cart.reduce((sum, c) => sum + c.price * c.quantity, 0),
      count: cart.reduce((sum, c) => sum + c.quantity, 0),
    }),
    [cart],
  );

  return {
    cart,
    customerName,
    setCustomerName,
    addToCart,
    removeOne,
    changeQty,
    changeNotes,
    removeFromCart,
    clearCart,
    total,
    count,
  };
}
