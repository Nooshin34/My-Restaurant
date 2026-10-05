import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { errorMessage } from "../api/client.ts";
import { useAuth } from "../auth/AuthContext.tsx";
import { Field } from "../components/Field.tsx";

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [email, setEmail] = useState("customer@myrestaurant.local");
  const [password, setPassword] = useState("Customer123!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (reason) {
      setError(errorMessage(reason, "ورود انجام نشد."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel narrow" onSubmit={submit}>
      <h1>ورود</h1>
      <Field label="ایمیل">
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </Field>
      <Field label="رمز عبور">
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </Field>
      {error && <p className="alert">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "در حال ورود..." : "ورود"}
      </button>
      <p className="muted">
        حساب ندارید؟ <Link to="/register">ثبت‌نام</Link>
      </p>
    </form>
  );
}
