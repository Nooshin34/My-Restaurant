import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartLine = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (line: Omit<CartLine, "quantity">) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "myrestaurant.cart";
const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const add = (line: Omit<CartLine, "quantity">) => {
    setLines((current) => {
      const existing = current.find((item) => item.menuItemId === line.menuItemId);
      if (!existing) return [...current, { ...line, quantity: 1 }];
      return current.map((item) =>
        item.menuItemId === line.menuItemId
          ? { ...item, quantity: Math.min(item.quantity + 1, 20) }
          : item,
      );
    });
  };

  const setQuantity = (menuItemId: string, quantity: number) => {
    setLines((current) => {
      if (quantity <= 0) return current.filter((item) => item.menuItemId !== menuItemId);
      return current.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity: Math.min(quantity, 20) } : item,
      );
    });
  };

  const clear = () => setLines([]);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  return (
    <CartContext.Provider value={{ lines, count, total, add, setQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
