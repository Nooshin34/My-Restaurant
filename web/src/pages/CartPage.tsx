import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { api, errorMessage } from "../api/client.ts";
import { useAuth } from "../auth/AuthContext.tsx";
import { useCart } from "../cart/CartContext.tsx";
import { formatPrice } from "../lib/format.ts";

export function CartPage() {
  const { lines, total, setQuantity, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!user) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    setBusy(true);
    try {
      await api.post("/api/orders", {
        note,
        items: lines.map((line) => ({ menuItemId: line.menuItemId, quantity: line.quantity })),
      });
      clear();
      navigate("/orders");
    } catch (reason) {
      if (axios.isAxiosError(reason) && reason.response?.status === 401) {
        navigate("/login", { state: { from: "/cart" } });
        return;
      }
      setError(errorMessage(reason, "ثبت سفارش انجام نشد."));
    } finally {
      setBusy(false);
    }
  };

  if (lines.length === 0) {
    return (
      <section className="panel">
        <h1>سبد خالی است</h1>
        <p>از منو چند غذا انتخاب کنید.</p>
        <Link to="/" className="btn">
          بازگشت به منو
        </Link>
      </section>
    );
  }

  return (
    <section className="stack">
      <h1>سبد خرید</h1>
      {lines.map((line) => (
        <article key={line.menuItemId} className="row-card">
          <div>
            <strong>{line.name}</strong>
            <p>{formatPrice(line.price)}</p>
          </div>
          <div className="qty">
            <button type="button" onClick={() => setQuantity(line.menuItemId, line.quantity - 1)}>
              −
            </button>
            <span>{line.quantity}</span>
            <button type="button" onClick={() => setQuantity(line.menuItemId, line.quantity + 1)}>
              +
            </button>
          </div>
          <b>{formatPrice(line.price * line.quantity)}</b>
        </article>
      ))}
      <label className="field">
        <span>توضیح برای آشپزخانه</span>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
      </label>
      {error && <p className="alert">{error}</p>}
      <div className="checkout">
        <strong>جمع: {formatPrice(total)}</strong>
        <button type="button" className="btn" disabled={busy} onClick={submit}>
          {busy ? "در حال ثبت..." : "ثبت سفارش"}
        </button>
      </div>
    </section>
  );
}
