import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Product } from "../backend.d";

/* ============================================
   TYPES
   ============================================ */

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: bigint) => void;
  updateQuantity: (productId: bigint, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: bigint;
}

/* ============================================
   CONTEXT
   ============================================ */

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "velmora_cart";

function serializeCart(items: CartItem[]): string {
  return JSON.stringify(
    items.map((item) => ({
      product: {
        ...item.product,
        id: item.product.id.toString(),
        price: item.product.price.toString(),
      },
      quantity: item.quantity,
    })),
  );
}

interface SerializedCartItem {
  product: {
    id: string;
    price: string;
    name: string;
    description: string;
    isFeatured: boolean;
    category: string;
  };
  quantity: number;
}

function deserializeCart(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw) as SerializedCartItem[];
    return parsed.map((item) => ({
      product: {
        ...item.product,
        id: BigInt(item.product.id),
        price: BigInt(item.product.price),
        category: item.product.category as import("../backend.d").Category,
      },
      quantity: item.quantity,
    }));
  } catch {
    return [];
  }
}

/* ============================================
   PROVIDER
   ============================================ */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? deserializeCart(raw) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeCart(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: bigint) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: bigint, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * BigInt(item.quantity),
    0n,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ============================================
   HOOK
   ============================================ */

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
