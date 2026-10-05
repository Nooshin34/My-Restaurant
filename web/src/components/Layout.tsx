import type { ReactNode } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.tsx";
import { useCart } from "../cart/CartContext.tsx";

export function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="mark">ر</span>
          <span>
            <strong>رستوران من</strong>
            <small>MY RESTAURANT</small>
          </span>
        </NavLink>
        <nav>
          <NavLink to="/" end>
            منو
          </NavLink>
          <NavLink to="/cart">
            سبد
            {count > 0 && <em>{count}</em>}
          </NavLink>
          <NavLink to="/orders">سفارش‌ها</NavLink>
          <NavLink to="/reservations">رزرو میز</NavLink>
          {user?.role === "Admin" && <NavLink to="/admin">مدیریت</NavLink>}
        </nav>
        <div className="account">
          {user ? (
            <>
              <span>{user.fullName}</span>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                خروج
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn">
              ورود
            </NavLink>
          )}
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <p className="muted">در حال بررسی نشست...</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
