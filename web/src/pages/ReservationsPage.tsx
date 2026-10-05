import { useEffect, useState, type FormEvent } from "react";
import { api, errorMessage } from "../api/client.ts";
import type { Reservation } from "../api/types.ts";
import { useAuth } from "../auth/AuthContext.tsx";
import { Field } from "../components/Field.tsx";
import { formatDate, reservationStatusLabel } from "../lib/format.ts";

export function ReservationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Reservation[]>([]);
  const [guestName, setGuestName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [reservedFor, setReservedFor] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    api
      .get<Reservation[]>("/api/reservations")
      .then((response) => setItems(response.data))
      .catch((reason) => setError(errorMessage(reason, "رزروها بارگذاری نشد.")));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/api/reservations", {
        guestName,
        phone,
        partySize,
        reservedFor: new Date(reservedFor).toISOString(),
        note,
      });
      setNote("");
      load();
    } catch (reason) {
      setError(errorMessage(reason, "رزرو ثبت نشد."));
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (id: string) => {
    await api.post(`/api/reservations/${id}/cancel`);
    load();
  };

  return (
    <section className="split-page">
      <form className="panel" onSubmit={submit}>
        <h1>رزرو میز</h1>
        <Field label="نام مهمان">
          <input value={guestName} onChange={(event) => setGuestName(event.target.value)} required />
        </Field>
        <Field label="شماره تماس">
          <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
        </Field>
        <Field label="تعداد نفرات">
          <input
            type="number"
            min={1}
            max={20}
            value={partySize}
            onChange={(event) => setPartySize(Number(event.target.value))}
            required
          />
        </Field>
        <Field label="زمان">
          <input type="datetime-local" value={reservedFor} onChange={(event) => setReservedFor(event.target.value)} required />
        </Field>
        <Field label="توضیح">
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
        </Field>
        {error && <p className="alert">{error}</p>}
        <button className="btn" disabled={busy} type="submit">
          {busy ? "در حال ثبت..." : "درخواست رزرو"}
        </button>
      </form>
      <div className="stack">
        {items.length === 0 && <p className="muted">رزروی ندارید.</p>}
        {items.map((item) => (
          <article key={item.id} className="panel">
            <div className="split">
              <strong>{item.guestName}</strong>
              <span className={`badge ${item.status.toLowerCase()}`}>{reservationStatusLabel(item.status)}</span>
            </div>
            <p>
              {formatDate(item.reservedFor)} · {item.partySize} نفر · {item.phone}
            </p>
            {item.note && <p>{item.note}</p>}
            {item.status !== "Cancelled" && (
              <button type="button" className="btn btn-ghost" onClick={() => cancel(item.id)}>
                لغو
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
