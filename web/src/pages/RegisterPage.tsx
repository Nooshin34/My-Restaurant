import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errorMessage } from "../api/client.ts";
import { useAuth } from "../auth/AuthContext.tsx";
import { Field } from "../components/Field.tsx";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(fullName, email, password);
      navigate("/");
    } catch (reason) {
      setError(errorMessage(reason, "ثبت‌نام انجام نشد."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel narrow" onSubmit={submit}>
      <h1>ثبت‌نام</h1>
      <Field label="نام">
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      </Field>
      <Field label="ایمیل">
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </Field>
      <Field label="رمز عبور">
        <input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
      </Field>
      {error && <p className="alert">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "در حال ساخت حساب..." : "ساخت حساب"}
      </button>
      <p className="muted">
        حساب دارید؟ <Link to="/login">ورود</Link>
      </p>
    </form>
  );
}
