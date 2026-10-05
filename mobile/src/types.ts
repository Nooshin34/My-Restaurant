export type User = {
  id: string;
  fullName: string;
  email: string;
  role: "Admin" | "Customer";
};

export type AuthResponse = {
  token: string;
  expiresAt: string;
  user: User;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  imageUrl: string | null;
};

export type Order = {
  id: string;
  customerName: string;
  status: string;
  total: number;
  note: string | null;
  createdAt: string;
  items: { menuItemId: string; itemName: string; unitPrice: number; quantity: number }[];
};

export type Reservation = {
  id: string;
  guestName: string;
  phone: string;
  partySize: number;
  reservedFor: string;
  note: string | null;
  status: string;
};

export type CartLine = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};
