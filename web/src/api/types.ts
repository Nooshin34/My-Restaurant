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

export type OrderItem = {
  menuItemId: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  userId: string;
  customerName: string;
  status: string;
  total: number;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
};

export type Reservation = {
  id: string;
  userId: string;
  guestName: string;
  phone: string;
  partySize: number;
  reservedFor: string;
  note: string | null;
  status: string;
  createdAt: string;
};
