import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { api, errorMessage } from "../api/client.ts";
import type { Category, MenuItem, Order, Reservation } from "../api/types.ts";
import { useAuth } from "../auth/AuthContext.tsx";
import { Field } from "../components/Field.tsx";
import {
  formatDate,
  formatPrice,
  orderStatusLabel,
  orderStatuses,
  reservationStatusLabel,
  reservationStatuses,
} from "../lib/format.ts";

type Tab = "menu" | "orders" | "reservations";

const emptyItem = {
  categoryId: "",
  name: "",
  description: "",
  ingredients: "",
  imageUrl: "",
  price: 0,
  isAvailable: true,
};

export function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("menu");
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [error, setError] = useState("");

  const loadMenu = async () => {
    const [categoryResponse, itemResponse] = await Promise.all([
      api.get<Category[]>("/api/categories"),
      api.get<MenuItem[]>("/api/menu-items"),
    ]);
    setCategories(categoryResponse.data);
    setItems(itemResponse.data);
    setItemForm((current) => ({
      ...current,
      categoryId: current.categoryId || categoryResponse.data[0]?.id || "",
    }));
  };

  useEffect(() => {
    if (user?.role !== "Admin") return;
    loadMenu().catch((reason) => setError(errorMessage(reason, "منو بارگذاری نشد.")));
    api.get<Order[]>("/api/orders").then((response) => setOrders(response.data)).catch(() => undefined);
    api
      .get<Reservation[]>("/api/reservations")
      .then((response) => setReservations(response.data))
      .catch(() => undefined);
  }, [user]);

  if (user?.role !== "Admin") {
    return <p className="panel">این بخش فقط برای مدیر رستوران است.</p>;
  }

  const createCategory = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await api.post("/api/categories", {
        name: categoryName,
        description: categoryDescription,
        sortOrder,
      });
      setCategoryName("");
      setCategoryDescription("");
      await loadMenu();
    } catch (reason) {
      setError(errorMessage(reason, "دسته ذخیره نشد."));
    }
  };

  const removeCategory = async (id: string) => {
    setError("");
    try {
      await api.delete(`/api/categories/${id}`);
      await loadMenu();
    } catch (reason) {
      setError(errorMessage(reason, "دسته حذف نشد."));
    }
  };

  const saveItem = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const payload = {
      ...itemForm,
      imageUrl: itemForm.imageUrl || null,
      ingredients: itemForm.ingredients,
    };
    try {
      if (editingItemId) await api.put(`/api/menu-items/${editingItemId}`, payload);
      else await api.post("/api/menu-items", payload);
      setEditingItemId(null);
      setItemForm({ ...emptyItem, categoryId: categories[0]?.id ?? "" });
      await loadMenu();
    } catch (reason) {
      setError(errorMessage(reason, "غذا ذخیره نشد."));
    }
  };

  const editItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description ?? "",
      ingredients: item.ingredients ?? "",
      imageUrl: item.imageUrl ?? "",
      price: item.price,
      isAvailable: item.isAvailable,
    });
  };

  const removeItem = async (id: string) => {
    setError("");
    try {
      await api.delete(`/api/menu-items/${id}`);
      await loadMenu();
    } catch (reason) {
      setError(errorMessage(reason, "غذا حذف نشد."));
    }
  };

  const updateOrder = async (id: string, status: string) => {
    const { data } = await api.patch<Order>(`/api/orders/${id}/status`, { status });
    setOrders((current) => current.map((order) => (order.id === id ? data : order)));
  };

  const updateReservation = async (id: string, status: string) => {
    const { data } = await api.patch<Reservation>(`/api/reservations/${id}/status`, { status });
    setReservations((current) => current.map((item) => (item.id === id ? data : item)));
  };

  return (
    <section className="stack">
      <h1>مدیریت رستوران</h1>
      <div className="chips">
        <button type="button" className={tab === "menu" ? "chip active" : "chip"} onClick={() => setTab("menu")}>
          منو
        </button>
        <button type="button" className={tab === "orders" ? "chip active" : "chip"} onClick={() => setTab("orders")}>
          سفارش‌ها
        </button>
        <button
          type="button"
          className={tab === "reservations" ? "chip active" : "chip"}
          onClick={() => setTab("reservations")}
        >
          رزروها
        </button>
      </div>
      {error && <p className="alert">{error}</p>}

      {tab === "menu" && (
        <div className="split-page">
          <div className="stack">
            <form className="panel" onSubmit={createCategory}>
              <h2>دسته جدید</h2>
              <Field label="نام">
                <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required />
              </Field>
              <Field label="توضیح">
                <input value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} />
              </Field>
              <Field label="ترتیب">
                <input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} />
              </Field>
              <button className="btn" type="submit">
                افزودن دسته
              </button>
            </form>
            {categories.map((category) => (
              <article key={category.id} className="row-card">
                <div>
                  <strong>{category.name}</strong>
                  <p>{category.description}</p>
                </div>
                <div className="icon-actions">
                  <IconButton label="حذف" danger onClick={() => removeCategory(category.id)}>
                    <TrashIcon />
                  </IconButton>
                </div>
              </article>
            ))}
          </div>
          <div className="stack">
            <form className="panel" onSubmit={saveItem}>
              <h2>{editingItemId ? "ویرایش غذا" : "غذای جدید"}</h2>
              <Field label="دسته">
                <select
                  value={itemForm.categoryId}
                  onChange={(event) => setItemForm({ ...itemForm, categoryId: event.target.value })}
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="نام">
                <input
                  value={itemForm.name}
                  onChange={(event) => setItemForm({ ...itemForm, name: event.target.value })}
                  required
                />
              </Field>
              <Field label="توضیح">
                <input
                  value={itemForm.description}
                  onChange={(event) => setItemForm({ ...itemForm, description: event.target.value })}
                />
              </Field>
              <Field label="محتویات">
                <textarea
                  rows={3}
                  value={itemForm.ingredients}
                  onChange={(event) => setItemForm({ ...itemForm, ingredients: event.target.value })}
                />
              </Field>
              <Field label="قیمت (تومان)">
                <input
                  type="number"
                  min={0}
                  value={itemForm.price}
                  onChange={(event) => setItemForm({ ...itemForm, price: Number(event.target.value) })}
                  required
                />
              </Field>
              <label className="check">
                <input
                  type="checkbox"
                  checked={itemForm.isAvailable}
                  onChange={(event) => setItemForm({ ...itemForm, isAvailable: event.target.checked })}
                />
                موجود است
              </label>
              <button className="btn" type="submit">
                ذخیره غذا
              </button>
            </form>
            {items.map((item) => (
              <article key={item.id} className="row-card">
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    {item.categoryName} · {formatPrice(item.price)} · {item.isAvailable ? "موجود" : "ناموجود"}
                  </p>
                </div>
                <div className="icon-actions">
                  <IconButton label="ویرایش" onClick={() => editItem(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton label="حذف" danger onClick={() => removeItem(item.id)}>
                    <TrashIcon />
                  </IconButton>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" &&
        orders.map((order) => (
          <article key={order.id} className="panel">
            <div className="split">
              <div>
                <strong>{order.customerName}</strong>
                <p className="muted">{formatDate(order.createdAt)}</p>
              </div>
              <select value={order.status} onChange={(event) => updateOrder(order.id, event.target.value)}>
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {orderStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
            <p>{order.items.map((item) => `${item.itemName} × ${item.quantity}`).join("، ")}</p>
            <b>{formatPrice(order.total)}</b>
          </article>
        ))}

      {tab === "reservations" &&
        reservations.map((item) => (
          <article key={item.id} className="panel">
            <div className="split">
              <div>
                <strong>{item.guestName}</strong>
                <p>
                  {formatDate(item.reservedFor)} · {item.partySize} نفر · {item.phone}
                </p>
              </div>
              <select value={item.status} onChange={(event) => updateReservation(item.id, event.target.value)}>
                {reservationStatuses.map((status) => (
                  <option key={status} value={status}>
                    {reservationStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
            <span className={`badge ${item.status.toLowerCase()}`}>{reservationStatusLabel(item.status)}</span>
          </article>
        ))}
    </section>
  );
}

function IconButton({
  label,
  danger,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={danger ? "icon-btn danger" : "icon-btn"}
      aria-label={label}
      data-tooltip={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13.5 6.5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
