import { useEffect, useState } from "react";
import { api, errorMessage } from "../api/client.ts";
import type { Order } from "../api/types.ts";
import { formatDate, formatPrice, orderStatusLabel } from "../lib/format.ts";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Order[]>("/api/orders")
      .then((response) => setOrders(response.data))
      .catch((reason) => setError(errorMessage(reason, "سفارش‌ها بارگذاری نشد.")));
  }, []);

  return (
    <section className="stack">
      <h1>سفارش‌ها</h1>
      {error && <p className="alert">{error}</p>}
      {orders.length === 0 && !error && <p className="muted">هنوز سفارشی ثبت نشده است.</p>}
      {orders.map((order) => (
        <article key={order.id} className="panel">
          <div className="split">
            <div>
              <strong>{formatDate(order.createdAt)}</strong>
              <p className="muted">{order.customerName}</p>
            </div>
            <span className={`badge ${order.status.toLowerCase()}`}>{orderStatusLabel(order.status)}</span>
          </div>
          <ul>
            {order.items.map((item) => (
              <li key={`${order.id}-${item.menuItemId}`}>
                {item.itemName} × {item.quantity}
              </li>
            ))}
          </ul>
          {order.note && <p>توضیح: {order.note}</p>}
          <b>{formatPrice(order.total)}</b>
        </article>
      ))}
    </section>
  );
}
